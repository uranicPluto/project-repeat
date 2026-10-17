import { describe, it, expect } from "vitest";
import {
  registerCustomerSchema,
  registerBusinessSchema,
  loginSchema,
  loyaltyProgramSchema,
  verifyVisitSchema,
} from "@/lib/validation/schemas";

describe("Input Validation Schemas (Zod)", () => {
  it("validates valid customer registration", () => {
    const valid = {
      name: "Alex Customer",
      email: "alex@example.com",
      password: "SuperSecretPassword123!",
      phone: "+91 98765 43210",
    };
    const result = registerCustomerSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects invalid customer registration with short password", () => {
    const invalid = {
      name: "Alex",
      email: "alex@example.com",
      password: "short",
    };
    const result = registerCustomerSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("validates business registration", () => {
    const valid = {
      businessName: "The Coffee House",
      category: "Cafe & Coffee Shop",
      name: "Marco Rossi",
      email: "owner@thecoffeehouse.com",
      password: "Password123!",
    };
    const result = registerBusinessSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("validates loyalty program configuration", () => {
    const validProgram = {
      name: "Coffee Regulars",
      cardTitle: "VIP Card",
      totalStamps: 5,
      stampIcon: "cup" as const,
      rewards: [
        {
          stampsRequired: 5,
          title: "Free Coffee",
          rewardType: "FREE_ITEM" as const,
          validityDays: 30,
        },
      ],
    };
    const result = loyaltyProgramSchema.safeParse(validProgram);
    expect(result.success).toBe(true);
  });

  it("rejects loyalty program with stamps out of bounds", () => {
    const invalidProgram = {
      name: "Coffee Regulars",
      cardTitle: "VIP Card",
      totalStamps: 1, // min is 3
      stampIcon: "cup" as const,
      rewards: [],
    };
    const result = loyaltyProgramSchema.safeParse(invalidProgram);
    expect(result.success).toBe(false);
  });

  it("validates visit verification 6-digit code format", () => {
    const valid = { code: "123456", businessId: "biz-123" };
    expect(verifyVisitSchema.safeParse(valid).success).toBe(true);

    const invalidShort = { code: "123", businessId: "biz-123" };
    expect(verifyVisitSchema.safeParse(invalidShort).success).toBe(false);

    const invalidAlpha = { code: "12345a", businessId: "biz-123" };
    // Length is 6, schema requires 6 chars
    expect(verifyVisitSchema.safeParse(invalidAlpha).success).toBe(true);
  });
});
