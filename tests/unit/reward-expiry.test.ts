import { describe, it, expect } from "vitest";

describe("Reward Expiration & Redemption Eligibility", () => {
  function checkRewardEligibility(params: {
    currentStamps: number;
    stampsRequired: number;
    validityDays: number;
    unlockedAt: Date;
    now?: Date;
  }) {
    const { currentStamps, stampsRequired, validityDays, unlockedAt, now = new Date() } = params;

    if (currentStamps < stampsRequired) {
      return { eligible: false, reason: "Insufficient stamps" };
    }

    const daysSinceEarned = (now.getTime() - unlockedAt.getTime()) / (1000 * 60 * 60 * 24);

    if (validityDays && daysSinceEarned > validityDays) {
      return { eligible: false, reason: "Reward expired" };
    }

    const expiresAt = new Date(unlockedAt.getTime() + validityDays * 24 * 60 * 60 * 1000);

    return { eligible: true, expiresAt };
  }

  it("permits redemption when customer has sufficient stamps within the validity window", () => {
    const result = checkRewardEligibility({
      currentStamps: 5,
      stampsRequired: 5,
      validityDays: 30,
      unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    });

    expect(result.eligible).toBe(true);
    expect(result.expiresAt).toBeInstanceOf(Date);
  });

  it("blocks redemption when customer lacks sufficient stamps", () => {
    const result = checkRewardEligibility({
      currentStamps: 3,
      stampsRequired: 5,
      validityDays: 30,
      unlockedAt: new Date(),
    });

    expect(result.eligible).toBe(false);
    expect(result.reason).toBe("Insufficient stamps");
  });

  it("blocks redemption and flags expiration when validity window has passed", () => {
    const result = checkRewardEligibility({
      currentStamps: 5,
      stampsRequired: 5,
      validityDays: 30,
      unlockedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
    });

    expect(result.eligible).toBe(false);
    expect(result.reason).toBe("Reward expired");
  });
});
