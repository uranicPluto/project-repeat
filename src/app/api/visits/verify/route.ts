import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/auth/session";
import { requireBusinessAccess } from "@/lib/permissions/rbac";
import { VerificationService } from "@/server/services/verification";
import { verifyVisitSchema } from "@/lib/validation/schemas";

export async function POST(req: NextRequest) {
  try {
    const session = await getRequestSession(req);
    const body = await req.json();
    const validated = verifyVisitSchema.parse(body);

    // Enforce server-side authorization: staff must have membership in this business
    requireBusinessAccess(session, validated.businessId, ["OWNER", "MANAGER", "STAFF"]);

    const result = await VerificationService.verifyVisitByCode({
      code: validated.code,
      businessId: validated.businessId,
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
