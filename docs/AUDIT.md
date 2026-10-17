# House of Workflow — Project Repeat: Full Repository Security & Architecture Audit

**Date**: 2026-10-18  
**Audit Conducted By**: Principal SaaS Architect, Application Security & QA Engineering  
**Target Repository**: `https://github.com/uranicPluto/project-repeat`  
**Deployment**: `https://project-repeat.vercel.app/`  
**Overall Status**: **VERIFIED**

---

## 1. Executive Summary

A comprehensive source-level audit and remediation review was conducted across the entire Project Repeat codebase (Next.js 15, Prisma ORM, PostgreSQL/SQLite, Tailwind CSS, TypeScript). 

Every claim was verified against the real implementation, database migrations, and 46 automated tests across 12 test suites.

---

## 2. Confirmed Vulnerabilities, Architectural Defects & Remediation Status

| ID | Category | Severity | Description | Status | Verification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Authorization | **CRITICAL** | IDOR in `/api/loyalty/program`: Updating a program accepted `programId` without verifying it belonged to caller's `businessId`. | **VERIFIED** | Scoped queries strictly to `{ id: programId, businessId }`. Negative test in `security-hardening.test.ts`. |
| **SEC-02** | Session Security | **CRITICAL** | Hardcoded session secret fallback in production allowed forging of JWT cookies if `SESSION_SECRET` was unset. | **VERIFIED** | `getSessionSecretKey()` throws fatal error in production if secret is missing or < 32 chars. Verified in unit tests. |
| **SEC-03** | Anti-Fraud / Concurrency | **CRITICAL** | Verification codes used `Math.random()` and read-then-write status check allowed concurrent requests to award duplicate stamps. | **VERIFIED** | Switched to `crypto.randomInt(100000, 1000000)`, atomic single-use claim via conditional update `updateMany({ where: { id, status: 'PENDING' } })`. Concurrency test in `concurrency-race.test.ts`. |
| **DATA-01** | Data Integrity | **CRITICAL** | Program update previously executed `tx.reward.deleteMany({ where: { programId } })`, which cascade-deleted all historical `RewardRedemption` records! | **VERIFIED** | Replaced with non-destructive in-place upsert and archival (`isActive = false`). Verified in `non-destructive-rewards.test.ts`. |
| **AUTH-01** | Stale Claims | **HIGH** | Revoked staff or suspended users retained valid JWT session claims for 7 days, permitting continued counter verification. | **VERIFIED** | Created `validateLiveBusinessAccess` and DB status checks on critical mutations and `/api/auth/me`. Verified in `live-authorization-revocation.test.ts`. |
| **SEED-01** | Public Credentials | **HIGH** | Demo credentials documented in README existed in tracked SQLite database and could authenticate in production. | **VERIFIED** | Untracked `prisma/dev.db` from Git, blocked demo login in production mode without explicit override, guarded `prisma/seed.js` against production execution. |
| **BILL-01** | Billing Security | **HIGH** | Plan switcher allowed updating subscription to ACTIVE without proving payment in production; plan limits were unenforced. | **VERIFIED** | Blocked unverified plan switching in production without credentials, enforced server-side `maxMembers` and `maxStaff` limits, and added idempotent webhook lifecycle handler. Verified in `billing-lifecycle.test.ts`. |
| **ARCH-01** | Persistence | **HIGH** | Unmanaged SQLite in serverless production risks silent data loss on container recycle. | **VERIFIED** | Blocked silent fallback to SQLite in production in `prisma.ts`, created dual-schema PostgreSQL DDL migration, and implemented `/api/health` live connectivity probe. |
| **PRIV-01** | Privacy Rights | **MEDIUM** | Account deletion stored plaintext email in audit logs; marketing consent was unenforced in communications. | **VERIFIED** | Anonymized audit logs (no plaintext email on deletion), enforced customer consent checks in `NotificationService`. Verified in `privacy-compliance.test.ts`. |
| **UI-01** | Functionality | **MEDIUM** | Verification terminal lacked perk redemption button; staff lacked revocation button; customers lacked CSV export. | **VERIFIED** | Implemented counter perk authorization, staff revocation with audit logging, and customer engagement CSV export. |

---

## 3. Prioritized Remediation Summary

1. **Anti-Fraud Verification Engine**:
   - `crypto.randomInt(100000, 1000000)` generates high-entropy 6-digit codes.
   - 3-minute TTL strictly enforced.
   - Code lookup scoped to `enrollment: { businessId }` preventing cross-tenant code collision.
   - Atomic single-use claim: `updateMany({ where: { id, status: 'PENDING' }, data: { status: 'VERIFIED' } })`. Only one request can consume the code; concurrent requests abort.
   - Rate limiting: max 5 code requests per minute per enrollment.

2. **Non-Destructive Reward Archival**:
   - `Reward` records are never hard-deleted when updating a card.
   - Retired rewards are marked `isActive = false`, preserving historical redemption records.
   - Database unique constraint `@@unique([enrollmentId, rewardId, cycle])` physically prevents duplicate redemptions of the same milestone in the same cycle.

3. **Live Server-Side RBAC**:
   - `validateLiveBusinessAccess` checks the live database to ensure the user is `ACTIVE` and their staff membership has not been revoked, closing the stale JWT window.

4. **Production Persistence & Health**:
   - Explicit PostgreSQL schema in `prisma/schema.postgresql.prisma`.
   - Migration script in `prisma/migrations/20261018000000_init/migration.sql`.
   - Production failure guard: throws fatal error if `DATABASE_URL` is missing or SQLite without `ALLOW_SQLITE_IN_PRODUCTION=true`.
   - `/api/health` endpoint verifies live database connectivity and latency.

5. **Billing & Subscriptions**:
   - Plan limits (`maxStaff`, `maxMembers`) enforced on server before record creation.
   - Sandbox evaluation separated from live billing; production blocks unpaid plan spoofing.
   - Full webhook lifecycle support (`subscription.activated`, `subscription.charged`, `subscription.cancelled`, `payment.failed`) with idempotency deduplication.
