import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getRequestSession, hashPassword } from "@/lib/auth/session";
import { requireBusinessAccess } from "@/lib/permissions/rbac";
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

    // Only OWNER can add staff
    requireBusinessAccess(session, validated.businessId, ["OWNER"]);

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
