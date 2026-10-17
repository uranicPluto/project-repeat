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

    // Process subscription lifecycle events
    const supportedEvents = new Set([
      "subscription.activated",
      "subscription.charged",
      "subscription.cancelled",
      "subscription.halted",
      "subscription.paused",
      "payment.failed",
    ]);

    if (supportedEvents.has(event.event)) {
      const entity = event.payload?.subscription?.entity || event.payload?.payment?.entity;
      const businessId = entity?.notes?.businessId;
      const planId = entity?.notes?.planId || "GROWTH";
      const eventId = event.id || entity?.id || `evt-${Date.now()}`;

      if (businessId) {
        await BillingService.handlePaymentWebhook({
          id: eventId,
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
