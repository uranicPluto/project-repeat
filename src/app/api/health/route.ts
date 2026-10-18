import { NextResponse } from "next/server";
import { prisma, getDatasourceUrl } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  try {
    // Run lightweight probe to verify database connectivity
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - startTime;

    const dbUrl = getDatasourceUrl();
    const isPostgres = dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://");
    const isSqlite = dbUrl.startsWith("file:") || (!dbUrl && process.env.NODE_ENV !== "production");

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: {
          connected: true,
          provider: isPostgres ? "postgresql" : isSqlite ? "sqlite" : "unknown",
          latencyMs,
        },
        environment: process.env.NODE_ENV || "development",
        version: "0.1.0",
      },
      { status: 200 }
    );
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          latencyMs,
          error: "Database connectivity probe failed",
        },
        environment: process.env.NODE_ENV || "development",
      },
      { status: 503 }
    );
  }
}
