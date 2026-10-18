import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getRequestSession(req);
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const enrollmentId = searchParams.get("enrollmentId");

    if (!code && !enrollmentId) {
      return NextResponse.json({ error: "Code or enrollmentId required" }, { status: 400 });
    }

    const verification = await prisma.visitVerification.findFirst({
      where: {
        ...(code ? { code } : {}),
        ...(enrollmentId ? { enrollmentId } : {}),
        enrollment: { customerId: session.userId },
      },
      orderBy: { createdAt: "desc" },
      include: {
        enrollment: {
          include: {
            program: true,
          },
        },
      },
    });

    if (!verification) {
      return NextResponse.json({ status: "NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({
      status: verification.status,
      verifiedAt: verification.verifiedAt,
      currentStamps: verification.enrollment.currentStamps,
      totalStamps: verification.enrollment.program.totalStamps,
      currentCycle: verification.enrollment.currentCycle || 1,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to check status" }, { status: 500 });
  }
}
