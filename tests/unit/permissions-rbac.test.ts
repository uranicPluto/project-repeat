import { describe, it, expect } from "vitest";
import {
  requireAuth,
  requirePlatformAdmin,
  requireBusinessAccess,
  AuthorizationError,
} from "@/lib/permissions/rbac";
import { SessionPayload } from "@/lib/auth/session";

describe("Role-Based Access Control & Tenant Isolation", () => {
  const customerSession: SessionPayload = {
    userId: "usr-cust-1",
    email: "customer@example.com",
    name: "Customer User",
    role: "CUSTOMER",
  };

  const businessStaffSession: SessionPayload = {
    userId: "usr-staff-1",
    email: "barista@coffeehouse.com",
    name: "Barista Sam",
    role: "BUSINESS_USER",
    businessMemberships: [
      {
        businessId: "biz-coffee-house",
        businessSlug: "the-coffee-house",
        role: "STAFF",
      },
    ],
  };

  const businessOwnerSession: SessionPayload = {
    userId: "usr-owner-1",
    email: "owner@coffeehouse.com",
    name: "Marco Rossi",
    role: "BUSINESS_USER",
    businessMemberships: [
      {
        businessId: "biz-coffee-house",
        businessSlug: "the-coffee-house",
        role: "OWNER",
      },
    ],
  };

  const platformAdminSession: SessionPayload = {
    userId: "usr-admin-1",
    email: "admin@projectrepeat.com",
    name: "Super Admin",
    role: "PLATFORM_ADMIN",
  };

  it("requireAuth throws 401 when session is null", () => {
    expect(() => requireAuth(null)).toThrow(AuthorizationError);
    try {
      requireAuth(null);
    } catch (e: any) {
      expect(e.statusCode).toBe(401);
    }
  });

  it("requirePlatformAdmin only permits PLATFORM_ADMIN", () => {
    expect(requirePlatformAdmin(platformAdminSession)).toEqual(platformAdminSession);
    expect(() => requirePlatformAdmin(customerSession)).toThrow(AuthorizationError);
    expect(() => requirePlatformAdmin(businessOwnerSession)).toThrow(AuthorizationError);
  });

  it("permits staff access to their own business", () => {
    const result = requireBusinessAccess(businessStaffSession, "biz-coffee-house", [
      "OWNER",
      "MANAGER",
      "STAFF",
    ]);
    expect(result.businessRole).toBe("STAFF");
  });

  it("denies staff access to owner-only operations", () => {
    expect(() =>
      requireBusinessAccess(businessStaffSession, "biz-coffee-house", ["OWNER"])
    ).toThrow(AuthorizationError);
  });

  it("strictly enforces tenant isolation across different businesses", () => {
    // Attempt cross-tenant breach: Coffee House staff tries to access Urban Cuts (biz-urban-cuts)
    expect(() =>
      requireBusinessAccess(businessStaffSession, "biz-urban-cuts", ["OWNER", "MANAGER", "STAFF"])
    ).toThrow(AuthorizationError);

    try {
      requireBusinessAccess(businessStaffSession, "biz-urban-cuts");
    } catch (e: any) {
      expect(e.statusCode).toBe(403);
      expect(e.message).toContain("Access denied: You are not a member of this business");
    }
  });

  it("permits platform admin override with least privilege audit handling", () => {
    const result = requireBusinessAccess(platformAdminSession, "biz-coffee-house");
    expect(result.businessRole).toBe("OWNER");
  });
});
