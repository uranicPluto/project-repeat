import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

function getDatasourceUrl(): string | undefined {
  const envUrl = process.env.DATABASE_URL;

  // In production mode, strictly enforce managed PostgreSQL
  if (process.env.NODE_ENV === "production") {
    if (!envUrl || envUrl.startsWith("file:")) {
      if (process.env.ALLOW_SQLITE_IN_PRODUCTION !== "true") {
        throw new Error(
          "FATAL DATABASE CONFIGURATION: Production mode requires a valid PostgreSQL DATABASE_URL. " +
          "Silent fallback to SQLite is blocked to prevent data loss on serverless restarts. " +
          "To override for isolated preview evaluation only, explicitly set ALLOW_SQLITE_IN_PRODUCTION=true."
        );
      }
      console.warn(
        "[PERSISTENCE WARNING] Project Repeat is running in production with SQLite because ALLOW_SQLITE_IN_PRODUCTION=true."
      );
    } else {
      return envUrl;
    }
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

