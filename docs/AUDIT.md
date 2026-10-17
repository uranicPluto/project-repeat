# House of Workflow — Project Repeat: Full Repository Security & Architecture Audit

**Date**: 2026-10-18  
**Audit Conducted By**: Principal SaaS Architect, Security & QA Engineering  
**Target Repository**: `https://github.com/uranicPluto/project-repeat`  
**Deployment**: `https://project-repeat.vercel.app/`

---

## Executive Summary

Project Repeat is a multi-tenant digital loyalty and customer retention platform built with Next.js 15, Prisma ORM, and Tailwind CSS. A comprehensive code audit of the architecture, database layer, authentication, authorization, business logic, and UI flows was executed.

While core flows (QR generation, anti-fraud visit codes, password hashing, basic RBAC) are functional and well-structured, several **Critical** and **High-Severity** vulnerabilities and functional gaps were identified that must be addressed before real-world production deployment:

1. **Cross-Tenant IDOR Vulnerability**: The loyalty program update endpoint accepts an arbitrary `programId` without scoping to the caller's authorized `businessId`.
2. **Hardcoded Session Secret Fallback**: In production, `session.ts` falls back to a known hardcoded string, allowing potential JWT session forgery if unconfigured.
3. **Database Persistence Strategy**: Relying on bundled SQLite on Vercel is unsuitable for persistent production data and must be standardized on PostgreSQL.
4. **Repeatable Loyalty Cycles & Reward Expiry**: No cycle rollover or lifetime stamp tracking when cards reach completion; rewards lack expiration validation.
5. **Non-Functional UI Elements**: Buttons in Billing, Staff management (removal), and Privacy (export, account deletion, consent) lack functional API endpoints or handlers.

---

## Detailed Findings by Severity

### 1. CRITICAL SEVERITY (Must fix immediately)

#### [SEC-01] Cross-Tenant IDOR in Loyalty Program Update (`/api/loyalty/program`)
- **Location**: `src/app/api/loyalty/program/route.ts` (lines 28–43)
- **Impact**: Insecure Direct Object Reference (IDOR). While `requireBusinessAccess` verifies that the caller owns `body.businessId`, the transaction performs `tx.loyaltyProgram.update({ where: { id: programId } })` without checking that `program.businessId === businessId`. An authenticated owner of Business A could pass the `programId` of Business B and overwrite their program title, stamp counts, or delete all of Business B's active rewards.
- **Remediation**: Scope the query strictly to `where: { id: programId, businessId }` and verify ownership before deletion or recreation of rewards.

#### [SEC-02] Insecure Fallback Secret in Production Session Token Minting
- **Location**: `src/lib/auth/session.ts` (lines 6–8)
- **Impact**: Falls back to `"dev-project-repeat-super-secure-session-secret-key-32-chars-min"`. In production, if `SESSION_SECRET` is omitted from deployment environment variables, attackers can forge admin or business owner JWT cookies.
- **Remediation**: In production (`process.env.NODE_ENV === "production"`), enforce that `SESSION_SECRET` is set and at least 32 characters, throwing a startup/runtime configuration error rather than falling back.

---

### 2. HIGH SEVERITY

#### [ARCH-01] Ephemeral SQLite Database in Production Serverless
- **Location**: `prisma/schema.prisma`, `next.config.mjs`
- **Impact**: Serverless Lambdas on Vercel are stateless. Any mutations (new customers, visits, redemptions) written to a local SQLite file in a serverless container are lost when the container recycles.
- **Remediation**: Establish PostgreSQL as the official production database strategy. Ensure Prisma cleanly selects PostgreSQL with `DATABASE_URL` pooling/SSL, provide migration scripts, and fail fast if deployed without a persistent database connection string.

#### [BIZ-01] Missing Repeatable Loyalty Card Cycles & Lifetime Stamp Tracking
- **Location**: `src/server/services/verification.ts`, `src/server/services/loyalty.ts`
- **Impact**: When a customer reaches `totalStamps`, subsequent visits increment stamps unbounded (e.g., 6/5, 7/5). Furthermore, in `LoyaltyService.redeemReward`, redemption is checked across all time:
  ```ts
  const existingRedemption = await tx.rewardRedemption.findFirst({
    where: { enrollmentId, rewardId, status: "REDEEMED" }
  });
  ```
  This prevents a customer from ever redeeming that reward again in Cycle 2 or Cycle 3!
- **Remediation**: Introduce `currentCycle`, `completedCycles`, and `lifetimeStamps` on `LoyaltyEnrollment`. Associate each redemption with a `cycleNumber`. When a card is completed and top reward claimed (or customer rolls over), rollover cleanly to Cycle + 1.

#### [BIZ-02] Reward Expiration (`validityDays`) Not Enforced
- **Location**: `src/server/services/loyalty.ts`
- **Impact**: While `Reward` has a `validityDays` field, `redeemReward` does not check whether the reward has expired since the qualifying visit or grant date.
- **Remediation**: Implement expiry timestamp validation and status checking in `redeemReward` and wallet display.

#### [SEC-03] Missing Role Check on Billing Route
- **Location**: `src/app/dashboard/[slug]/billing/page.tsx`
- **Impact**: `DashboardLayout` allows `["OWNER", "MANAGER", "STAFF"]`. `BusinessBillingPage` does not check for `OWNER` privileges, exposing subscription plan details and billing actions to counter staff.
- **Remediation**: Enforce `requireBusinessAccess(session, business.id, ["OWNER"])` within the billing route.

---

### 3. MEDIUM SEVERITY

#### [UI-01] Missing In-Person Counter Reward Redemption in Staff UI
- **Location**: `src/app/dashboard/[slug]/verify/page.tsx`, `customers/page.tsx`
- **Impact**: While the API route `/api/loyalty/redeem` exists, neither the counter verification terminal nor the customer list gives staff a button to redeem an unlocked reward when the customer requests it.
- **Remediation**: Show available unlocked rewards in the counter terminal after visit verification or customer lookup, with a single-click "Redeem Reward" button calling `/api/loyalty/redeem`.

#### [UI-02] Missing Staff Revocation API & UI
- **Location**: `src/app/api/business/staff/route.ts`, `src/app/dashboard/[slug]/staff/client.tsx`
- **Impact**: Business owners can add staff members, but have no button or API to revoke, delete, or change the role of staff who leave the business.
- **Remediation**: Implement `DELETE /api/business/staff` and add a "Revoke Access" action to the staff roster table.

#### [PRIV-01] Non-Functional Privacy & Data Rights Buttons
- **Location**: `src/app/account/page.tsx`
- **Impact**: The "Request Export" and "Delete Account" buttons and the marketing consent checkbox are purely cosmetic and non-functional.
- **Remediation**: Implement `/api/privacy/export` (downloads complete user JSON record), `/api/privacy/delete-request` (anonymizes or purges user data), and `/api/privacy/consent` (updates `CustomerConsent` in database).

#### [BILL-01] Unconnected Subscription Plan Buttons
- **Location**: `src/app/dashboard/[slug]/billing/page.tsx`
- **Impact**: Clicking "Switch to Pro", "View Invoices", or "Change Plan" performs no action.
- **Remediation**: Provide an interactive plan selector with instant checkout/switch in development sandbox mode and clear production Razorpay gateway integration instructions.

---

### 4. LOW / INFORMATIONAL

#### [QA-01] Test Coverage Gaps
- **Location**: `tests/unit/`
- **Status**: 19 tests currently cover basic permissions, Zod validation, token hashing, and basic stamp incrementation.
- **Remediation**: Add unit and integration tests for IDOR prevention, cycle rollovers, reward expiry, staff deletion, and privacy export.

---

## Action Plan & Roadmap

1. **Phase 2: Security & Tenant Isolation Lockdown**
   - Fix IDOR in `/api/loyalty/program`
   - Enforce non-fallback `SESSION_SECRET` in production
   - Guard `/dashboard/[slug]/billing` to OWNER only
   - Implement staff deletion (`DELETE /api/business/staff`)
2. **Phase 3: Database Strategy & PostgreSQL Persistence**
   - Formalize PostgreSQL schema as primary production schema
   - Configure robust database connection handling, SSL, and schema synchronization
   - Document migration steps for Neon / Supabase / Railway
3. **Phase 4: Loyalty Cycles, Expiry & Redemption Auditing**
   - Add cycle tracking (`currentCycle`, `completedCycles`, `lifetimeStamps`)
   - Enforce reward validity days
   - Audit all redemptions with staff attribution
4. **Phase 5: Subscriptions & Billing Plumbed**
   - Connect billing action handlers with sandbox mode support and live Razorpay verification
5. **Phase 6: Complete Customer Wallet & Business Dashboard UI**
   - Add counter reward redemption in verify terminal
   - Wire up all dashboard buttons
6. **Phase 7: Privacy, Data Export & Consent**
   - Implement GDPR/DPDP export and deletion flows
   - Connect consent preference checkboxes
7. **Phase 8: Comprehensive Automated Testing**
   - Test all security boundaries, cycle rollovers, and privacy endpoints
8. **Phase 9: Deployment Verification & Documentation**
   - Update `README.md`, `docs/DATABASE.md`, `docs/SECURITY.md`, and deployment guides.
