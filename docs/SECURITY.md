# Security Architecture & Threat Model Review

**Product**: Project Repeat (House of Workflow)  
**Security Model**: Zero-Trust Multi-Tenant Architecture  
**Audit Status**: VERIFIED HARDENED  
**Verification Date**: October 2026

---

## 1. Zero-Trust Server-Side Authorization

### A. Tenant Boundary & IDOR Prevention
1. **Never Trust Client Body IDs**: Request parameters such as `businessId`, `programId`, `enrollmentId`, and `rewardId` are verified server-side against authenticated memberships.
2. **Scoping Updates to Owning Business**: All mutation queries (e.g., updating loyalty programs, deleting staff, redeeming perks) strictly scope by `where: { id, businessId }`.
   - **Remediated Vulnerability (SEC-01)**: `POST /api/loyalty/program` verifies that the `programId` belongs to the caller's authorized `businessId` before updating rewards or program parameters.

### B. Live Session & Stale Claim Invalidation
1. **Live Database Status Verification**: While JWT tokens provide fast stateless authentication, mutating operations (`verifyVisit`, `redeemReward`, `addStaff`, `revokeStaff`, `updateProgram`, `updateSubscription`) invoke `validateLiveBusinessAccess(session, businessId, allowedRoles)`.
2. **Immediate Staff Revocation**: If an owner revokes a staff member via `DELETE /api/business/staff`, the revoked staff member's unexpired JWT token is immediately rejected upon their next API call because their database membership has been deleted.
3. **Suspended Account Defense**: If a user is marked `status = "SUSPENDED"`, both `/api/auth/me` and all mutating routes reject their requests with 403 Forbidden.

### C. Role-Based Access Control (RBAC) Matrix

| Resource / Action | Public / Unauth | Customer | Staff | Manager | Business Owner | Platform Admin |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| View Public Storefront (`/b/:slug`) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Enroll in Loyalty Program | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Generate Expiring Visit Code | ❌ | ✅ (Own) | ❌ | ❌ | ❌ | ❌ |
| Verify Visit at Counter Terminal | ❌ | ❌ | ✅ (Live) | ✅ (Live) | ✅ (Live) | ✅ (Audit) |
| Authorize / Redeem Milestone Perk | ❌ | ❌ | ✅ (Live) | ✅ (Live) | ✅ (Live) | ✅ (Audit) |
| Edit Card Builder & Reward Rules | ❌ | ❌ | ❌ | ✅ (Live) | ✅ (Live) | ✅ (Audit) |
| Add / Invite Counter Staff | ❌ | ❌ | ❌ | ❌ | ✅ (Live) | ✅ (Audit) |
| Revoke / Remove Counter Staff | ❌ | ❌ | ❌ | ❌ | ✅ (Live) | ✅ (Audit) |
| View & Switch Billing Plans | ❌ | ❌ | ❌ | ❌ | ✅ (Live) | ✅ (Audit) |
| Export Customer CSV Directory | ❌ | ❌ | ❌ | ✅ (Live) | ✅ (Live) | ✅ (Audit) |
| Platform-Wide Oversight | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (Audit) |
| Export Personal Data (DPDP/GDPR) | ❌ | ✅ (Own) | ❌ | ❌ | ❌ | ❌ |
| Delete Personal Account (Right to be Forgotten) | ❌ | ✅ (Own) | ❌ | ❌ | ❌ (Must transfer) | ❌ |

---

## 2. Loyalty Verification Anti-Fraud & Concurrency Controls

1. **No Direct Stamp Grants from Public QR**: Scanning the storefront counter QR opens the public landing page (`/b/:slug`). It never awards stamps.
2. **Cryptographically Secure 6-Digit Codes**:
   - Generated using `crypto.randomInt(100000, 1000000)`.
   - Short 3-minute TTL (`expiresAt = Date.now() + 180000`).
   - Rate limited to maximum 5 code requests per minute per enrollment.
   - Code lookup is strictly scoped to `enrollment: { businessId }`, preventing cross-tenant collisions.
3. **Atomic Single-Use Claim (Race Condition Prevention)**:
   - When a code is verified, the engine executes an atomic conditional update:
     ```ts
     const claim = await tx.visitVerification.updateMany({
       where: { id: verification.id, status: "PENDING" },
       data: { status: "VERIFIED", verifiedByStaffId, verifiedAt: new Date() },
     });
     if (claim.count === 0) throw new Error("Invalid or already used verification code");
     ```
   - If two concurrent requests arrive simultaneously with the same code, exactly one receives `claim.count === 1` and awards a stamp. The concurrent request receives `claim.count === 0` and immediately aborts without awarding duplicate stamps.
4. **Unique Redemption Constraint**:
   - Database unique constraint `@@unique([enrollmentId, rewardId, cycle])` ensures that milestone rewards can only be redeemed once per cycle, physically blocking concurrent double-redemption races.
5. **Non-Destructive Reward Archival**:
   - Updating a loyalty card never hard-deletes `Reward` records with `deleteMany`.
   - Retired rewards are marked `isActive = false`, preserving historical `RewardRedemption` records without cascade deletion.

---

## 3. Session & Secret Management

1. **Cryptographic Signing**:
   - Sessions are JSON Web Tokens signed with `HS256` via `jose`.
   - In production (`NODE_ENV === "production"`), `getSessionSecretKey()` strictly enforces that `SESSION_SECRET` is set and at least 32 characters long, throwing a fatal error on startup if missing.
2. **Cookie Security Attributes**:
   - `HttpOnly: true` (Prevents XSS extraction).
   - `Secure: true` in production (Transmitted over HTTPS only).
   - `SameSite: "lax"` (Mitigates CSRF).
   - `Path: "/"` and `MaxAge: 604800` (7-day session).
3. **Password Security**:
   - Salted and hashed using `bcrypt` (10 rounds). Plaintext passwords are never logged or stored.
4. **Public Demo Credentials Lockdown**:
   - In production mode, authentication against well-known demo accounts (`admin@projectrepeat.com`, `owner@thecoffeehouse.com`, etc.) is strictly blocked unless `ALLOW_DEMO_CREDENTIALS=true` is explicitly provided.
   - `prisma/seed.js` includes a fatal check preventing accidental execution in production environments.

---

## 4. Privacy & Regulatory Compliance (DPDP & GDPR)

1. **Right to Access & Portability**:
   - `GET /api/privacy/export`: Generates a structured JSON export of the customer's personal profile, enrolled cards, visit timestamps, stamp awards, and redemption records.
2. **Right to Erasure (Right to be Forgotten)**:
   - `POST /api/privacy/delete-request`: Requires explicit `"DELETE"` confirmation.
   - Cascading purge erases personal enrollments, verifications, and user account records.
   - Audit logs record the deletion event without preserving plaintext email addresses (`deletedEmail` is stripped).
   - Designated business owners are blocked from deleting their account until business ownership is transferred or closed.
3. **Consent Management**:
   - `POST /api/privacy/consent`: Explicit opt-in preferences for promotional marketing are saved to `CustomerConsent` in the database.
   - `NotificationService.sendNotification` checks consent and suppresses marketing emails/SMS when the customer has opted out, while allowing critical transactional security notices.
4. **Data Minimization**:
   - Customer directories mask customer contact information in staff-facing views.
