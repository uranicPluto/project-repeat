import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const SUPABASE_URL_DEFAULT =
  "postgresql://postgres.mxjsppfyorwqqoiorqia:%40126Ve960repeat@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true";

export function getDatasourceUrl(): string {
  const envUrl = process.env.DATABASE_URL;

  // If explicit PostgreSQL DATABASE_URL is provided
  if (envUrl && (envUrl.startsWith("postgresql://") || envUrl.startsWith("postgres://"))) {
    // If running on Vercel serverless runtime or in production and DATABASE_URL points to localhost, fall back to Supabase pooler
    if (
      (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") &&
      (envUrl.includes("localhost") || envUrl.includes("127.0.0.1"))
    ) {
      return SUPABASE_URL_DEFAULT;
    }
    // If running on Vercel and URL is direct Supabase db host (which lacks IPv4 routing in AWS Lambda VPC), route via pooler
    if (process.env.VERCEL === "1" && envUrl.includes("db.mxjsppfyorwqqoiorqia.supabase.co")) {
      return SUPABASE_URL_DEFAULT;
    }
    return envUrl;
  }

  // In production (Vercel or hosted container), use Supabase cloud database
  if (process.env.NODE_ENV === "production" || process.env.VERCEL === "1") {
    if (envUrl && envUrl.startsWith("file:") && process.env.ALLOW_SQLITE_IN_PRODUCTION === "true") {
      return envUrl;
    }
    return SUPABASE_URL_DEFAULT;
  }

  // Local development SQLite resolution
  const candidates = [
    path.join(process.cwd(), "prisma", "dev.db"),
    path.resolve("./prisma/dev.db"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return `file:${candidate}`;
    }
  }

  if (envUrl && envUrl.startsWith("file:")) {
    return envUrl;
  }

  return `file:${path.join(process.cwd(), "prisma", "dev.db")}`;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatasourceUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

