import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/auth/session";
import { validateLiveBusinessAccess } from "@/lib/permissions/rbac";
import { LoyaltyService } from "@/server/services/loyalty";
import { redeemRewardSchema } from "@/lib/validation/schemas";

export async function POST(req: NextRequest) {
  try {
    const session = await getRequestSession(req);
    const body = await req.json();
    const validated = redeemRewardSchema.parse(body);

    // Enforce live business authorization for staff
    await validateLiveBusinessAccess(session, validated.businessId, ["OWNER", "MANAGER", "STAFF"]);

    const redemption = await LoyaltyService.redeemReward({
      enrollmentId: validated.enrollmentId,
      rewardId: validated.rewardId,
      staffUserId: session!.userId,
      businessId: validated.businessId,
    });

    return NextResponse.json({
      success: true,
      message: "Reward redeemed successfully!",
      redemption,
    });
  } catch (error: any) {
    if (error.name === "AuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to redeem reward" }, { status: 400 });
  }
}
