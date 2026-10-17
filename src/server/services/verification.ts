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

    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
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
      // Find pending verification record
      const verification = await tx.visitVerification.findFirst({
        where: {
          code,
          status: "PENDING",
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
        throw new Error("Invalid or already used verification code");
      }

      // Check business tenant isolation
      if (verification.enrollment.businessId !== businessId) {
        throw new Error("This verification code belongs to a different business");
      }

      // Check expiration
      if (new Date() > verification.expiresAt) {
        await tx.visitVerification.update({
          where: { id: verification.id },
          data: { status: "EXPIRED" },
        });
        throw new Error("Verification code has expired. Please ask the customer to generate a new one.");
      }

      const currentStamps = verification.enrollment.currentStamps;
      const totalStamps = verification.enrollment.program.totalStamps;
      const newStamps = currentStamps + 1;

      // Update enrollment counter
      const updatedEnrollment = await tx.loyaltyEnrollment.update({
        where: { id: verification.enrollmentId },
        data: {
          currentStamps: newStamps,
        },
      });

      // Mark verification code as used
      await tx.visitVerification.update({
        where: { id: verification.id },
        data: {
          status: "VERIFIED",
          verifiedByStaffId: staffUserId,
          verifiedAt: new Date(),
        },
      });

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
          }),
        },
      });

      return {
        success: true,
        transactionId: transaction.id,
        currentStamps: updatedEnrollment.currentStamps,
        totalStamps,
        hasReachedCardCompletion: newStamps >= totalStamps,
      };
    });
  }
}
