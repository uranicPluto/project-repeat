import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getRequestSession } from "@/lib/auth/session";
import { validateLiveBusinessAccess } from "@/lib/permissions/rbac";
import { loyaltyProgramSchema } from "@/lib/validation/schemas";

export async function POST(req: NextRequest) {
  try {
    const session = await getRequestSession(req);
    const body = await req.json();
    const { businessId, programId, primaryColor, secondaryColor, ...programData } = body;

    const validated = loyaltyProgramSchema.parse(programData);
    await validateLiveBusinessAccess(session, businessId, ["OWNER", "MANAGER"]);

    // Update business branding colors
    await prisma.business.update({
      where: { id: businessId },
      data: {
        primaryColor: primaryColor || "#315EFB",
        secondaryColor: secondaryColor || "#101828",
      },
    });

    // Atomic program & rewards update with non-destructive versioning
    const updatedProgram = await prisma.$transaction(async (tx) => {
      let program;
      if (programId) {
        const existingProgram = await tx.loyaltyProgram.findUnique({
          where: { id: programId },
        });

        if (!existingProgram || existingProgram.businessId !== businessId) {
          throw new Error("Unauthorized: Target loyalty program does not belong to this business");
        }

        program = await tx.loyaltyProgram.update({
          where: { id: programId },
          data: {
            name: validated.name,
            cardTitle: validated.cardTitle,
            totalStamps: validated.totalStamps,
            stampIcon: validated.stampIcon,
            terms: validated.terms || null,
          },
        });

        // Safe non-destructive update: Deactivate existing rewards to preserve historical redemptions
        const existingRewards = await tx.reward.findMany({
          where: { programId },
        });

        await tx.reward.updateMany({
          where: { programId },
          data: { isActive: false },
        });

        // Upsert or reactivate rewards by milestone threshold
        for (const r of validated.rewards) {
          const match = existingRewards.find((er) => er.stampsRequired === r.stampsRequired);
          if (match) {
            await tx.reward.update({
              where: { id: match.id },
              data: {
                title: r.title,
                description: r.description || null,
                rewardType: r.rewardType,
                discountValue: r.discountValue || null,
                validityDays: r.validityDays || 30,
                isActive: true,
              },
            });
          } else {
            await tx.reward.create({
              data: {
                programId: program.id,
                stampsRequired: r.stampsRequired,
                title: r.title,
                description: r.description || null,
                rewardType: r.rewardType,
                discountValue: r.discountValue || null,
                validityDays: r.validityDays || 30,
                isActive: true,
              },
            });
          }
        }
      } else {
        program = await tx.loyaltyProgram.create({
          data: {
            businessId,
            name: validated.name,
            cardTitle: validated.cardTitle,
            totalStamps: validated.totalStamps,
            stampIcon: validated.stampIcon,
            terms: validated.terms || null,
            status: "PUBLISHED",
          },
        });

        for (const r of validated.rewards) {
          await tx.reward.create({
            data: {
              programId: program.id,
              stampsRequired: r.stampsRequired,
              title: r.title,
              description: r.description || null,
              rewardType: r.rewardType,
              discountValue: r.discountValue || null,
              validityDays: r.validityDays || 30,
              isActive: true,
            },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          actorUserId: session!.userId,
          businessId,
          action: "PROGRAM_UPDATED",
          details: JSON.stringify({ programId: program.id, totalStamps: program.totalStamps }),
        },
      });

      return program;
    });

    return NextResponse.json({
      success: true,
      message: "Loyalty program updated and published successfully",
      program: updatedProgram,
    });
  } catch (error: any) {
    if (error.name === "AuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to update program" }, { status: 400 });
  }
}
