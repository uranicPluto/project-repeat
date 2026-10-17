import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export function getSessionSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "FATAL SECURITY CONFIGURATION: SESSION_SECRET environment variable is missing in production. Please set a secure 32+ character key."
      );
    }
    return new TextEncoder().encode("dev-project-repeat-super-secure-session-secret-key-32-chars-min");
  }
  if (secret.length < 32 && process.env.NODE_ENV === "production") {
    throw new Error(
      "FATAL SECURITY CONFIGURATION: SESSION_SECRET must be at least 32 characters long in production."
    );
  }
  return new TextEncoder().encode(secret);
}

export const SESSION_COOKIE_NAME = "project_repeat_session";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: "PLATFORM_ADMIN" | "BUSINESS_USER" | "CUSTOMER";
  businessMemberships?: {
    businessId: string;
    businessSlug: string;
    role: "OWNER" | "MANAGER" | "STAFF";
  }[];
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Session JWT creation and verification
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSessionSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecretKey(), {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// Server Component / Route Handler session helper
export async function getServerSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

// API Route / NextRequest helper
export async function getRequestSession(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      return verifySessionToken(authHeader.substring(7));
    }
    return null;
  }
  return verifySessionToken(token);
}
