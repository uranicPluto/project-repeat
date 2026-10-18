# Testing Strategy & Test Suite Guide

**Test Runner**: Vitest v3.2.7  
**Test Suites**: 12 test files  
**Total Tests**: **46 passing (0 failures)**  
**Execution Command**: `npm run test`

---

## 1. Test Suite Catalog

### Suite 1: Concurrency & Race Prevention (`tests/unit/concurrency-race.test.ts`)
- **Simultaneous Verification Race**: Proves that when two concurrent requests race to verify the same single-use code, exactly one succeeds and the concurrent request fails without awarding duplicate stamps.
- **Tenant Isolation of Verification Codes**: Proves looking up a code belonging to Business B from Business A fails.
- **Duplicate Redemption Race Defense**: Proves that unique database constraint `@@unique([enrollmentId, rewardId, cycle])` physically rejects duplicate milestone redemptions in the same cycle.
- **Expired Code Rejection**: Asserts expired codes transition to `EXPIRED` status without mutating customer stamps.

### Suite 2: Non-Destructive Program Updates (`tests/unit/non-destructive-rewards.test.ts`)
- **Historical Redemption Preservation**: Tests that updating or deleting rewards in card builder never cascade-deletes customer redemption records.
- **Reward Archival**: Retired rewards are preserved with `isActive = false` so historical references remain valid.

### Suite 3: Live Authorization & Revocation (`tests/unit/live-authorization-revocation.test.ts`)
- **Active Staff Access**: Permits staff with active database memberships.
- **Revoked Staff Rejection**: Rejects staff whose business membership was revoked, even if their 7-day JWT has not expired.
- **Suspended Account Defense**: Prohibits suspended accounts from performing operations.
- **Cross-Tenant Breach**: Denies staff access to other tenant resources.

### Suite 4: Billing Lifecycle & Plan Limits (`tests/unit/billing-lifecycle.test.ts`)
- **Staff Plan Limits**: Enforces `maxStaff` limits across Starter, Growth, and Pro tiers.
- **Customer Capacity Limits**: Enforces `maxMembers` limits across subscription tiers.
- **Timing-Safe Webhook Signatures**: Validates HMAC SHA-256 webhook signatures using `crypto.timingSafeEqual`.
- **Payment Signatures**: Verifies client-side checkout signatures (`orderId|paymentId`).

### Suite 5: Privacy, Consent & Anonymization (`tests/unit/privacy-compliance.test.ts`)
- **Anonymized Deletion Logs**: Asserts account deletion audit records do NOT store plaintext email addresses.
- **Marketing Opt-Out Suppression**: Proves `NotificationService` blocks marketing emails/SMS when the customer has not consented.
- **Transactional Alert Delivery**: Confirms critical security alerts and stamp notifications bypass marketing suppression.

### Suite 6: Repeatable Cycles & Lifetime Accounting (`tests/unit/repeatable-cycles.test.ts`)
- **Sequential Stamp Accrual**: Verifies stamp increments from 0 up to card completion without premature rollovers.
- **Card Completion**: Asserts `hasReachedCardCompletion` evaluates to `true` when `newStamps === totalStamps`.
- **Automatic Rollover to Cycle 2**: Tests that subsequent visits after completion trigger cycle rollover (`currentCycle: 2`), reset stamps to 1, and increment cumulative `lifetimeStamps`.
- **Per-Cycle Reward Scoping**: Verifies that redemptions in Cycle 1 do not block eligible rewards from being redeemed again in Cycle 2.

### Suite 7: Reward Expiry & Eligibility (`tests/unit/reward-expiry.test.ts`)
- **Valid Window Redemption**: Confirms redemption is approved when stamps are met within `validityDays`.
- **Stamp Underflow Protection**: Rejects redemptions when current stamps are below milestone threshold.
- **Validity Window Expiration**: Confirms rewards unlocked past `validityDays` are rejected with `"Reward expired"`.

### Suite 8: Security Hardening & Tenant Isolation (`tests/unit/security-hardening.test.ts`)
- **Session Secret Enforcement**: Asserts that missing or short `< 32 char` `SESSION_SECRET` throws a fatal configuration error in production.
- **IDOR Boundary Defense**: Confirms that accessing or mutating a different `businessId` throws `AuthorizationError` (403).
- **Billing Role Lockdown**: Asserts that staff accounts are blocked from OWNER-only billing endpoints.
- **Self-Revocation Prohibition**: Confirms business owners cannot revoke their own ownership.

### Suite 9: Role-Based Access Control (`tests/unit/permissions-rbac.test.ts`)
- **Unauthenticated Rejection**: Asserts `requireAuth` throws 401 when session is null.
- **Platform Admin Enforcement**: Ensures `/platform-admin` blocks non-admins with 403.
- **Staff Access Scoping**: Confirms staff members can access counter terminal for their assigned business only.
- **Cross-Tenant Isolation**: Prohibits users from Business A from querying Business B resources.
- **Platform Admin Elevation**: Audits platform-level support access.

### Suite 10: Zod Schema Validation (`tests/unit/validation.test.ts`)
- **Customer Registration**: Validates email format, name length, and password rules.
- **Business Registration**: Validates category, company name, and slug format.
- **Loyalty Program**: Validates total stamp range (3 to 30) and reward thresholds.
- **Verification Codes**: Enforces exact 6-digit numeric pattern (`/^\d{6}$/`).

### Suite 11: Domain Calculations & Plan Entitlements (`tests/unit/loyalty-engine.test.ts`)
- **Progress Percentages**: Tests mathematical rounding and caps at 100%.
- **Next Milestone Distance**: Correctly computes remaining stamps to next perk.
- **Repeat Customer Rate**: Validates percentage of patrons with $\ge 2$ visits.
- **Catalog Entitlements**: Validates member and staff caps for Starter, Growth, and Pro tiers.

### Suite 12: Cryptographic Security & Tokens (`tests/unit/security-tokens.test.ts`)
- **Bcrypt Hashing**: Tests salted hashing and timing-safe password comparison.
- **JWT Session Tokens**: Verifies tamper-evident HS256 tokens and claims.
- **Razorpay Signature**: Validates HMAC-SHA256 timing-safe webhook verification.

---

## 2. Test Execution Commands

```bash
# Run complete test suite (single run)
npm run test

# Run tests in interactive watch mode
npm run test:watch

# Run a specific test suite
npx vitest run tests/unit/concurrency-race.test.ts

# Run strict TypeScript compiler verification
npx tsc --noEmit

# Run production build compilation
npm run build

# Run live end-to-end integration test against Supabase PostgreSQL
npm run test:e2e:supabase
```

---

## 3. Live End-to-End Database Integration Suite (`scripts/e2e-flow-test.js`)

Executes against live Supabase PostgreSQL:
- **Tenant Creation**: Creates new `Business` tenant and validates slug routing.
- **Role Assignment**: Creates Owner and Staff members with scoped `BusinessMembership`.
- **Card Lifecycle**: Creates 5-stamp `LoyaltyProgram` and 2 milestone `Reward` records.
- **Customer Journey**: Enrolls customer, issues 6-digit expiring verification code, performs atomic staff CAS verification, awards stamps across multiple visits.
- **Redemption & Concurrency**: Unlocks milestone reward, redeems reward, and physically verifies PostgreSQL compound constraint `@@unique([enrollmentId, rewardId, cycle])` rejects concurrent duplicate redemptions.
- **Card Rollover**: Completes Cycle 1 upon reaching 5 stamps, seamlessly rolling over to Cycle 2 with lifetime stamps preserved.
- **Audit Verification**: Validates 100% relational integrity across all 12 tables with zero data loss.
