import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getRequestSession, hashPassword } from "@/lib/auth/session";
import { validateLiveBusinessAccess } from "@/lib/permissions/rbac";
import { PLAN_CATALOG } from "@/server/services/billing";
import { z } from "zod";

const addStaffSchema = z.object({
  businessId: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["MANAGER", "STAFF"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getRequestSession(req);
    const body = await req.json();
    const validated = addStaffSchema.parse(body);

    // Only active OWNER can add staff
    await validateLiveBusinessAccess(session, validated.businessId, ["OWNER"]);

    // Enforce plan limit for staff accounts
    const currentStaffCount = await prisma.businessMembership.count({
      where: {
        businessId: validated.businessId,
        role: { in: ["MANAGER", "STAFF"] },
      },
    });

    const subscription = await prisma.subscription.findUnique({
      where: { businessId: validated.businessId },
    });
    const planKey = (subscription?.planId || "STARTER") as keyof typeof PLAN_CATALOG;
    const plan = PLAN_CATALOG[planKey] || PLAN_CATALOG.STARTER;

    if (currentStaffCount >= plan.maxStaff) {
      return NextResponse.json(
        {
          error: `Plan limit reached: Your current ${plan.name} plan allows up to ${plan.maxStaff} staff account(s). Please upgrade your subscription to add more team members.`,
        },
        { status: 403 }
      );
    }

    let user = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() },
    });

    if (!user) {
      const passwordHash = await hashPassword(validated.password);
      user = await prisma.user.create({
        data: {
          name: validated.name,
          email: validated.email.toLowerCase(),
          passwordHash,
          role: "BUSINESS_USER",
        },
      });
    }

    // Check if membership already exists
    const existingMem = await prisma.businessMembership.findUnique({
      where: {
        userId_businessId: {
          userId: user.id,
          businessId: validated.businessId,
        },
      },
    });

    if (existingMem) {
      return NextResponse.json({ error: "User is already a member of this business" }, { status: 400 });
    }

    const membership = await prisma.businessMembership.create({
      data: {
        userId: user.id,
        businessId: validated.businessId,
        role: validated.role,
      },
      include: { user: true },
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: session!.userId,
        businessId: validated.businessId,
        action: "STAFF_INVITED",
        details: JSON.stringify({ invitedUserId: user.id, role: validated.role }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Staff member added successfully",
      membership,
    });
  } catch (error: any) {
    if (error.name === "AuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to add staff" }, { status: 400 });
  }
}

const removeStaffSchema = z.object({
  businessId: z.string(),
  membershipId: z.string(),
});

export async function DELETE(req: NextRequest) {
  try {
    const session = await getRequestSession(req);
    const body = await req.json();
    const { businessId, membershipId } = removeStaffSchema.parse(body);

    // Only active OWNER can remove staff
    await validateLiveBusinessAccess(session, businessId, ["OWNER"]);

    const targetMembership = await prisma.businessMembership.findUnique({
      where: { id: membershipId },
      include: { user: true },
    });

    if (!targetMembership || targetMembership.businessId !== businessId) {
      return NextResponse.json({ error: "Staff membership not found for this business" }, { status: 404 });
    }

    // Owner cannot delete themselves
    if (targetMembership.userId === session!.userId) {
      return NextResponse.json({ error: "You cannot revoke your own owner membership" }, { status: 400 });
    }

    await prisma.businessMembership.delete({
      where: { id: membershipId },
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: session!.userId,
        businessId,
        action: "STAFF_REVOKED",
        details: JSON.stringify({
          revokedMembershipId: membershipId,
          revokedUserId: targetMembership.userId,
          revokedEmail: targetMembership.user.email,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Staff member access revoked successfully",
    });
  } catch (error: any) {
    if (error.name === "AuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to revoke staff" }, { status: 400 });
  }
}

