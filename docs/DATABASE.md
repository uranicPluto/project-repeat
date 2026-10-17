# Database Architecture & Entity Design

## Database Technology
- **Engine**: PostgreSQL
- **ORM**: Prisma ORM
- **Migration Strategy**: Version-controlled migrations (`prisma/migrations`)

---

## Core Entities & Relational Schema

### 1. `User`
Represents an authenticated human actor on the platform (Customer, Business Staff/Owner, or Platform Admin).
- `id` (UUID / CUID, Primary Key)
- `email` (String, unique, indexed)
- `name` (String)
- `phone` (String, nullable)
- `passwordHash` (String, bcrypt/argon2 hash)
- `role` (Enum: `PLATFORM_ADMIN`, `BUSINESS_USER`, `CUSTOMER`)
- `status` (Enum: `ACTIVE`, `SUSPENDED`, `PENDING_VERIFICATION`)
- `emailVerifiedAt` (DateTime, nullable)
- `createdAt`, `updatedAt` (DateTime)

### 2. `Business`
Represents a participating business tenant (e.g., The Coffee House).
- `id` (UUID, Primary Key)
- `name` (String)
- `slug` (String, unique, indexed) - e.g., `/b/the-coffee-house`
- `category` (String) - e.g., "Cafe & Coffee Shop"
- `description` (String, nullable)
- `logoUrl` (String, nullable)
- `address` (String, nullable)
- `timeZone` (String, default "Asia/Kolkata")
- `currency` (String, default "INR")
- `status` (Enum: `ONBOARDING`, `ACTIVE`, `SUSPENDED`)
- `primaryColor` (String, default "#315EFB")
- `secondaryColor` (String, default "#101828")
- `createdAt`, `updatedAt` (DateTime)

### 3. `BusinessMembership`
Junction table linking Users to Businesses with specific scoped roles.
- `id` (UUID, Primary Key)
- `userId` (FK -> User.id)
- `businessId` (FK -> Business.id)
- `role` (Enum: `OWNER`, `MANAGER`, `STAFF`)
- `createdAt`, `updatedAt` (DateTime)
- *Unique Constraint*: `[userId, businessId]`

### 4. `LoyaltyProgram` & `LoyaltyProgramVersion`
Configurable loyalty programs per business.
- `id` (UUID, Primary Key)
- `businessId` (FK -> Business.id)
- `name` (String) - e.g., "Coffee House Regulars"
- `cardTitle` (String)
- `totalStamps` (Int) - e.g., 5 or 10
- `stampIcon` (String, default "cup")
- `status` (Enum: `DRAFT`, `PUBLISHED`, `ARCHIVED`)
- `version` (Int, default 1)
- `terms` (String)
- `createdAt`, `updatedAt` (DateTime)

### 5. `Reward`
Milestone rewards defined within a program.
- `id` (UUID, Primary Key)
- `programId` (FK -> LoyaltyProgram.id)
- `stampsRequired` (Int) - e.g., 5 stamps for a free coffee
- `title` (String) - "Free Any Beverage"
- `description` (String)
- `rewardType` (Enum: `FREE_ITEM`, `DISCOUNT_PERCENT`, `DISCOUNT_FIXED`)
- `discountValue` (Decimal / Int minor units, nullable)
- `validityDays` (Int, default 30)
- `isActive` (Boolean, default true)

### 6. `LoyaltyEnrollment`
A customer's active loyalty card with a specific business and program.
- `id` (UUID, Primary Key)
- `customerId` (FK -> User.id)
- `businessId` (FK -> Business.id)
- `programId` (FK -> LoyaltyProgram.id)
- `status` (Enum: `ACTIVE`, `PAUSED`, `CLOSED`)
- `enrolledAt` (DateTime)
- *Unique Constraint*: `[customerId, programId]`

### 7. `LoyaltyTransaction` (Immutable Ledger)
The source of truth for all stamp awards and adjustments.
- `id` (UUID, Primary Key)
- `enrollmentId` (FK -> LoyaltyEnrollment.id)
- `type` (Enum: `STAMP_EARNED`, `REWARD_REDEEMED`, `STAMP_EXPIRED`, `ADMIN_ADJUSTMENT`)
- `stampsDelta` (Int) - positive for stamps earned (+1), negative for resets
- `referenceCode` (String, nullable) - receipt or verification reference
- `staffUserId` (FK -> User.id, nullable)
- `createdAt` (DateTime)

### 8. `VisitVerification`
Temporary and historic visit verification tokens to prevent fraud.
- `id` (UUID, Primary Key)
- `enrollmentId` (FK -> LoyaltyEnrollment.id)
- `tokenHash` (String, unique)
- `code` (String) - 6-digit expiring code
- `expiresAt` (DateTime)
- `status` (Enum: `PENDING`, `VERIFIED`, `EXPIRED`, `CANCELLED`)
- `verifiedByStaffId` (FK -> User.id, nullable)
- `verifiedAt` (DateTime, nullable)

### 9. `RewardRedemption`
Atomic record of a redeemed reward milestone.
- `id` (UUID, Primary Key)
- `enrollmentId` (FK -> LoyaltyEnrollment.id)
- `rewardId` (FK -> Reward.id)
- `staffUserId` (FK -> User.id)
- `status` (Enum: `REDEEMED`, `CANCELLED`)
- `redeemedAt` (DateTime)

### 10. `Subscription` & `SubscriptionPlan`
Multi-tier billing system.
- `planId` (Enum: `STARTER`, `GROWTH`, `PRO`, `ENTERPRISE`)
- `businessId` (FK -> Business.id, unique)
- `status` (Enum: `TRIALING`, `ACTIVE`, `PAST_DUE`, `CANCELLED`)
- `currentPeriodStart`, `currentPeriodEnd` (DateTime)
- `paymentProvider` (String) - e.g. "razorpay" or "mock"
- `providerSubscriptionId` (String, nullable)

### 11. `AuditLog`
High-security audit event ledger.
- `id` (UUID, Primary Key)
- `actorUserId` (FK -> User.id, nullable)
- `businessId` (FK -> Business.id, nullable)
- `action` (String) - e.g., "STAFF_INVITED", "PROGRAM_PUBLISHED", "REWARD_REDEEMED"
- `details` (Json)
- `ipAddress`, `userAgent` (String, nullable)
- `createdAt` (DateTime)
