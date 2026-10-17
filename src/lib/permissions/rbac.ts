import { SessionPayload } from "@/lib/auth/session";

export type SystemRole = "PLATFORM_ADMIN" | "BUSINESS_USER" | "CUSTOMER";
export type BusinessRole = "OWNER" | "MANAGER" | "STAFF";

export class AuthorizationError extends Error {
  statusCode: number;
  constructor(message = "Unauthorized", statusCode = 401) {
    super(message);
    this.name = "AuthorizationError";
    this.statusCode = statusCode;
  }
}

export function requireAuth(session: SessionPayload | null): SessionPayload {
  if (!session) {
    throw new AuthorizationError("Authentication required", 401);
  }
  return session;
}

export function requirePlatformAdmin(session: SessionPayload | null): SessionPayload {
  const user = requireAuth(session);
  if (user.role !== "PLATFORM_ADMIN") {
    throw new AuthorizationError("Platform administrator privileges required", 403);
  }
  return user;
}

export function requireBusinessAccess(
  session: SessionPayload | null,
  businessId: string,
  allowedRoles: BusinessRole[] = ["OWNER", "MANAGER", "STAFF"]
): { user: SessionPayload; businessRole: BusinessRole } {
  const user = requireAuth(session);

  // Platform admin can access with audit override
  if (user.role === "PLATFORM_ADMIN") {
    return { user, businessRole: "OWNER" };
  }

  const membership = user.businessMemberships?.find((m) => m.businessId === businessId);
  if (!membership) {
    throw new AuthorizationError("Access denied: You are not a member of this business", 403);
  }

  if (!allowedRoles.includes(membership.role)) {
    throw new AuthorizationError(`Access denied: Requires one of [${allowedRoles.join(", ")}] role`, 403);
  }

  return { user, businessRole: membership.role };
}

export function requireCustomer(session: SessionPayload | null): SessionPayload {
  const user = requireAuth(session);
  // Customers or business users viewing as customers
  return user;
}
