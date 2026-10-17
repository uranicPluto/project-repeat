import { NextRequest, NextResponse } from "next/server";
import { BillingService } from "@/server/services/billing";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      return NextResponse.json(
        { error: "Payment webhook secret unconfigured on server" },
        { status: 501 }
      );
    }

    if (!signature || !BillingService.verifyWebhookSignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // Process subscription events
    if (event.event === "subscription.activated" || event.event === "subscription.charged") {
      const sub = event.payload.subscription.entity;
      const businessId = sub.notes?.businessId;
      const planId = sub.notes?.planId || "GROWTH";

      if (businessId) {
        await BillingService.handlePaymentWebhook({
          id: sub.id,
          type: event.event,
          businessId,
          planId,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Webhook error" }, { status: 500 });
  }
}
