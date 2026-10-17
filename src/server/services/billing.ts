import { prisma } from "@/lib/db/prisma";
import crypto from "crypto";

export interface PlanConfig {
  id: "STARTER" | "GROWTH" | "PRO" | "ENTERPRISE";
  name: string;
  priceMonthlyINR: number;
  priceMinorUnits: number; // in paise
  maxMembers: number;
  maxStaff: number;
  features: string[];
  isPopular?: boolean;
}

export const PLAN_CATALOG: Record<string, PlanConfig> = {
  STARTER: {
    id: "STARTER",
    name: "Starter",
    priceMonthlyINR: 299,
    priceMinorUnits: 29900,
    maxMembers: 200,
    maxStaff: 1,
    features: [
      "1 Business Location",
      "Up to 200 loyalty members",
      "1 Staff counter account",
      "Digital loyalty card builder",
      "Dynamic QR code generator",
      "Real-time visit verification",
      "Standard email support",
    ],
  },
  GROWTH: {
    id: "GROWTH",
    name: "Growth",
    priceMonthlyINR: 499,
    priceMinorUnits: 49900,
    maxMembers: 1000,
    maxStaff: 3,
    isPopular: true,
    features: [
      "1 Business Location",
      "Up to 1,000 loyalty members",
      "3 Staff counter accounts",
      "Custom branding & stamp icons",
      "Customer engagement campaigns",
      "Exportable customer CSV",
      "Priority email & chat support",
    ],
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    priceMonthlyINR: 999,
    priceMinorUnits: 99900,
    maxMembers: 100000,
    maxStaff: 20,
    features: [
      "Multi-location support",
      "Unlimited loyalty members",
      "Up to 20 staff accounts",
      "Advanced retention analytics",
      "Custom reward milestone logic",
      "Dedicated account manager",
      "Webhook & API access",
    ],
  },
  ENTERPRISE: {
    id: "ENTERPRISE",
    name: "Enterprise",
    priceMonthlyINR: 2499,
    priceMinorUnits: 249900,
    maxMembers: 999999,
    maxStaff: 100,
    features: [
      "Unlimited locations",
      "Unlimited loyalty members",
      "Unlimited staff accounts",
      "Custom contract & SLA",
      "White-label custom domain",
      "Direct POS & ERP integrations",
      "24/7 Phone & Slack support",
    ],
  },
};

export class BillingService {
  /**
   * Get subscription status for a business
   */
  static async getBusinessSubscription(businessId: string) {
    const sub = await prisma.subscription.findUnique({
      where: { businessId },
    });

    const planKey = (sub?.planId || "STARTER") as keyof typeof PLAN_CATALOG;
    const plan = PLAN_CATALOG[planKey] || PLAN_CATALOG.STARTER;

    return {
      subscription: sub,
      plan,
      isConfigured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    };
  }

  /**
   * Verify Razorpay Webhook signature with timing-safe comparison
   */
  static verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    if (!secret || !signature) return false;
    const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    const expectedBuf = Buffer.from(expectedSignature);
    const signatureBuf = Buffer.from(signature);
    if (expectedBuf.length !== signatureBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, signatureBuf);
  }

  /**
   * Verify Razorpay client-side payment completion signature
   */
  static verifyPaymentSignature(params: {
    orderId: string;
    paymentId: string;
    signature: string;
    secret: string;
  }): boolean {
    const { orderId, paymentId, signature, secret } = params;
    if (!secret || !signature) return false;
    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto.createHmac("sha256", secret).update(text).digest("hex");
    const expectedBuf = Buffer.from(expectedSignature);
    const signatureBuf = Buffer.from(signature);
    if (expectedBuf.length !== signatureBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, signatureBuf);
  }

  /**
   * Handle incoming payment webhook idempotently with full lifecycle support
   */
  static async handlePaymentWebhook(event: {
    id: string;
    type: string;
    businessId: string;
    planId?: string;
  }) {
    // Check idempotency: if event ID has already been processed, skip duplicate execution
    const duplicateCheck = await prisma.auditLog.findFirst({
      where: {
        action: "WEBHOOK_PROCESSED",
        details: { contains: event.id },
      },
    });

    if (duplicateCheck) {
      return { duplicate: true };
    }

    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    let targetStatus = "ACTIVE";

    if (event.type === "subscription.cancelled") {
      targetStatus = "CANCELLED";
    } else if (event.type === "subscription.halted" || event.type === "payment.failed") {
      targetStatus = "PAST_DUE";
    } else if (event.type === "subscription.paused") {
      targetStatus = "PAUSED";
    }

    const planId = event.planId || "GROWTH";

    const subscription = await prisma.subscription.upsert({
      where: { businessId: event.businessId },
      update: {
        planId,
        status: targetStatus,
        currentPeriodStart,
        currentPeriodEnd,
        providerSubscriptionId: event.id,
      },
      create: {
        businessId: event.businessId,
        planId,
        status: targetStatus,
        currentPeriodStart,
        currentPeriodEnd,
        paymentProvider: "razorpay",
        providerSubscriptionId: event.id,
      },
    });

    // Record idempotent webhook processing audit log
    await prisma.auditLog.create({
      data: {
        businessId: event.businessId,
        action: "WEBHOOK_PROCESSED",
        details: JSON.stringify({
          webhookEventId: event.id,
          eventType: event.type,
          targetStatus,
          planId,
        }),
      },
    });

    return { duplicate: false, subscription };
  }
}
