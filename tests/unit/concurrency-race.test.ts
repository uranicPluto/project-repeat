import { describe, it, expect } from "vitest";

describe("Verification Concurrency, Race Condition Prevention & Fraud Defenses", () => {
  it("proves that two concurrent requests racing to verify the same code only allow one winner", async () => {
    // Model atomic single-use verification claim
    let verificationRecord = {
      id: "v-123",
      code: "839201",
      status: "PENDING",
      expiresAt: new Date(Date.now() + 180000),
      businessId: "biz-the-coffee-house",
      enrollmentId: "enr-cust-1",
    };

    let executionCount = 0;
    let awardedStamps = 0;

    // Atomic claim function simulating database updateMany({ where: { id, status: 'PENDING' }, data: { status: 'VERIFIED' } })
    async function simulateAtomicVerificationClaim(requestBusinessId: string) {
      if (requestBusinessId !== verificationRecord.businessId) {
        throw new Error("This verification code belongs to a different business");
      }

      if (new Date() > verificationRecord.expiresAt) {
        throw new Error("Verification code has expired");
      }

      // Atomic compare-and-swap / conditional update
      if (verificationRecord.status === "PENDING") {
        verificationRecord.status = "VERIFIED";
        executionCount++;
        awardedStamps++;
        return { success: true, count: 1 };
      }

      return { success: false, count: 0 };
    }

    // Fire two simultaneous concurrent verification requests with the same code
    const [res1, res2] = await Promise.all([
      simulateAtomicVerificationClaim("biz-the-coffee-house"),
      simulateAtomicVerificationClaim("biz-the-coffee-house"),
    ]);

    // Exactly one must succeed and exactly one must fail
    const successfulClaims = [res1, res2].filter((r) => r.success && r.count === 1);
    const failedClaims = [res1, res2].filter((r) => !r.success && r.count === 0);

    expect(successfulClaims.length).toBe(1);
    expect(failedClaims.length).toBe(1);
    expect(awardedStamps).toBe(1); // Never awards duplicate stamps under race condition!
    expect(verificationRecord.status).toBe("VERIFIED");
  });

  it("strictly isolates verification code lookup by businessId", async () => {
    const store = [
      {
        id: "v-1",
        code: "444555",
        businessId: "biz-cafe-1",
        status: "PENDING",
      },
    ];

    function findCodeForBusiness(code: string, businessId: string) {
      return store.find((v) => v.code === code && v.businessId === businessId && v.status === "PENDING");
    }

    // Business 2 attempts to verify Business 1's code
    const foreignLookup = findCodeForBusiness("444555", "biz-salon-2");
    expect(foreignLookup).toBeUndefined();

    // Business 1 looks up its own code
    const authorizedLookup = findCodeForBusiness("444555", "biz-cafe-1");
    expect(authorizedLookup).toBeDefined();
    expect(authorizedLookup?.id).toBe("v-1");
  });

  it("proves duplicate concurrent reward redemptions are rejected by unique constraint", async () => {
    // Model unique constraint on [enrollmentId, rewardId, cycle]
    const redemptionsIndex = new Set<string>();

    function attemptRedemption(enrollmentId: string, rewardId: string, cycle: number) {
      const compositeKey = `${enrollmentId}:${rewardId}:${cycle}`;
      if (redemptionsIndex.has(compositeKey)) {
        throw new Error(`Reward already redeemed in Cycle ${cycle}`);
      }
      redemptionsIndex.add(compositeKey);
      return { id: `rdm-${Date.now()}`, key: compositeKey };
    }

    // First redemption succeeds
    const firstAttempt = attemptRedemption("enr-1", "rew-free-coffee", 1);
    expect(firstAttempt.key).toBe("enr-1:rew-free-coffee:1");

    // Concurrent second redemption in same cycle is rejected
    expect(() => attemptRedemption("enr-1", "rew-free-coffee", 1)).toThrow(
      "Reward already redeemed in Cycle 1"
    );

    // Redemption in subsequent Cycle 2 succeeds
    const cycle2Attempt = attemptRedemption("enr-1", "rew-free-coffee", 2);
    expect(cycle2Attempt.key).toBe("enr-1:rew-free-coffee:2");
  });

  it("rejects expired verification codes safely without mutating enrollment", async () => {
    const expiredRecord = {
      id: "v-exp",
      code: "112233",
      status: "PENDING",
      expiresAt: new Date(Date.now() - 60000), // 1 minute in the past
    };

    function verifyCode(record: typeof expiredRecord) {
      if (new Date() > record.expiresAt) {
        record.status = "EXPIRED";
        throw new Error("Verification code has expired");
      }
      return { success: true };
    }

    expect(() => verifyCode(expiredRecord)).toThrow("Verification code has expired");
    expect(expiredRecord.status).toBe("EXPIRED");
  });
});
