import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/auth/session";
import { LoyaltyService } from "@/server/services/loyalty";

export async function POST(req: NextRequest) {
  try {
    const session = await getRequestSession(req);
    if (!session) {
      return NextResponse.json({ error: "Please sign in to join this loyalty program" }, { status: 401 });
    }

    const body = await req.json();
    const { programId } = body;

    if (!programId) {
      return NextResponse.json({ error: "Program ID is required" }, { status: 400 });
    }

    const enrollment = await LoyaltyService.enrollCustomer(session.userId, programId);

    return NextResponse.json({
      success: true,
      message: "Successfully joined loyalty program",
      enrollment,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to join program" }, { status: 400 });
  }
}
