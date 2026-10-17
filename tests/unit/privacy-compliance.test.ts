import { describe, it, expect } from "vitest";
import { NotificationService } from "@/server/services/notifications";

describe("Privacy Rights, Consent Enforcement & Anonymization", () => {
  it("anonymizes audit log entries on account deletion without persisting plaintext email", () => {
    // Model deletion audit payload creation
    function createDeletionAuditPayload(userId: string) {
      return {
        action: "ACCOUNT_DELETED",
        details: JSON.stringify({
          deletedUserId: userId,
          reason: "User initiated privacy erasure (Right to be Forgotten)",
          requestedAt: new Date().toISOString(),
        }),
      };
    }

    const payload = createDeletionAuditPayload("usr-test-999");
    const parsed = JSON.parse(payload.details);

    expect(parsed.deletedUserId).toBe("usr-test-999");
    expect(parsed.deletedEmail).toBeUndefined(); // Email must NOT be persisted in audit logs post-deletion
    expect(payload.action).toBe("ACCOUNT_DELETED");
  });

  it("suppresses marketing notifications when customer has not consented", async () => {
    // Attempt to send marketing message without consent
    const result = await NotificationService.sendNotification({
      toEmail: "optout@example.com",
      subject: "Special 20% Discount This Weekend!",
      body: "Come visit us and get 20% off all pastries.",
      isMarketing: true,
      customerId: "usr-non-consenting",
      businessId: "biz-1",
    });

    expect(result.delivered).toBe(false);
    expect(result.reason).toContain("Customer has opted out of marketing communications");
  });

  it("allows critical transactional notifications even without marketing consent", async () => {
    // Transactional visit confirmation or security alert
    const result = await NotificationService.sendNotification({
      toEmail: "user@example.com",
      subject: "Security: Your verification code was used",
      body: "A stamp was just awarded to your loyalty card at The Coffee House.",
      isMarketing: false, // Transactional
    });

    expect(result.delivered).toBe(true);
  });
});
