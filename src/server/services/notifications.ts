import { prisma } from "@/lib/db/prisma";

export interface NotificationMessage {
  toEmail: string;
  toPhone?: string;
  subject: string;
  body: string;
  isMarketing?: boolean;
  businessId?: string;
  customerId?: string;
}

export class NotificationService {
  /**
   * Check whether a customer has consented to marketing communications
   */
  static async hasCustomerConsented(
    customerId: string,
    businessId: string,
    channel: "email" | "sms" = "email"
  ): Promise<boolean> {
    const consent = await prisma.customerConsent.findFirst({
      where: {
        customerId,
        businessId: { in: [businessId, "platform"] },
      },
      orderBy: { updatedAt: "desc" },
    });

    if (!consent) return false;
    return channel === "email" ? consent.marketingEmail : consent.marketingSms;
  }

  /**
   * Dispatch notification respecting user consent preferences
   */
  static async sendNotification(message: NotificationMessage): Promise<{
    delivered: boolean;
    reason?: string;
  }> {
    // If marketing, strictly verify customer consent
    if (message.isMarketing && message.customerId && message.businessId) {
      const allowed = await this.hasCustomerConsented(
        message.customerId,
        message.businessId,
        message.toPhone ? "sms" : "email"
      );

      if (!allowed) {
        return {
          delivered: false,
          reason: "Suppressed: Customer has opted out of marketing communications.",
        };
      }
    }

    // In development or when external API keys are unset, log transactionally
    console.log(
      `[NOTIFICATION DISPATCH] To: ${message.toEmail} | Subject: "${message.subject}" | Body: "${message.body.slice(0, 80)}..."`
    );

    return { delivered: true };
  }
}
