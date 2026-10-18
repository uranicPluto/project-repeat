import { prisma } from "@/lib/db/prisma";
import crypto from "crypto";

export class VerificationService {
  /**
   * Customer generates an expiring 6-digit verification code to present at counter
   */
  static async createVerificationCode(enrollmentId: string, customerId: string) {
    const enrollment = await prisma.loyaltyEnrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment || enrollment.customerId !== customerId) {
      throw new Error("Invalid loyalty enrollment");
    }

    // Rate limit: max 5 code requests per minute per enrollment
    const recentCodes = await prisma.visitVerification.count({
      where: {
        enrollmentId,
        createdAt: { gte: new Date(Date.now() - 60 * 1000) },
      },
    });

    if (recentCodes >= 5) {
      throw new Error("Rate limit exceeded: Please wait a minute before requesting another verification code.");
    }

    // Cancel any previous pending codes for this enrollment
    await prisma.visitVerification.updateMany({
      where: {
        enrollmentId,
        status: "PENDING",
      },
      data: {
        status: "CANCELLED",
      },
    });

    // Generate cryptographically secure random 6-digit code
    const code = crypto.randomInt(100000, 1000000).toString();
    const tokenHash = crypto.createHash("sha256").update(`${enrollmentId}:${code}:${Date.now()}`).digest("hex");
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes TTL

    const verification = await prisma.visitVerification.create({
      data: {
        enrollmentId,
        code,
        tokenHash,
        expiresAt,
        status: "PENDING",
      },
    });

    return {
      code: verification.code,
      expiresAt: verification.expiresAt,
    };
  }

  /**
   * Staff verifies customer visit and awards stamp atomically
   */
  static async verifyVisitByCode(params: {
    code: string;
    businessId: string;
    staffUserId: string;
    referenceCode?: string;
  }) {
    const { code, businessId, staffUserId, referenceCode } = params;

    return prisma.$transaction(async (tx) => {
      // Find pending verification record scoped to this business
      const verification = await tx.visitVerification.findFirst({
        where: {
          code,
          status: "PENDING",
          enrollment: { businessId },
        },
        include: {
          enrollment: {
            include: {
              program: true,
              business: true,
            },
          },
        },
      });

      if (!verification) {
        // Check if code was created for another business tenant
        const otherBiz = await tx.visitVerification.findFirst({
          where: { code, status: "PENDING" },
          include: { enrollment: { include: { business: true } } },
        });
        if (otherBiz && otherBiz.enrollment.businessId !== businessId) {
          throw new Error(
            `This verification code belongs to "${otherBiz.enrollment.business.name}". Please ask the customer to select this business's loyalty card, or switch to the matching business terminal.`
          );
        }

        // Check if code was already verified, expired, or cancelled
        const historical = await tx.visitVerification.findFirst({
          where: { code, enrollment: { businessId } },
          orderBy: { createdAt: "desc" },
        });
        if (historical) {
          if (historical.status === "VERIFIED") {
            throw new Error("This verification code was already redeemed and verified.");
          }
          if (historical.status === "EXPIRED" || new Date() > historical.expiresAt) {
            throw new Error("This verification code has expired (3-minute limit). Please ask the customer to tap 'Refresh Code'.");
          }
          if (historical.status === "CANCELLED") {
            throw new Error("This verification code was cancelled because a newer code was generated. Please enter the latest code shown on the customer's phone.");
          }
        }

        throw new Error("Invalid or already used verification code");
      }

      // Check expiration
      if (new Date() > verification.expiresAt) {
        await tx.visitVerification.update({
          where: { id: verification.id },
          data: { status: "EXPIRED" },
        });
        throw new Error("Verification code has expired (3-minute limit). Please ask the customer to tap 'Refresh Code'.");
      }

      // Atomic single-use claim: Update status from PENDING to VERIFIED
      // Prevents concurrent duplicate stamp awards
      const claim = await tx.visitVerification.updateMany({
        where: {
          id: verification.id,
          status: "PENDING",
        },
        data: {
          status: "VERIFIED",
          verifiedByStaffId: staffUserId,
          verifiedAt: new Date(),
        },
      });

      if (claim.count === 0) {
        throw new Error("Invalid or already used verification code");
      }

      const currentStamps = verification.enrollment.currentStamps;
      const totalStamps = verification.enrollment.program.totalStamps;
      const currentCycle = verification.enrollment.currentCycle || 1;
      const lifetimeStamps = (verification.enrollment.lifetimeStamps || 0) + 1;

      let newStamps: number;
      let newCycle = currentCycle;
      let rolledOver = false;

      if (currentStamps >= totalStamps) {
        // Customer already completed previous card! Rolling over into a new repeatable cycle
        newCycle = currentCycle + 1;
        newStamps = 1;
        rolledOver = true;
      } else {
        newStamps = currentStamps + 1;
      }

      // Update enrollment counter and cycle
      const updatedEnrollment = await tx.loyaltyEnrollment.update({
        where: { id: verification.enrollmentId },
        data: {
          currentStamps: newStamps,
          currentCycle: newCycle,
          lifetimeStamps,
        },
      });

      // If rolled over, record cycle completion in transaction ledger
      if (rolledOver) {
        await tx.loyaltyTransaction.create({
          data: {
            enrollmentId: verification.enrollmentId,
            type: "CYCLE_COMPLETED",
            stampsDelta: 0,
            balanceAfter: 0,
            referenceCode: `CYCLE-${currentCycle}-COMPLETE`,
            staffUserId,
          },
        });
      }

      // Append to immutable ledger
      const transaction = await tx.loyaltyTransaction.create({
        data: {
          enrollmentId: verification.enrollmentId,
          type: "STAMP_EARNED",
          stampsDelta: 1,
          balanceAfter: newStamps,
          referenceCode: referenceCode || `VISIT-${Date.now().toString().slice(-6)}`,
          staffUserId,
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          actorUserId: staffUserId,
          businessId,
          action: "VISIT_VERIFIED",
          details: JSON.stringify({
            enrollmentId: verification.enrollmentId,
            customerId: verification.enrollment.customerId,
            previousStamps: currentStamps,
            newStamps,
            totalStamps,
            cycle: newCycle,
            rolledOver,
            lifetimeStamps,
          }),
        },
      });

      // Fetch unlocked rewards in this program
      const unlockedRewards = await tx.reward.findMany({
        where: {
          programId: verification.enrollment.programId,
          stampsRequired: { lte: newStamps },
          isActive: true,
        },
        orderBy: { stampsRequired: "asc" },
      });

      const existingRedemptions = await tx.rewardRedemption.findMany({
        where: {
          enrollmentId: verification.enrollmentId,
          cycle: newCycle,
          status: "REDEEMED",
        },
      });
      const redeemedSet = new Set(existingRedemptions.map((r) => r.rewardId));

      const redeemableRewards = unlockedRewards.map((r) => ({
        id: r.id,
        title: r.title,
        stampsRequired: r.stampsRequired,
        rewardType: r.rewardType,
        isRedeemed: redeemedSet.has(r.id),
      }));

      return {
        success: true,
        transactionId: transaction.id,
        enrollmentId: verification.enrollmentId,
        currentStamps: updatedEnrollment.currentStamps,
        currentCycle: updatedEnrollment.currentCycle,
        lifetimeStamps: updatedEnrollment.lifetimeStamps,
        totalStamps,
        hasReachedCardCompletion: newStamps >= totalStamps,
        rolledOver,
        redeemableRewards,
      };
    });
  }
}
