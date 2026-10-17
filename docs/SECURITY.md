# Security & Privacy Guidelines (Project Repeat)

## 1. Zero-Trust Server-Side Authorization
- **Never trust client state**: Role, business ID, customer ID, or stamp balances provided in request bodies/headers are untrusted.
- **Tenant boundaries**: Any mutation or read on business-specific data explicitly checks that the authenticated user possesses an active `BusinessMembership` with appropriate privileges (`OWNER`, `MANAGER`, or `STAFF`) for that exact `businessId`.
- **Platform Admin isolation**: Even platform administrators access business-specific data only through audited support elevation logs; they do not have unmonitored carte-blanche read access to raw customer PII.

## 2. Loyalty Verification Anti-Fraud
- **No Static QR Code Stamp Awarding**: Scanning a public business QR code simply navigates to the public business storefront (`/b/:slug`). It NEVER automatically grants stamps.
- **Expiring One-Time Verification Tokens**: When a customer requests verification, the server generates a time-bounded (3-minute TTL), cryptographically random 6-digit verification code.
- **Atomic Single-Use Invalidation**: When staff enters the verification code, the transaction immediately transitions the verification record status to `VERIFIED` inside an atomic database transaction. Any replay attempt is rejected as expired or already consumed.
- **Concurrency & Race Condition Defenses**: Database row locking or unique constraint guards prevent double redemption of rewards.

## 3. Credential & Session Security
- **Password Hashing**: Passwords hashed using bcrypt (cost factor 10+) with salt.
- **Secure Cookie Session**: Sessions are signed with an HMAC secret (`SESSION_SECRET`), stored in `HttpOnly`, `SameSite=Lax` (or `Strict`), `Secure` cookies.
- **Data Minimization**: Staff members can view only customer first name / initial and loyalty visit history. Phone numbers and emails are masked.
- **Audit Logging**: All sensitive mutations (role assignments, program publishing, manual adjustments, reward redemptions) append to the immutable `AuditLog`.

## 4. Privacy & Regulatory Compliance (DPDP Act & GDPR Ready)
- Clear customer opt-in consent for promotional notifications.
- Immediate opt-out / preference toggling available in the customer account settings.
- Account deletion and data export requests supported via self-service API endpoints.
