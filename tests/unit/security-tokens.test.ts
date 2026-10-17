import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
  SessionPayload,
} from "@/lib/auth/session";
import { BillingService } from "@/server/services/billing";
import crypto from "crypto";

describe("Security, Cryptography & Session Tokens", () => {
  it("hashes passwords securely with bcrypt salt and verifies accurately", async () => {
    const raw = "SuperSecretPassword123!";
    const hash = await hashPassword(raw);

    expect(hash).not.toBe(raw);
    expect(hash.startsWith("$2a$") || hash.startsWith("$2b$")).toBe(true);

    const isMatch = await verifyPassword(raw, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await verifyPassword("WrongPassword123!", hash);
    expect(isWrongMatch).toBe(false);
  });

  it("creates and verifies tamper-proof session JWT tokens", async () => {
    const payload: SessionPayload = {
      userId: "usr-test-123",
      email: "tester@example.com",
      name: "Tester",
      role: "CUSTOMER",
    };

    const token = await createSessionToken(payload);
    expect(token).toBeDefined();

    const decoded = await verifySessionToken(token);
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.email).toBe(payload.email);
    expect(decoded?.role).toBe(payload.role);

    // Tampered token fails verification
    const tampered = token.slice(0, -5) + "abcde";
    const failedDecoded = await verifySessionToken(tampered);
    expect(failedDecoded).toBeNull();
  });

  it("verifies Razorpay payment webhook signatures using timingSafeEqual", () => {
    const secret = "webhook_secret_key_123";
    const payload = JSON.stringify({ event: "subscription.charged", id: "sub_123" });
    const validSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

    expect(BillingService.verifyWebhookSignature(payload, validSignature, secret)).toBe(true);

    // Invalid signature fails
    expect(BillingService.verifyWebhookSignature(payload, "invalid_signature", secret)).toBe(false);

    // Tampered payload fails
    expect(
      BillingService.verifyWebhookSignature(payload + "tampered", validSignature, secret)
    ).toBe(false);
  });
});
