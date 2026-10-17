import { prisma } from "@/lib/db/prisma";
import { PLAN_CATALOG } from "./billing";
import crypto from "crypto";

export interface ProgramProgress {
  enrollmentId: string;
  businessId: string;
  businessName: string;
  businessSlug: string;
  primaryColor: string;
  secondaryColor: string;
  programId: string;
  programName: string;
  cardTitle: string;
  stampIcon: string;
  totalStamps: number;
  currentStamps: number;
  progressPercent: number;
  nextReward: {
    id: string;
    title: string;
    stampsRequired: number;
    stampsRemaining: number;
  } | null;
  availableRewards: {
    id: string;
    title: string;
    description: string | null;
    rewardType: string;
    stampsRequired: number;
    isRedeemed: boolean;
  }[];
  currentCycle?: number;
  lifetimeStamps?: number;
  lastVisitAt: Date | null;
}

export class LoyaltyService {
  /**
   * Enroll a customer in a published loyalty program
   */
  static async enrollCustomer(customerId: string, programId: string) {
    const program = await prisma.loyaltyProgram.findUnique({
      where: { id: programId },
      include: { business: true },
    });

    if (!program || program.status !== "PUBLISHED") {
      throw new Error("Program is not currently active or published");
    }

    const existing = await prisma.loyaltyEnrollment.findUnique({
      where: {
        customerId_programId: { customerId, programId },
      },
    });

    if (existing) {
      return existing;
    }

    // Enforce business subscription plan capacity limit
    const currentMemberCount = await prisma.loyaltyEnrollment.count({
      where: { businessId: program.businessId },
    });

    const subscription = await prisma.subscription.findUnique({
      where: { businessId: program.businessId },
    });
    const planKey = (subscription?.planId || "STARTER") as keyof typeof PLAN_CATALOG;
    const plan = PLAN_CATALOG[planKey] || PLAN_CATALOG.STARTER;

    if (currentMemberCount >= plan.maxMembers) {
      throw new Error(
        `Business capacity reached: This business's current ${plan.name} plan has reached its limit of ${plan.maxMembers} members.`
      );
    }

    return prisma.loyaltyEnrollment.create({
      data: {
        customerId,
        businessId: program.businessId,
        programId,
        currentStamps: 0,
        currentCycle: 1,
        lifetimeStamps: 0,
      },
    });
  }

  /**
   * Get all active loyalty cards for a customer with calculated progress & rewards
   */
  static async getCustomerWallet(customerId: string): Promise<ProgramProgress[]> {
    const enrollments = await prisma.loyaltyEnrollment.findMany({
      where: { customerId, status: "ACTIVE" },
      include: {
        business: true,
        program: {
          include: {
            rewards: {
              where: { isActive: true },
              orderBy: { stampsRequired: "asc" },
            },
          },
        },
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        redemptions: true,
      },
    });

    return enrollments.map((enrollment) => {
      const { program, business } = enrollment;
      const currentStamps = enrollment.currentStamps;
      const totalStamps = program.totalStamps;
      const currentCycle = enrollment.currentCycle || 1;
      const progressPercent = Math.min(100, Math.round((currentStamps / totalStamps) * 100));

      // Calculate next unearned reward in current cycle
      const nextRewardDef = program.rewards.find((r) => r.stampsRequired > currentStamps);
      const nextReward = nextRewardDef
        ? {
            id: nextRewardDef.id,
            title: nextRewardDef.title,
            stampsRequired: nextRewardDef.stampsRequired,
            stampsRemaining: Math.max(0, nextRewardDef.stampsRequired - currentStamps),
          }
        : null;

      // Available & unlocked rewards scoped to current cycle
      const redeemedRewardIdsInCycle = new Set(
        enrollment.redemptions
          .filter((r) => r.cycle === currentCycle && r.status === "REDEEMED")
          .map((r) => r.rewardId)
      );

      const availableRewards = program.rewards.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        rewardType: r.rewardType,
        stampsRequired: r.stampsRequired,
        isRedeemed: redeemedRewardIdsInCycle.has(r.id),
      }));

      const lastVisitAt = enrollment.transactions[0]?.createdAt ?? null;

      return {
        enrollmentId: enrollment.id,
        businessId: business.id,
        businessName: business.name,
        businessSlug: business.slug,
        primaryColor: business.primaryColor,
        secondaryColor: business.secondaryColor,
        programId: program.id,
        programName: program.name,
        cardTitle: program.cardTitle,
        stampIcon: program.stampIcon,
        totalStamps,
        currentStamps,
        currentCycle,
        lifetimeStamps: enrollment.lifetimeStamps || currentStamps,
        progressPercent,
        nextReward,
        availableRewards,
        lastVisitAt,
      };
    });
  }

  /**
   * Redeem a milestone reward with atomic checks, cycle tracking, and expiry enforcement
   */
  static async redeemReward(params: {
    enrollmentId: string;
    rewardId: string;
    staffUserId: string;
    businessId: string;
  }) {
    const { enrollmentId, rewardId, staffUserId, businessId } = params;

    return prisma.$transaction(async (tx) => {
      const enrollment = await tx.loyaltyEnrollment.findUnique({
        where: { id: enrollmentId },
        include: { program: true },
      });

      if (!enrollment) {
        throw new Error("Loyalty enrollment not found");
      }

      if (enrollment.businessId !== businessId) {
        throw new Error("Unauthorized: Enrollment belongs to a different business");
      }

      const reward = await tx.reward.findUnique({
        where: { id: rewardId },
      });

      if (!reward || reward.programId !== enrollment.programId) {
        throw new Error("Reward does not belong to this loyalty program");
      }

      // Server-side eligibility validation
      if (enrollment.currentStamps < reward.stampsRequired) {
        throw new Error(
          `Insufficient stamps: Customer has ${enrollment.currentStamps} stamps, but ${reward.stampsRequired} are required`
        );
      }

      const currentCycle = enrollment.currentCycle || 1;

      // Check if already redeemed in this specific cycle
      const existingRedemption = await tx.rewardRedemption.findFirst({
        where: {
          enrollmentId,
          rewardId,
          cycle: currentCycle,
          status: "REDEEMED",
        },
      });

      if (existingRedemption) {
        throw new Error(`This reward milestone has already been redeemed for Cycle ${currentCycle}`);
      }

      // Reward expiration check: verify validityDays from when qualifying stamps were achieved
      const qualifyingTx = await tx.loyaltyTransaction.findFirst({
        where: {
          enrollmentId,
          type: "STAMP_EARNED",
          balanceAfter: { gte: reward.stampsRequired },
        },
        orderBy: { createdAt: "desc" },
      });

      const daysSinceEarned = qualifyingTx
        ? (Date.now() - qualifyingTx.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        : 0;

      if (reward.validityDays && daysSinceEarned > reward.validityDays) {
        throw new Error(
          `Reward expired: Unlocked on ${qualifyingTx?.createdAt.toLocaleDateString()}, but valid for ${reward.validityDays} days.`
        );
      }

      const redemptionCode = `RDM-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
      const expiresAt = new Date(Date.now() + (reward.validityDays || 30) * 24 * 60 * 60 * 1000);

      // Record atomic redemption with staff attribution & cycle
      const redemption = await tx.rewardRedemption.create({
        data: {
          enrollmentId,
          rewardId,
          staffUserId,
          cycle: currentCycle,
          status: "REDEEMED",
          redemptionCode,
          expiresAt,
        },
      });

      // Append to immutable ledger
      await tx.loyaltyTransaction.create({
        data: {
          enrollmentId,
          type: "REWARD_REDEEMED",
          stampsDelta: 0,
          balanceAfter: enrollment.currentStamps,
          referenceCode: redemptionCode,
          staffUserId,
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          actorUserId: staffUserId,
          businessId,
          action: "REWARD_REDEEMED",
          details: JSON.stringify({
            redemptionId: redemption.id,
            redemptionCode,
            enrollmentId,
            rewardId,
            rewardTitle: reward.title,
            cycle: currentCycle,
            customerUserId: enrollment.customerId,
          }),
        },
      });

      return redemption;
    });
  }
}
