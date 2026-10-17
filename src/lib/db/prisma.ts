import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

function getDatasourceUrl(): string | undefined {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && !envUrl.startsWith("file:")) {
    return envUrl;
  }

  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[PERSISTENCE WARNING] Project Repeat is running in production without a managed PostgreSQL DATABASE_URL. Real-world tenant persistence requires a PostgreSQL instance (e.g., Neon, Supabase, AWS RDS)."
    );
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

  return envUrl || `file:${path.join(process.cwd(), "prisma", "dev.db")}`;
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

