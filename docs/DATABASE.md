# Database Architecture, Entity Design & PostgreSQL Production Strategy

## Overview

Project Repeat uses **PostgreSQL** as its official production database engine, accessed via **Prisma ORM** with version-controlled migrations.

- **Production Engine**: PostgreSQL 15+ (Neon, Supabase, AWS RDS, or self-hosted)
- **Local Development**: SQLite (offline zero-dependency dev) or local PostgreSQL via Docker
- **Connection Pooling**: Supported via PgBouncer / Prisma Accelerate (`?pgbouncer=true&connection_limit=10`)
- **Schema Location**: `prisma/schema.prisma` (Production PostgreSQL) & `prisma/schema.sqlite.prisma` (Offline SQLite)
- **Health Check Probe**: `/api/health`

---

## Production PostgreSQL Deployment Strategy

### 1. Connecting a Managed PostgreSQL Instance
In production on Vercel, Supabase, or AWS:
1. Provision a PostgreSQL instance (e.g., Neon serverless Postgres).
2. Set `DATABASE_URL` in your production environment variables:
   ```env
   # Pooled connection string (for serverless execution)
   DATABASE_URL="postgresql://user:password@ep-repeat-pooler.us-east-2.aws.neon.tech/repeat?sslmode=require&pgbouncer=true"
   ```
3. Deploy migrations:
   ```bash
   npx prisma migrate deploy
   ```
   Or apply the SQL migration directly:
   ```bash
   psql "$DATABASE_URL" -f prisma/migrations/20261018000000_init/migration.sql
   ```

### 2. Schema Strategy
- **`prisma/schema.prisma`**: Primary production definition targeting `provider = "postgresql"`. Includes native PostgreSQL indexing, timestamp precision, and foreign key cascade rules. Automatically consumed by Vercel and CI during builds.
- **`prisma/schema.sqlite.prisma`**: Configured for offline SQLite development without requiring external database dependencies.
- **`prisma/schema.postgresql.prisma`**: Preserved for legacy script compatibility.

### 3. Production Runtime Guards
- `src/lib/db/prisma.ts` enforces that if `NODE_ENV === "production"`, `DATABASE_URL` must be a valid PostgreSQL connection string. Silent fallback to SQLite is blocked with a fatal configuration error unless `ALLOW_SQLITE_IN_PRODUCTION=true` is explicitly provided for isolated preview evaluation.
- Live database health probe is available at `GET /api/health`, returning latency in milliseconds and database status without exposing credentials.

---

## Core Entities & Relational Schema

### 1. `User`
Represents an authenticated human actor on the platform (Customer, Business Staff/Owner, or Platform Admin).
- `id` (CUID, Primary Key)
- `email` (String, unique, indexed)
- `name` (String)
- `phone` (String, nullable)
- `passwordHash` (String, bcrypt hash)
- `role` (Enum: `PLATFORM_ADMIN`, `BUSINESS_USER`, `CUSTOMER`)
- `status` (Enum: `ACTIVE`, `SUSPENDED`, `PENDING`)
- `emailVerifiedAt` (DateTime, nullable)
- `createdAt`, `updatedAt` (DateTime)

### 2. `Business`
Represents a participating business tenant (e.g., The Coffee House).
- `id` (CUID, Primary Key)
- `name` (String)
- `slug` (String, unique, indexed) - e.g., `/b/the-coffee-house`
- `category` (String) - e.g., "Cafe & Coffee Shop"
- `description` (String, nullable)
- `logoUrl` (String, nullable)
- `address` (String, nullable)
- `timeZone` (String, default "Asia/Kolkata")
- `currency` (String, default "INR")
- `status` (Enum: `ACTIVE`, `SUSPENDED`)
- `primaryColor` (String, default "#315EFB")
- `secondaryColor` (String, default "#101828")
- `createdAt`, `updatedAt` (DateTime)

### 3. `BusinessMembership`
Junction table linking Users to Businesses with specific scoped roles.
- `id` (CUID, Primary Key)
- `userId` (FK -> User.id)
- `businessId` (FK -> Business.id)
- `role` (Enum: `OWNER`, `MANAGER`, `STAFF`)
- `createdAt`, `updatedAt` (DateTime)
- *Unique Constraint*: `[userId, businessId]`

### 4. `LoyaltyProgram`
Configurable loyalty programs per business.
- `id` (CUID, Primary Key)
- `businessId` (FK -> Business.id)
- `name` (String) - e.g., "Artisan Regulars Club"
- `cardTitle` (String)
- `totalStamps` (Int, default 5)
- `stampIcon` (String, default "cup")
- `status` (Enum: `DRAFT`, `PUBLISHED`, `ARCHIVED`)
- `version` (Int, default 1)
- `terms` (String, nullable)
- `createdAt`, `updatedAt` (DateTime)

### 5. `Reward` (Non-Destructive Versioning)
Milestone rewards defined within a program.
- `id` (CUID, Primary Key)
- `programId` (FK -> LoyaltyProgram.id)
- `stampsRequired` (Int) - e.g., 3 stamps for pastry discount, 5 stamps for free coffee
- `title` (String) - "Complimentary Beverage"
- `description` (String, nullable)
- `rewardType` (Enum: `FREE_ITEM`, `DISCOUNT_PERCENT`, `DISCOUNT_FIXED`)
- `discountValue` (Int, minor units or percentage points)
- `validityDays` (Int, default 30) - number of days reward is valid after unlocking
- `isActive` (Boolean, default true) - retired rewards are archived with `isActive = false` to preserve historical redemptions

### 6. `LoyaltyEnrollment` (Repeatable Cycles & Stamp Ledger)
A customer's active loyalty card with a specific business and program.
- `id` (CUID, Primary Key)
- `customerId` (FK -> User.id)
- `businessId` (FK -> Business.id)
- `programId` (FK -> LoyaltyProgram.id)
- `status` (Enum: `ACTIVE`, `PAUSED`, `CLOSED`)
- `currentStamps` (Int, default 0) - stamps accumulated in the current cycle
- `currentCycle` (Int, default 1) - current iteration of the card (rolls over upon completion)
- `lifetimeStamps` (Int, default 0) - immutable cumulative stamps earned across all cycles
- `enrolledAt` (DateTime)
- `updatedAt` (DateTime)
- *Unique Constraint*: `[customerId, programId]`

### 7. `LoyaltyTransaction` (Immutable Ledger)
The source of truth for all stamp awards and adjustments.
- `id` (CUID, Primary Key)
- `enrollmentId` (FK -> LoyaltyEnrollment.id)
- `type` (Enum: `STAMP_EARNED`, `REWARD_REDEEMED`, `CYCLE_COMPLETED`, `ADMIN_ADJUSTMENT`)
- `stampsDelta` (Int) - e.g. +1 for visit, 0 for redemption
- `balanceAfter` (Int)
- `referenceCode` (String, nullable) - verification receipt code
- `staffUserId` (FK -> User.id, nullable)
- `createdAt` (DateTime)

### 8. `VisitVerification`
Expiring 6-digit verification codes to prevent QR screenshot and duplication fraud.
- `id` (CUID, Primary Key)
- `enrollmentId` (FK -> LoyaltyEnrollment.id)
- `tokenHash` (String, unique)
- `code` (String) - 6-digit expiring code
- `expiresAt` (DateTime) - 3-minute TTL
- `status` (Enum: `PENDING`, `VERIFIED`, `EXPIRED`, `CANCELLED`)
- `verifiedByStaffId` (FK -> User.id, nullable)
- `verifiedAt` (DateTime, nullable)

### 9. `RewardRedemption` (Concurrency & Cycle Scoped)
Atomic, auditable record of a redeemed reward milestone.
- `id` (CUID, Primary Key)
- `enrollmentId` (FK -> LoyaltyEnrollment.id)
- `rewardId` (FK -> Reward.id)
- `staffUserId` (FK -> User.id)
- `cycle` (Int, default 1) - associates redemption with specific card cycle
- `status` (Enum: `REDEEMED`, `CANCELLED`, `EXPIRED`)
- `redemptionCode` (String, nullable) - unique redemption reference
- `redeemedAt` (DateTime)
- `expiresAt` (DateTime, nullable) - expiration deadline based on `Reward.validityDays`
- *Unique Constraint*: `[enrollmentId, rewardId, cycle]` (Physically blocks concurrent double-redemptions in the same cycle)

### 10. `Subscription`
Business subscription billing tracking.
- `id` (CUID, Primary Key)
- `businessId` (FK -> Business.id, unique)
- `planId` (Enum: `STARTER`, `GROWTH`, `PRO`, `ENTERPRISE`)
- `status` (Enum: `TRIALING`, `ACTIVE`, `PAST_DUE`, `CANCELLED`, `PAUSED`)
- `currentPeriodStart`, `currentPeriodEnd` (DateTime)
- `paymentProvider` (String) - e.g. "razorpay" or "mock_sandbox"
- `providerSubscriptionId` (String, nullable)

### 11. `AuditLog`
Immutable operational audit ledger.
- `id` (CUID, Primary Key)
- `actorUserId` (FK -> User.id, nullable)
- `businessId` (FK -> Business.id, nullable)
- `action` (String) - e.g., "STAFF_INVITED", "STAFF_REVOKED", "VISIT_VERIFIED", "REWARD_REDEEMED", "ACCOUNT_DELETED", "WEBHOOK_PROCESSED"
- `details` (String / JSON stringified)
- `ipAddress` (String, nullable)
- `createdAt` (DateTime)

### 12. `CustomerConsent`
Privacy and marketing consent tracker (DPDP / GDPR compliance).
- `id` (CUID, Primary Key)
- `customerId` (FK -> User.id)
- `businessId` (FK -> Business.id)
- `marketingEmail` (Boolean, default false)
- `marketingSms` (Boolean, default false)
- `updatedAt` (DateTime)
- *Unique Constraint*: `[customerId, businessId]`
