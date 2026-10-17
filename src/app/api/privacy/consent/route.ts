import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getRequestSession } from "@/lib/auth/session";
import { z } from "zod";

const consentSchema = z.object({
  businessId: z.string().optional(),
  marketingEmail: z.boolean(),
  marketingSms: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getRequestSession(req);
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const validated = consentSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { enrollments: true },
    });

    const businessId = validated.businessId || user?.enrollments[0]?.businessId || "platform";

    const consent = await prisma.customerConsent.upsert({
      where: {
        customerId_businessId: {
          customerId: session.userId,
          businessId,
        },
      },
      update: {
        marketingEmail: validated.marketingEmail,
        marketingSms: validated.marketingSms ?? false,
      },
      create: {
        customerId: session.userId,
        businessId,
        marketingEmail: validated.marketingEmail,
        marketingSms: validated.marketingSms ?? false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Communication preferences updated successfully",
      consent,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to update consent preferences" }, { status: 500 });
  }
}
