import { prisma } from "@/lib/db/prisma";

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

    return prisma.loyaltyEnrollment.create({
      data: {
        customerId,
        businessId: program.businessId,
        programId,
        currentStamps: 0,
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
      const progressPercent = Math.min(100, Math.round((currentStamps / totalStamps) * 100));

      // Calculate next unearned reward
      const nextRewardDef = program.rewards.find((r) => r.stampsRequired > currentStamps);
      const nextReward = nextRewardDef
        ? {
            id: nextRewardDef.id,
            title: nextRewardDef.title,
            stampsRequired: nextRewardDef.stampsRequired,
            stampsRemaining: Math.max(0, nextRewardDef.stampsRequired - currentStamps),
          }
        : null;

      // Available & unlocked rewards
      const redeemedRewardIds = new Set(enrollment.redemptions.map((r) => r.rewardId));
      const availableRewards = program.rewards.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        rewardType: r.rewardType,
        stampsRequired: r.stampsRequired,
        isRedeemed: redeemedRewardIds.has(r.id),
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
        progressPercent,
        nextReward,
        availableRewards,
        lastVisitAt,
      };
    });
  }

  /**
   * Redeem a milestone reward with atomic checks
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

      // Check if already redeemed
      const existingRedemption = await tx.rewardRedemption.findFirst({
        where: {
          enrollmentId,
          rewardId,
          status: "REDEEMED",
        },
      });

      if (existingRedemption) {
        throw new Error("This reward milestone has already been redeemed for this card");
      }

      // Record atomic redemption
      const redemption = await tx.rewardRedemption.create({
        data: {
          enrollmentId,
          rewardId,
          staffUserId,
          status: "REDEEMED",
        },
      });

      // Append to immutable ledger
      await tx.loyaltyTransaction.create({
        data: {
          enrollmentId,
          type: "REWARD_REDEEMED",
          stampsDelta: 0,
          balanceAfter: enrollment.currentStamps,
          referenceCode: `REDEEM-${reward.title.replace(/\s+/g, "").toUpperCase()}`,
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
            enrollmentId,
            rewardId,
            rewardTitle: reward.title,
            customerUserId: enrollment.customerId,
          }),
        },
      });

      return redemption;
    });
  }
}
