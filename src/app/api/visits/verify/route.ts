import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/auth/session";
import { validateLiveBusinessAccess } from "@/lib/permissions/rbac";
import { VerificationService } from "@/server/services/verification";
import { verifyVisitSchema } from "@/lib/validation/schemas";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getRequestSession(req);
    const body = await req.json();
    const validated = verifyVisitSchema.parse(body);

    let businessId = validated.businessId;

    // Resolve businessId from businessSlug if not directly provided
    if (!businessId && validated.businessSlug) {
      const biz = await prisma.business.findUnique({
        where: { slug: validated.businessSlug },
        select: { id: true },
      });
      if (biz) {
        businessId = biz.id;
      }
    }

    if (!businessId) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Enforce live server-side authorization: staff must have active membership in this business
    await validateLiveBusinessAccess(session, businessId, ["OWNER", "MANAGER", "STAFF"]);

    const result = await VerificationService.verifyVisitByCode({
      code: validated.code.trim(),
      businessId,
      staffUserId: session!.userId,
      referenceCode: validated.referenceCode,
    });

    return NextResponse.json({
      success: true,
      message: "Visit verified successfully. Stamp awarded!",
      data: result,
    });
  } catch (error: any) {
    if (error.name === "AuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Verification failed" }, { status: 400 });
  }
}
