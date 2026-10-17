import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getRequestSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const session = await getRequestSession(req);
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        enrollments: {
          include: {
            business: {
              select: {
                id: true,
                name: true,
                slug: true,
                category: true,
              },
            },
            program: {
              select: {
                id: true,
                name: true,
                cardTitle: true,
                totalStamps: true,
              },
            },
            transactions: {
              orderBy: { createdAt: "desc" },
            },
            redemptions: {
              include: {
                reward: {
                  select: {
                    title: true,
                    rewardType: true,
                    stampsRequired: true,
                  },
                },
              },
            },
          },
        },
        auditLogs: {
          take: 50,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User record not found" }, { status: 404 });
    }

    // Consent records
    const consent = await prisma.customerConsent.findMany({
      where: { customerId: session.userId },
    });

    const exportData = {
      exportMetadata: {
        generatedAt: new Date().toISOString(),
        regulation: "DPDP (India) / GDPR (EU) Data Portability Record",
        platform: "Project Repeat (House of Workflow)",
      },
      userProfile: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
      privacyConsent: consent,
      loyaltyEnrollments: user.enrollments.map((e) => ({
        business: e.business.name,
        businessSlug: e.business.slug,
        cardTitle: e.program.cardTitle,
        currentStamps: e.currentStamps,
        currentCycle: e.currentCycle,
        lifetimeStamps: e.lifetimeStamps,
        status: e.status,
        enrolledAt: e.enrolledAt,
        visitTransactions: e.transactions.map((t) => ({
          type: t.type,
          stampsDelta: t.stampsDelta,
          balanceAfter: t.balanceAfter,
          referenceCode: t.referenceCode,
          timestamp: t.createdAt,
        })),
        redemptions: e.redemptions.map((r) => ({
          reward: r.reward.title,
          stampsRequired: r.reward.stampsRequired,
          cycle: r.cycle,
          status: r.status,
          redemptionCode: r.redemptionCode,
          redeemedAt: r.redeemedAt,
        })),
      })),
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="project-repeat-data-export-${session.userId}.json"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to export data" }, { status: 500 });
  }
}
