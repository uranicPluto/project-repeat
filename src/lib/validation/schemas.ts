import { z } from "zod";

// Authentication Schemas
export const registerCustomerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
});

export const registerBusinessSchema = z.object({
  name: z.string().min(2, "Owner name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  category: z.string().min(2, "Please select a category"),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Business Profile Update Schema
export const updateBusinessProfileSchema = z.object({
  name: z.string().min(2, "Business name is required"),
  category: z.string().min(2, "Category is required"),
  description: z.string().optional(),
  address: z.string().optional(),
  primaryColor: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid hex color"),
  secondaryColor: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid hex color"),
  timeZone: z.string().default("Asia/Kolkata"),
  currency: z.string().default("INR"),
});

// Loyalty Program & Card Builder Schema
export const rewardSchema = z.object({
  stampsRequired: z.number().int().min(1),
  title: z.string().min(2, "Reward title is required"),
  description: z.string().optional(),
  rewardType: z.enum(["FREE_ITEM", "DISCOUNT_PERCENT", "DISCOUNT_FIXED"]),
  discountValue: z.number().optional(),
  validityDays: z.number().int().min(1).default(30),
});

export const loyaltyProgramSchema = z.object({
  name: z.string().min(2, "Program name is required"),
  cardTitle: z.string().min(2, "Card title is required"),
  totalStamps: z.number().int().min(3).max(20),
  stampIcon: z.enum(["cup", "star", "tag", "gift", "heart"]),
  terms: z.string().optional(),
  rewards: z.array(rewardSchema).min(1, "At least one reward milestone is required"),
});

// Visit Verification Schemas
export const createVerificationTokenSchema = z.object({
  enrollmentId: z.string().min(1, "Enrollment ID is required"),
});

export const verifyVisitSchema = z
  .object({
    code: z.string().length(6, "Verification code must be exactly 6 digits"),
    businessId: z.string().optional(),
    businessSlug: z.string().optional(),
    referenceCode: z.string().optional(),
  })
  .refine((data) => Boolean(data.businessId || data.businessSlug), {
    message: "Either businessId or businessSlug is required",
  });

// Reward Redemption Schema
export const redeemRewardSchema = z.object({
  enrollmentId: z.string().min(1, "Enrollment ID is required"),
  rewardId: z.string().min(1, "Reward ID is required"),
  businessId: z.string().min(1, "Business ID is required"),
});
