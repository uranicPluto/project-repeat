import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword, createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/schemas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() },
      include: {
        memberships: {
          include: {
            business: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json({ error: "This account is suspended or inactive" }, { status: 403 });
    }

    const isMatch = await verifyPassword(validated.password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const businessMemberships = user.memberships.map((m) => ({
      businessId: m.businessId,
      businessSlug: m.business.slug,
      role: m.role as "OWNER" | "MANAGER" | "STAFF",
    }));

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      businessMemberships,
    });

    // Determine default redirect
    let redirectTo = "/wallet";
    if (user.role === "PLATFORM_ADMIN") {
      redirectTo = "/platform-admin";
    } else if (businessMemberships.length > 0) {
      redirectTo = `/dashboard/${businessMemberships[0].businessSlug}`;
    }

    const response = NextResponse.json({
      success: true,
      redirectTo,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessMemberships,
      },
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
    return NextResponse.json({ error: error.message || "Failed to sign in" }, { status: 500 });
  }
}
