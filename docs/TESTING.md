# Testing Strategy & Verification Plan

## Test Levels
1. **Unit Tests (Vitest)**
   - Domain logic: Stamp accruals, milestone thresholds, expiration rules.
   - Security: Password hashing, session JWT encryption/verification, permission matrix checks.
   - Validation: Zod schemas for user registration, business onboarding, loyalty program creation, and staff verification.
   - Analytics: Returning customer rate calculation, active member aggregation.

2. **Integration Tests**
   - Customer enrollment into business loyalty program.
   - Visit verification token creation, counter validation, and single-use consumption.
   - Atomic reward redemption with double-spend prevention.
   - Tenant isolation: ensuring cross-tenant queries return 403 Forbidden.
   - Payment webhook idempotency (handling duplicate delivery gracefully).

3. **End-to-End Customer Journeys**
   - Journey 1: Business owner onboarding, program customization, QR generation.
   - Journey 2: Customer scans QR, registers, joins program, sees live digital card.
   - Journey 3: Staff logs in, verifies customer visit code, customer sees +1 stamp.
   - Journey 4: Customer reaches milestone, staff verifies and redeems reward.
   - Journey 5: Cross-tenant data breach attempt blocked.
   - Journey 6: Non-admin access to `/platform-admin` blocked.

---

## Running Automated Tests
```bash
# Run all unit and integration tests
npm run test

# Watch mode during development
npm run test:watch
```
