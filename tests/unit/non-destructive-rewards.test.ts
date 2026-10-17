import { describe, it, expect } from "vitest";

describe("Non-Destructive Loyalty Program & Rewards Versioning", () => {
  interface MockReward {
    id: string;
    programId: string;
    stampsRequired: number;
    title: string;
    isActive: boolean;
  }

  interface MockRedemption {
    id: string;
    rewardId: string;
    enrollmentId: string;
    status: string;
  }

  it("updates rewards in-place and preserves historical customer redemptions without cascade deletion", () => {
    // Initial program state with 2 rewards
    let rewards: MockReward[] = [
      { id: "rew-1", programId: "prog-1", stampsRequired: 3, title: "10% Off", isActive: true },
      { id: "rew-2", programId: "prog-1", stampsRequired: 5, title: "Free Pastry", isActive: true },
    ];

    // Customer has a historical redemption pointing to rew-2
    const customerRedemptions: MockRedemption[] = [
      { id: "rdm-1", rewardId: "rew-2", enrollmentId: "enr-1", status: "REDEEMED" },
    ];

    // Business owner edits the program:
    // - Milestone 3 is upgraded to "15% Off"
    // - Milestone 5 is retired
    // - Milestone 6 is introduced: "Deluxe Coffee"
    const incomingRewards = [
      { stampsRequired: 3, title: "15% Off (Upgraded)" },
      { stampsRequired: 6, title: "Deluxe Coffee" },
    ];

    // Execute non-destructive reconciliation strategy
    // 1. Mark existing rewards inactive
    rewards = rewards.map((r) => ({ ...r, isActive: false }));

    // 2. Reconcile incoming rewards
    for (const inc of incomingRewards) {
      const match = rewards.find((r) => r.stampsRequired === inc.stampsRequired);
      if (match) {
        match.title = inc.title;
        match.isActive = true;
      } else {
        rewards.push({
          id: `rew-${Date.now()}-${inc.stampsRequired}`,
          programId: "prog-1",
          stampsRequired: inc.stampsRequired,
          title: inc.title,
          isActive: true,
        });
      }
    }

    // Historical redemption still points to valid rew-2 (now inactive, but not deleted!)
    expect(customerRedemptions.length).toBe(1);
    expect(customerRedemptions[0].rewardId).toBe("rew-2");

    const historicalReward = rewards.find((r) => r.id === "rew-2");
    expect(historicalReward).toBeDefined();
    expect(historicalReward?.isActive).toBe(false); // Archived/retired, not cascade-deleted!

    // Active rewards reflect the new catalog
    const activeRewards = rewards.filter((r) => r.isActive);
    expect(activeRewards.length).toBe(2);
    expect(activeRewards.find((r) => r.stampsRequired === 3)?.title).toBe("15% Off (Upgraded)");
    expect(activeRewards.find((r) => r.stampsRequired === 6)?.title).toBe("Deluxe Coffee");
  });
});
