import { describe, it, expect } from "vitest";
import { validateLiveBusinessAccess, AuthorizationError } from "@/lib/permissions/rbac";
import { SessionPayload } from "@/lib/auth/session";

describe("Live Database Authorization & Revocation Defenses", () => {
  const activeStaffSession: SessionPayload = {
    userId: "usr-staff-1",
    email: "staff@thecoffeehouse.com",
    name: "Staff Member",
    role: "BUSINESS_USER",
    businessMemberships: [
      {
        businessId: "biz-1",
        businessSlug: "the-coffee-house",
        role: "STAFF",
      },
    ],
  };

  it("permits active staff member with valid live database membership", async () => {
    // Mock db client returning active user with active membership
    const mockDb = {
      user: {
        findUnique: async () => ({
          status: "ACTIVE",
          memberships: [{ role: "STAFF" }],
        }),
      },
    };

    const result = await validateLiveBusinessAccess(
      activeStaffSession,
      "biz-1",
      ["STAFF", "OWNER"],
      mockDb
    );
    expect(result.businessRole).toBe("STAFF");
  });

  it("strictly rejects staff whose membership was revoked, even with valid unexpired JWT", async () => {
    // Mock db client showing user is active, but membership in biz-1 was revoked (empty array)
    const mockDbRevoked = {
      user: {
        findUnique: async () => ({
          status: "ACTIVE",
          memberships: [], // Membership deleted/revoked!
        }),
      },
    };

    await expect(
      validateLiveBusinessAccess(activeStaffSession, "biz-1", ["STAFF", "OWNER"], mockDbRevoked)
    ).rejects.toThrow("Access revoked: You are no longer a member of this business");
  });

  it("strictly rejects suspended accounts even if JWT has not expired", async () => {
    const mockDbSuspended = {
      user: {
        findUnique: async () => ({
          status: "SUSPENDED", // Account banned or suspended
          memberships: [{ role: "STAFF" }],
        }),
      },
    };

    await expect(
      validateLiveBusinessAccess(activeStaffSession, "biz-1", ["STAFF", "OWNER"], mockDbSuspended)
    ).rejects.toThrow("Account is inactive or suspended");
  });

  it("denies access when staff attempts to access another tenant's business", async () => {
    const mockDb = {
      user: {
        findUnique: async () => ({
          status: "ACTIVE",
          memberships: [{ role: "STAFF" }],
        }),
      },
    };

    // Staff belongs to biz-1, but tries to access biz-2
    await expect(
      validateLiveBusinessAccess(activeStaffSession, "biz-2", ["STAFF", "OWNER"], mockDb)
    ).rejects.toThrow("Access denied: You are not a member of this business");
  });
});
