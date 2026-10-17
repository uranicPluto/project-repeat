import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getRequestSession } from "@/lib/auth/session";
import { validateLiveBusinessAccess } from "@/lib/permissions/rbac";
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

    // Enforce live OWNER role check
    await validateLiveBusinessAccess(session, businessId, ["OWNER"]);

    const targetPlan = PLAN_CATALOG[planId];
    if (!targetPlan) {
      return NextResponse.json({ error: "Invalid subscription plan selected" }, { status: 400 });
    }

    const isRazorpayConfigured = Boolean(
      process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    );

    // In production without live credentials, block unverified plan spoofing
    if (
      process.env.NODE_ENV === "production" &&
      !isRazorpayConfigured &&
      process.env.ALLOW_SANDBOX_BILLING !== "true"
    ) {
      return NextResponse.json(
        {
          error:
            "Live payment gateway is unconfigured. To activate paid subscriptions in production, configure RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and RAZORPAY_WEBHOOK_SECRET in your environment.",
          isConfigured: false,
        },
        { status: 503 }
      );
    }

    // If Razorpay is configured in production, generate checkout parameters for live payment flow
    if (isRazorpayConfigured && process.env.NODE_ENV === "production") {
      return NextResponse.json({
        success: true,
        checkoutRequired: true,
        keyId: process.env.RAZORPAY_KEY_ID,
        amount: targetPlan.priceMinorUnits,
        currency: "INR",
        plan: targetPlan,
        businessId,
        message: `Initiate checkout for ${targetPlan.name} plan at ₹${targetPlan.priceMonthlyINR}/mo.`,
      });
    }

    // In development or sandbox evaluation mode:
    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const subscription = await prisma.subscription.upsert({
      where: { businessId },
      update: {
        planId,
        status: "ACTIVE",
        currentPeriodStart,
        currentPeriodEnd,
        paymentProvider: "mock_sandbox",
      },
      create: {
        businessId,
        planId,
        status: "ACTIVE",
        currentPeriodStart,
        currentPeriodEnd,
        paymentProvider: "mock_sandbox",
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
