import { describe, it, expect } from "vitest";
import { PLAN_CATALOG } from "@/server/services/billing";

describe("Loyalty Engine & Domain Calculations", () => {
  it("calculates correct progress percentages across different stamp limits", () => {
    const calculateProgress = (current: number, total: number) =>
      Math.min(100, Math.round((current / total) * 100));

    expect(calculateProgress(0, 5)).toBe(0);
    expect(calculateProgress(1, 5)).toBe(20);
    expect(calculateProgress(3, 5)).toBe(60);
    expect(calculateProgress(5, 5)).toBe(100);
    expect(calculateProgress(6, 5)).toBe(100); // capped at 100

    expect(calculateProgress(4, 8)).toBe(50);
    expect(calculateProgress(7, 10)).toBe(70);
  });

  it("calculates next milestone reward and remaining stamps correctly", () => {
    const rewards = [
      { id: "r1", stampsRequired: 3, title: "15% Off" },
      { id: "r2", stampsRequired: 5, title: "Free Coffee" },
    ];

    const getNextReward = (currentStamps: number) => {
      const next = rewards.find((r) => r.stampsRequired > currentStamps);
      if (!next) return null;
      return {
        id: next.id,
        title: next.title,
        stampsRemaining: next.stampsRequired - currentStamps,
      };
    };

    // When customer has 0 stamps
    expect(getNextReward(0)).toEqual({
      id: "r1",
      title: "15% Off",
      stampsRemaining: 3,
    });

    // When customer has 3 stamps
    expect(getNextReward(3)).toEqual({
      id: "r2",
      title: "Free Coffee",
      stampsRemaining: 2,
    });

    // When customer has completed card (5 stamps)
    expect(getNextReward(5)).toBeNull();
  });

  it("calculates repeat customer retention rate properly", () => {
    const calculateRepeatRate = (totalMembers: number, repeatMembers: number) =>
      totalMembers > 0 ? Math.round((repeatMembers / totalMembers) * 100) : 0;

    expect(calculateRepeatRate(0, 0)).toBe(0);
    expect(calculateRepeatRate(100, 35)).toBe(35);
    expect(calculateRepeatRate(200, 150)).toBe(75);
  });

  it("enforces plan entitlement catalog limits correctly", () => {
    expect(PLAN_CATALOG.STARTER.maxMembers).toBe(200);
    expect(PLAN_CATALOG.STARTER.maxStaff).toBe(1);

    expect(PLAN_CATALOG.GROWTH.maxMembers).toBe(1000);
    expect(PLAN_CATALOG.GROWTH.maxStaff).toBe(3);

    expect(PLAN_CATALOG.PRO.maxMembers).toBeGreaterThan(10000);
  });
});
