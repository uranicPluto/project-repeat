import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/auth/session";
import { VerificationService } from "@/server/services/verification";
import { createVerificationTokenSchema } from "@/lib/validation/schemas";

export async function POST(req: NextRequest) {
  try {
    const session = await getRequestSession(req);
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { enrollmentId } = createVerificationTokenSchema.parse(body);

    const result = await VerificationService.createVerificationCode(enrollmentId, session.userId);

    return NextResponse.json({
      success: true,
      code: result.code,
      expiresAt: result.expiresAt,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to generate verification code" }, { status: 400 });
  }
}
