import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword, createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { registerBusinessSchema } from "@/lib/validation/schemas";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerBusinessSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
    }

    // Generate unique slug
    let baseSlug = slugify(validated.businessName);
    if (!baseSlug) baseSlug = "business";
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.business.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const passwordHash = await hashPassword(validated.password);

    // Atomic business & owner creation
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: validated.name,
          email: validated.email.toLowerCase(),
          phone: validated.phone || null,
          passwordHash,
          role: "BUSINESS_USER",
        },
      });

      const business = await tx.business.create({
        data: {
          name: validated.businessName,
          slug,
          category: validated.category,
          status: "ACTIVE",
          primaryColor: "#315EFB",
          secondaryColor: "#101828",
        },
      });

      const membership = await tx.businessMembership.create({
        data: {
          userId: user.id,
          businessId: business.id,
          role: "OWNER",
        },
      });

      // Default Loyalty Program (5 stamps)
      const program = await tx.loyaltyProgram.create({
        data: {
          businessId: business.id,
          name: `${business.name} Rewards`,
          cardTitle: `${business.name} Loyalty Card`,
          totalStamps: 5,
          stampIcon: "cup",
          status: "PUBLISHED",
          terms: "Collect 5 stamps to unlock a special reward on your next visit.",
        },
      });

      // Default milestone reward
      await tx.reward.create({
        data: {
          programId: program.id,
          stampsRequired: 5,
          title: "Complimentary Reward",
          description: "Redeem for a complimentary beverage or treat on your 5th visit.",
          rewardType: "FREE_ITEM",
          validityDays: 30,
        },
      });

      // Starter subscription (30 days period)
      await tx.subscription.create({
        data: {
          businessId: business.id,
          planId: "STARTER",
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          paymentProvider: "mock",
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: user.id,
          businessId: business.id,
          action: "BUSINESS_REGISTERED",
          details: JSON.stringify({ businessName: business.name, slug: business.slug }),
        },
      });

      return { user, business, membership };
    });

    const token = await createSessionToken({
      userId: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: "BUSINESS_USER",
      businessMemberships: [
        {
          businessId: result.business.id,
          businessSlug: result.business.slug,
          role: "OWNER",
        },
      ],
    });

    const response = NextResponse.json({
      success: true,
      business: { id: result.business.id, name: result.business.name, slug: result.business.slug },
      user: { id: result.user.id, name: result.user.name, email: result.user.email, role: result.user.role },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to register business" }, { status: 500 });
  }
}
