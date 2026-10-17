import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const session = await getRequestSession(req);
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  return NextResponse.json({
    authenticated: true,
    user: session,
  });
}
