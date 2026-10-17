import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getRequestSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getRequestSession(req);
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    if (body.confirmation !== "DELETE") {
      return NextResponse.json(
        { error: 'Please confirm account deletion by providing confirmation: "DELETE"' },
        { status: 400 }
      );
    }

    // Check if user is a business owner of an active business
    const ownerMembership = await prisma.businessMembership.findFirst({
      where: {
        userId: session.userId,
        role: "OWNER",
      },
      include: { business: true },
    });

    if (ownerMembership) {
      return NextResponse.json(
        {
          error: `Cannot delete account: You are the designated owner of "${ownerMembership.business.name}". Please transfer ownership or archive your business before deleting your personal account.`,
        },
        { status: 400 }
      );
    }

    // Anonymize/erase personal customer data
    await prisma.$transaction(async (tx) => {
      // Delete user enrollments and verifications (cascade will handle child transactions)
      await tx.user.delete({
        where: { id: session.userId },
      });

      // Audit log of anonymized deletion
      await tx.auditLog.create({
        data: {
          action: "ACCOUNT_DELETED",
          details: JSON.stringify({
            deletedUserId: session.userId,
            deletedEmail: session.email,
            reason: "User initiated privacy erasure (Right to be Forgotten)",
          }),
        },
      });
    });

    const response = NextResponse.json({
      success: true,
      message: "Your account and all associated personal loyalty records have been permanently erased.",
    });

    // Clear session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process deletion request" }, { status: 500 });
  }
}
