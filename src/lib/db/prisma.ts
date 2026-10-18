import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const SUPABASE_URL_DEFAULT =
  "postgresql://postgres:%40126Ve960repeat@db.mxjsppfyorwqqoiorqia.supabase.co:5432/postgres";

export function getDatasourceUrl(): string {
  const envUrl = process.env.DATABASE_URL;

  // If explicit PostgreSQL DATABASE_URL is provided
  if (envUrl && (envUrl.startsWith("postgresql://") || envUrl.startsWith("postgres://"))) {
    // If running on Vercel serverless runtime or in production and DATABASE_URL points to localhost, fall back to Supabase
    if (
      (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") &&
      (envUrl.includes("localhost") || envUrl.includes("127.0.0.1"))
    ) {
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

