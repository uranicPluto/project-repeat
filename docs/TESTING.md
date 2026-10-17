# Testing Strategy & Test Suite Guide

**Test Runner**: Vitest v3.2.7  
**Test Suites**: 7 test files  
**Total Tests**: 30 passing  
**Execution Command**: `npm run test`

---

## 1. Test Suite Catalog

### Suite 1: Repeatable Cycles & Lifetime Accounting (`tests/unit/repeatable-cycles.test.ts`)
- **Sequential Stamp Accrual**: Verifies stamp increments from 0 up to card completion without premature rollovers.
- **Card Completion**: Asserts that `hasReachedCardCompletion` evaluates to `true` when `newStamps === totalStamps`.
- **Automatic Rollover to Cycle 2**: Tests that subsequent visits after completion trigger cycle rollover (`currentCycle: 2`), reset stamps to 1, and increment cumulative `lifetimeStamps`.
- **Per-Cycle Reward Scoping**: Verifies that redemptions in Cycle 1 do not block eligible rewards from being redeemed again in Cycle 2.

### Suite 2: Reward Expiry & Eligibility (`tests/unit/reward-expiry.test.ts`)
- **Valid Window Redemption**: Confirms redemption is approved when stamps are met within `validityDays`.
- **Stamp Underflow Protection**: Rejects redemptions when current stamps are below milestone threshold.
- **Validity Window Expiration**: Confirms rewards unlocked past `validityDays` are rejected with `"Reward expired"`.

### Suite 3: Security Hardening & Tenant Isolation (`tests/unit/security-hardening.test.ts`)
- **Session Secret Enforcement**: Asserts that missing or short `< 32 char` `SESSION_SECRET` throws a fatal configuration error in production.
- **IDOR Boundary Defense**: Confirms that accessing or mutating a different `businessId` throws `AuthorizationError` (403).
- **Billing Role Lockdown**: Asserts that staff accounts are blocked from OWNER-only billing endpoints.
- **Self-Revocation Prohibition**: Confirms business owners cannot revoke their own ownership.

### Suite 4: Role-Based Access Control (`tests/unit/permissions-rbac.test.ts`)
- **Unauthenticated Rejection**: Asserts `requireAuth` throws 401 when session is null.
- **Platform Admin Enforcement**: Ensures `/platform-admin` blocks non-admins with 403.
- **Staff Access Scoping**: Confirms staff members can access counter terminal for their assigned business only.
- **Cross-Tenant Isolation**: Prohibits users from Business A from querying Business B resources.
- **Platform Admin Elevation**: Audits platform-level support access.

### Suite 5: Zod Schema Validation (`tests/unit/validation.test.ts`)
- **Customer Registration**: Validates email format, name length, and password rules.
- **Business Registration**: Validates category, company name, and slug format.
- **Loyalty Program**: Validates total stamp range (3 to 30) and reward thresholds.
- **Verification Codes**: Enforces exact 6-digit numeric pattern (`/^\d{6}$/`).

### Suite 6: Domain Calculations & Plan Entitlements (`tests/unit/loyalty-engine.test.ts`)
- **Progress Percentages**: Tests mathematical rounding and caps at 100%.
- **Next Milestone Distance**: Correctly computes remaining stamps to next perk.
- **Repeat Customer Rate**: Validates percentage of patrons with $\ge 2$ visits.
- **Catalog Entitlements**: Validates member and staff caps for Starter, Growth, and Pro tiers.

### Suite 7: Cryptographic Security & Tokens (`tests/unit/security-tokens.test.ts`)
- **Bcrypt Hashing**: Tests salted hashing and timing-safe password comparison.
- **JWT Session Tokens**: Verifies tamper-evident HS256 tokens and claims.
- **Razorpay Signature**: Validates HMAC-SHA256 timing-safe webhook verification.

---

## 2. Running Tests

```bash
# Run complete test suite (single run)
npm run test

# Run tests in interactive watch mode
npm run test:watch

# Run a specific test suite
npx vitest run tests/unit/repeatable-cycles.test.ts

# Run strict TypeScript compiler verification
npx tsc --noEmit
```
