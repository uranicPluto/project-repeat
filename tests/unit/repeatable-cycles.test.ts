import { describe, it, expect } from "vitest";

describe("Repeatable Loyalty Cycles & Lifetime Accounting", () => {
  // Pure domain function mimicking VerificationService cycle rollover
  function processVisitAward(params: {
    currentStamps: number;
    totalStamps: number;
    currentCycle: number;
    lifetimeStamps: number;
  }) {
    const { currentStamps, totalStamps, currentCycle, lifetimeStamps } = params;
    const newLifetimeStamps = lifetimeStamps + 1;

    let newStamps: number;
    let newCycle = currentCycle;
    let rolledOver = false;

    if (currentStamps >= totalStamps) {
      newCycle = currentCycle + 1;
      newStamps = 1;
      rolledOver = true;
    } else {
      newStamps = currentStamps + 1;
    }

    return {
      newStamps,
      newCycle,
      newLifetimeStamps,
      rolledOver,
      hasReachedCardCompletion: newStamps >= totalStamps,
    };
  }

  it("awards stamps sequentially within the initial cycle", () => {
    const visit1 = processVisitAward({
      currentStamps: 0,
      totalStamps: 5,
      currentCycle: 1,
      lifetimeStamps: 0,
    });

    expect(visit1.newStamps).toBe(1);
    expect(visit1.newCycle).toBe(1);
    expect(visit1.newLifetimeStamps).toBe(1);
    expect(visit1.rolledOver).toBe(false);
    expect(visit1.hasReachedCardCompletion).toBe(false);

    const visit4 = processVisitAward({
      currentStamps: 3,
      totalStamps: 5,
      currentCycle: 1,
      lifetimeStamps: 3,
    });

    expect(visit4.newStamps).toBe(4);
    expect(visit4.newCycle).toBe(1);
    expect(visit4.newLifetimeStamps).toBe(4);
    expect(visit4.hasReachedCardCompletion).toBe(false);
  });

  it("completes card when reaching total stamps", () => {
    const visit5 = processVisitAward({
      currentStamps: 4,
      totalStamps: 5,
      currentCycle: 1,
      lifetimeStamps: 4,
    });

    expect(visit5.newStamps).toBe(5);
    expect(visit5.newCycle).toBe(1);
    expect(visit5.newLifetimeStamps).toBe(5);
    expect(visit5.rolledOver).toBe(false);
    expect(visit5.hasReachedCardCompletion).toBe(true);
  });

  it("safely rolls over to Cycle 2 on subsequent visit after card completion", () => {
    const visitAfterCompletion = processVisitAward({
      currentStamps: 5,
      totalStamps: 5,
      currentCycle: 1,
      lifetimeStamps: 5,
    });

    expect(visitAfterCompletion.rolledOver).toBe(true);
    expect(visitAfterCompletion.newCycle).toBe(2);
    expect(visitAfterCompletion.newStamps).toBe(1); // 1st stamp of Cycle 2
    expect(visitAfterCompletion.newLifetimeStamps).toBe(6); // Cumulative 6th stamp
    expect(visitAfterCompletion.hasReachedCardCompletion).toBe(false);
  });

  it("preserves cycle scoping for reward redemptions across multiple cycles", () => {
    interface MockRedemption {
      rewardId: string;
      cycle: number;
      status: string;
    }

    const isRewardRedeemedInCycle = (
      redemptions: MockRedemption[],
      rewardId: string,
      targetCycle: number
    ) => {
      return redemptions.some(
        (r) => r.rewardId === rewardId && r.cycle === targetCycle && r.status === "REDEEMED"
      );
    };

    const redemptionsHistory: MockRedemption[] = [
      { rewardId: "rew-coffee", cycle: 1, status: "REDEEMED" },
    ];

    // In Cycle 1, the coffee reward was redeemed
    expect(isRewardRedeemedInCycle(redemptionsHistory, "rew-coffee", 1)).toBe(true);

    // In Cycle 2, the same customer can earn and redeem the coffee reward again!
    expect(isRewardRedeemedInCycle(redemptionsHistory, "rew-coffee", 2)).toBe(false);
  });
});
