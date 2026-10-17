-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "emailVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "address" TEXT,
    "timeZone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "primaryColor" TEXT NOT NULL DEFAULT '#315EFB',
    "secondaryColor" TEXT NOT NULL DEFAULT '#101828',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoyaltyProgram" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cardTitle" TEXT NOT NULL,
    "totalStamps" INTEGER NOT NULL DEFAULT 5,
    "stampIcon" TEXT NOT NULL DEFAULT 'cup',
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "version" INTEGER NOT NULL DEFAULT 1,
    "terms" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoyaltyProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reward" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "stampsRequired" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "rewardType" TEXT NOT NULL DEFAULT 'FREE_ITEM',
    "discountValue" INTEGER,
    "validityDays" INTEGER NOT NULL DEFAULT 30,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoyaltyEnrollment" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "currentStamps" INTEGER NOT NULL DEFAULT 0,
    "currentCycle" INTEGER NOT NULL DEFAULT 1,
    "lifetimeStamps" INTEGER NOT NULL DEFAULT 0,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoyaltyEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoyaltyTransaction" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "stampsDelta" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "referenceCode" TEXT,
    "staffUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoyaltyTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitVerification" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "verifiedByStaffId" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardRedemption" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "staffUserId" TEXT NOT NULL,
    "cycle" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'REDEEMED',
    "redemptionCode" TEXT,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "RewardRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "planId" TEXT NOT NULL DEFAULT 'STARTER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "paymentProvider" TEXT NOT NULL DEFAULT 'mock',
    "providerSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "businessId" TEXT,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerConsent" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "marketingEmail" BOOLEAN NOT NULL DEFAULT false,
    "marketingSms" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerConsent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");

CREATE UNIQUE INDEX "Business_slug_key" ON "Business"("slug");
CREATE INDEX "Business_slug_idx" ON "Business"("slug");

CREATE INDEX "BusinessMembership_businessId_idx" ON "BusinessMembership"("businessId");
CREATE INDEX "BusinessMembership_userId_idx" ON "BusinessMembership"("userId");
CREATE UNIQUE INDEX "BusinessMembership_userId_businessId_key" ON "BusinessMembership"("userId", "businessId");

CREATE INDEX "LoyaltyProgram_businessId_idx" ON "LoyaltyProgram"("businessId");
CREATE INDEX "Reward_programId_idx" ON "Reward"("programId");

CREATE INDEX "LoyaltyEnrollment_businessId_idx" ON "LoyaltyEnrollment"("businessId");
CREATE INDEX "LoyaltyEnrollment_customerId_idx" ON "LoyaltyEnrollment"("customerId");
CREATE UNIQUE INDEX "LoyaltyEnrollment_customerId_programId_key" ON "LoyaltyEnrollment"("customerId", "programId");

CREATE INDEX "LoyaltyTransaction_enrollmentId_idx" ON "LoyaltyTransaction"("enrollmentId");

CREATE UNIQUE INDEX "VisitVerification_tokenHash_key" ON "VisitVerification"("tokenHash");
CREATE INDEX "VisitVerification_enrollmentId_idx" ON "VisitVerification"("enrollmentId");
CREATE INDEX "VisitVerification_code_idx" ON "VisitVerification"("code");

CREATE INDEX "RewardRedemption_enrollmentId_idx" ON "RewardRedemption"("enrollmentId");
CREATE INDEX "RewardRedemption_rewardId_idx" ON "RewardRedemption"("rewardId");
CREATE UNIQUE INDEX "RewardRedemption_enrollmentId_rewardId_cycle_key" ON "RewardRedemption"("enrollmentId", "rewardId", "cycle");

CREATE UNIQUE INDEX "Subscription_businessId_key" ON "Subscription"("businessId");
CREATE INDEX "Subscription_businessId_idx" ON "Subscription"("businessId");

CREATE INDEX "AuditLog_businessId_idx" ON "AuditLog"("businessId");
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");

CREATE INDEX "CustomerConsent_customerId_idx" ON "CustomerConsent"("customerId");
CREATE UNIQUE INDEX "CustomerConsent_customerId_businessId_key" ON "CustomerConsent"("customerId", "businessId");

-- AddForeignKey
ALTER TABLE "BusinessMembership" ADD CONSTRAINT "BusinessMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BusinessMembership" ADD CONSTRAINT "BusinessMembership_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LoyaltyProgram" ADD CONSTRAINT "LoyaltyProgram_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_programId_fkey" FOREIGN KEY ("programId") REFERENCES "LoyaltyProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LoyaltyEnrollment" ADD CONSTRAINT "LoyaltyEnrollment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LoyaltyEnrollment" ADD CONSTRAINT "LoyaltyEnrollment_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LoyaltyEnrollment" ADD CONSTRAINT "LoyaltyEnrollment_programId_fkey" FOREIGN KEY ("programId") REFERENCES "LoyaltyProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LoyaltyTransaction" ADD CONSTRAINT "LoyaltyTransaction_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "LoyaltyEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VisitVerification" ADD CONSTRAINT "VisitVerification_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "LoyaltyEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VisitVerification" ADD CONSTRAINT "VisitVerification_verifiedByStaffId_fkey" FOREIGN KEY ("verifiedByStaffId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RewardRedemption" ADD CONSTRAINT "RewardRedemption_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "LoyaltyEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RewardRedemption" ADD CONSTRAINT "RewardRedemption_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RewardRedemption" ADD CONSTRAINT "RewardRedemption_staffUserId_fkey" FOREIGN KEY ("staffUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;
