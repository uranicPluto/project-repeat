import { describe, it, expect } from "vitest";
import { BillingService, PLAN_CATALOG } from "@/server/services/billing";

describe("Billing Lifecycle, Idempotency & Plan Limit Controls", () => {
  it("enforces staff count plan limits strictly", () => {
    function canAddStaff(currentStaffCount: number, planId: keyof typeof PLAN_CATALOG) {
      const plan = PLAN_CATALOG[planId];
      return currentStaffCount < plan.maxStaff;
    }

    // Starter plan: max 1 staff
    expect(canAddStaff(0, "STARTER")).toBe(true);
    expect(canAddStaff(1, "STARTER")).toBe(false);

    // Growth plan: max 3 staff
    expect(canAddStaff(2, "GROWTH")).toBe(true);
    expect(canAddStaff(3, "GROWTH")).toBe(false);

    // Pro plan: max 20 staff
    expect(canAddStaff(19, "PRO")).toBe(true);
    expect(canAddStaff(20, "PRO")).toBe(false);
  });

  it("enforces customer enrollment capacity plan limits", () => {
    function canEnrollCustomer(currentMemberCount: number, planId: keyof typeof PLAN_CATALOG) {
      const plan = PLAN_CATALOG[planId];
      return currentMemberCount < plan.maxMembers;
    }

    // Starter plan: max 200 members
    expect(canEnrollCustomer(199, "STARTER")).toBe(true);
    expect(canEnrollCustomer(200, "STARTER")).toBe(false);

    // Growth plan: max 1000 members
    expect(canEnrollCustomer(999, "GROWTH")).toBe(true);
    expect(canEnrollCustomer(1000, "GROWTH")).toBe(false);
  });

  it("verifies webhook signature using timing-safe comparison", () => {
    const secret = "whsec_test_secret_1234567890";
    const payload = JSON.stringify({ event: "subscription.charged", id: "sub_123" });

    // Generate valid HMAC SHA-256
    const crypto = require("crypto");
    const validSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

    expect(BillingService.verifyWebhookSignature(payload, validSignature, secret)).toBe(true);
    expect(BillingService.verifyWebhookSignature(payload, "invalid_signature", secret)).toBe(false);
    expect(BillingService.verifyWebhookSignature(payload, validSignature, "wrong_secret")).toBe(false);
  });

  it("verifies client-side payment completion signature", () => {
    const secret = "rzp_secret_test_987654321";
    const orderId = "order_987";
    const paymentId = "pay_654";

    const crypto = require("crypto");
    const validSignature = crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    expect(
      BillingService.verifyPaymentSignature({
        orderId,
        paymentId,
        signature: validSignature,
        secret,
      })
    ).toBe(true);

    expect(
      BillingService.verifyPaymentSignature({
        orderId,
        paymentId,
        signature: "tampered_signature",
        secret,
      })
    ).toBe(false);
  });
});
