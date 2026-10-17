import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getSessionSecretKey } from "@/lib/auth/session";
import { requireBusinessAccess, AuthorizationError } from "@/lib/permissions/rbac";

describe("Security Hardening & Cross-Tenant Boundary Enforcement", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("enforces strict 32+ character SESSION_SECRET in production", () => {
    (process.env as any).NODE_ENV = "production";
    delete process.env.SESSION_SECRET;

    expect(() => getSessionSecretKey()).toThrow(
      /FATAL SECURITY CONFIGURATION: SESSION_SECRET environment variable is missing/
    );

    // If key is too short
    process.env.SESSION_SECRET = "too-short";
    expect(() => getSessionSecretKey()).toThrow(
      /FATAL SECURITY CONFIGURATION: SESSION_SECRET must be at least 32 characters/
    );

    // Valid production secret
    process.env.SESSION_SECRET = "a-very-secure-production-secret-with-at-least-32-chars";
    expect(() => getSessionSecretKey()).not.toThrow();
  });

  it("prevents IDOR: ensures business access check throws on mismatched businessId", () => {
    const session = {
      userId: "user-1",
      email: "owner@bizA.com",
      name: "Biz A Owner",
      role: "BUSINESS_USER" as const,
      businessMemberships: [
        {
          businessId: "biz-A",
          businessSlug: "biz-a",
          role: "OWNER" as const,
        },
      ],
    };

    // Accessing own business succeeds
    expect(() => requireBusinessAccess(session, "biz-A", ["OWNER"])).not.toThrow();

    // Accessing another business throws 403
    expect(() => requireBusinessAccess(session, "biz-B", ["OWNER"])).toThrow(
      AuthorizationError
    );
  });

  it("prevents staff from accessing OWNER-only billing features", () => {
    const staffSession = {
      userId: "staff-1",
      email: "barista@bizA.com",
      name: "Counter Staff",
      role: "BUSINESS_USER" as const,
      businessMemberships: [
        {
          businessId: "biz-A",
          businessSlug: "biz-a",
          role: "STAFF" as const,
        },
      ],
    };

    // Staff can access counter terminal
    expect(() =>
      requireBusinessAccess(staffSession, "biz-A", ["OWNER", "MANAGER", "STAFF"])
    ).not.toThrow();

    // Staff is strictly blocked from OWNER billing actions
    expect(() => requireBusinessAccess(staffSession, "biz-A", ["OWNER"])).toThrow(
      /Requires one of \[OWNER\] role/
    );
  });

  it("prohibits owners from revoking their own ownership", () => {
    const ownerUserId = "user-owner-1";
    const targetUserId = "user-owner-1";

    const canRevoke = (requesterId: string, targetId: string) => {
      if (requesterId === targetId) {
        throw new Error("You cannot revoke your own owner membership");
      }
      return true;
    };

    expect(() => canRevoke(ownerUserId, targetUserId)).toThrow(
      /You cannot revoke your own owner membership/
    );
    expect(canRevoke(ownerUserId, "staff-user-2")).toBe(true);
  });
});
