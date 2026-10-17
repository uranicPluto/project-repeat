import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getRequestSession } from "@/lib/auth/session";
import { requireBusinessAccess } from "@/lib/permissions/rbac";
import { PLAN_CATALOG } from "@/server/services/billing";
import { z } from "zod";

const changePlanSchema = z.object({
  businessId: z.string(),
  planId: z.enum(["STARTER", "GROWTH", "PRO", "ENTERPRISE"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getRequestSession(req);
    const body = await req.json();
    const { businessId, planId } = changePlanSchema.parse(body);

    // Enforce OWNER role check
    requireBusinessAccess(session, businessId, ["OWNER"]);

    const targetPlan = PLAN_CATALOG[planId];
    if (!targetPlan) {
      return NextResponse.json({ error: "Invalid subscription plan selected" }, { status: 400 });
    }

    const isRazorpayConfigured = Boolean(
      process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    );

    // If live credentials are not present, operate in sandbox test mode
    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const subscription = await prisma.subscription.upsert({
      where: { businessId },
      update: {
        planId,
        status: "ACTIVE",
        currentPeriodStart,
        currentPeriodEnd,
        paymentProvider: isRazorpayConfigured ? "razorpay" : "mock_sandbox",
      },
      create: {
        businessId,
        planId,
        status: "ACTIVE",
        currentPeriodStart,
        currentPeriodEnd,
        paymentProvider: isRazorpayConfigured ? "razorpay" : "mock_sandbox",
      },
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: session!.userId,
        businessId,
        action: "SUBSCRIPTION_CHANGED",
        details: JSON.stringify({
          newPlanId: planId,
          planName: targetPlan.name,
          mode: isRazorpayConfigured ? "live" : "sandbox",
          priceMonthlyINR: targetPlan.priceMonthlyINR,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: isRazorpayConfigured
        ? `Switched to ${targetPlan.name} plan successfully.`
        : `[Sandbox Mode] Switched to ${targetPlan.name} plan successfully for evaluation.`,
      subscription,
      plan: targetPlan,
      isSandbox: !isRazorpayConfigured,
    });
  } catch (error: any) {
    if (error.name === "AuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to update subscription" }, { status: 400 });
  }
}
