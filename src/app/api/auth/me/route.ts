import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const session = await getRequestSession(req);
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { status: true },
  });

  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json(
      { authenticated: false, user: null, error: "Account inactive or suspended" },
      { status: 403 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: session,
  });
}
