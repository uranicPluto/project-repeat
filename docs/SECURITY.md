# Security Architecture & Threat Model Review

**Product**: Project Repeat (House of Workflow)  
**Security Model**: Zero-Trust Multi-Tenant Architecture  
**Audit Status**: Verified Hardened (Phase 2 & Phase 7)

---

## 1. Zero-Trust Server-Side Authorization

### A. Tenant Boundary & IDOR Prevention
1. **Never Trust Client Body IDs**: Request parameters such as `businessId`, `programId`, `enrollmentId`, and `rewardId` are verified server-side against authenticated memberships.
2. **Scoping Updates to Owning Business**: All mutation queries (e.g., updating loyalty programs, deleting staff, redeeming perks) strictly scope by `where: { id, businessId }`.
   - **Remediated Vulnerability (SEC-01)**: `POST /api/loyalty/program` verifies that the `programId` belongs to the caller's authorized `businessId` before updating rewards or program parameters.

### B. Role-Based Access Control (RBAC) Matrix

| Resource / Action | Public / Unauth | Customer | Staff | Manager | Business Owner | Platform Admin |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| View Public Storefront (`/b/:slug`) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Enroll in Loyalty Program | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Generate Expiring Visit Code | ❌ | ✅ (Own) | ❌ | ❌ | ❌ | ❌ |
| Verify Visit at Counter Terminal | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ (Audit) |
| Authorize / Redeem Milestone Perk | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ (Audit) |
| Edit Card Builder & Reward Rules | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ (Audit) |
| Add / Invite Counter Staff | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ (Audit) |
| Revoke / Remove Counter Staff | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ (Audit) |
| View & Switch Billing Plans | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ (Audit) |
| Export Customer CSV Directory | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ (Audit) |
| Platform-Wide Oversight | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Export Personal Data (DPDP/GDPR) | ❌ | ✅ (Own) | ❌ | ❌ | ❌ | ❌ |
| Delete Personal Account (Right to be Forgotten) | ❌ | ✅ (Own) | ❌ | ❌ | ❌ (Must transfer) | ❌ |

---

## 2. Loyalty Verification Anti-Fraud

1. **No Direct Stamp Grants from Public QR**: Scanning the storefront counter QR opens the public landing page (`/b/:slug`). It does not award stamps.
2. **Expiring 6-Digit Counter Codes**:
   - Customer taps "Claim Stamp at Counter" to generate an expiring 6-digit code.
   - Code has a 3-minute TTL (`expiresAt`).
   - Generation invalidates any prior pending codes for that enrollment.
3. **Atomic Single-Use Invalidation**:
   - Verification executes inside an atomic `prisma.$transaction`.
   - Code status transitions from `PENDING` to `VERIFIED` with staff ID and timestamp.
   - Any replay attempt fails immediately with `Invalid or already used verification code`.
4. **Repeatable Cycle Rollover**:
   - When a card reaches `totalStamps`, subsequent visits automatically increment `currentCycle` and start a new card cycle (`currentStamps = 1`), with cumulative stamps recorded in `lifetimeStamps`.

---

## 3. Session & Secret Management

1. **Cryptographic Signing**:
   - Sessions are JSON Web Tokens signed with `HS256` via `jose`.
   - In production (`NODE_ENV === "production"`), `getSessionSecretKey()` strictly enforces that `SESSION_SECRET` is set and at least 32 characters long, preventing forged tokens.
2. **Cookie Security Attributes**:
   - `HttpOnly: true` (Prevents XSS extraction).
   - `Secure: true` in production (Transmitted over HTTPS only).
   - `SameSite: "lax"` (Mitigates CSRF).
   - `MaxAge: 604800` (7-day sliding session).
3. **Password Security**:
   - Salted and hashed using `bcrypt` (10 rounds). Plaintext passwords are never logged or stored.

---

## 4. Privacy & Regulatory Compliance (DPDP & GDPR)

1. **Right to Access & Portability**:
   - `GET /api/privacy/export`: Generates an encrypted, structured JSON export of the customer's personal profile, enrolled cards, visit timestamps, stamp awards, and redemption records.
2. **Right to Erasure (Right to be Forgotten)**:
   - `POST /api/privacy/delete-request`: Requires explicit `"DELETE"` confirmation.
   - Cascading purge erases personal enrollments, verifications, and user account records.
   - Designated business owners are blocked from deleting their account until business ownership is transferred or closed.
3. **Consent Management**:
   - `POST /api/privacy/consent`: Explicit opt-in preferences for promotional marketing are saved to `CustomerConsent` in the database.
4. **Data Minimization**:
   - Counter staff and business owners only see masked customer email addresses (`j***e@domain.com`) in customer directories to protect patron contact privacy.
