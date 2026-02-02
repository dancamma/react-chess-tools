import {
  applyFischerIncrement,
  applySimpleDelay,
  applyBronsteinDelay,
  calculateSwitchAdjustment,
  calculateTickDecrement,
  getInitialActivePlayer,
  getInitialStatus,
} from "../timingMethods";

describe("applyFischerIncrement", () => {
  it("should add increment to current time", () => {
    expect(applyFischerIncrement(300_000, 3_000)).toBe(303_000);
    expect(applyFischerIncrement(60_000, 1_000)).toBe(61_000);
    expect(applyFischerIncrement(120_000, 2_000)).toBe(122_000);
  });

  it("should handle zero increment", () => {
    expect(applyFischerIncrement(300_000, 0)).toBe(300_000);
  });

  it("should handle low time values", () => {
    expect(applyFischerIncrement(100, 3_000)).toBe(3_100);
    expect(applyFischerIncrement(0, 3_000)).toBe(3_000);
  });
});

describe("applySimpleDelay", () => {
  it("should return 0 when time spent is within delay period", () => {
    const delay = 5_000; // 5 seconds
    expect(applySimpleDelay(1_000, delay)).toBe(0);
    expect(applySimpleDelay(3_000, delay)).toBe(0);
    expect(applySimpleDelay(5_000, delay)).toBe(0);
  });

  it("should return time spent minus delay when over delay period", () => {
    const delay = 5_000; // 5 seconds
    expect(applySimpleDelay(6_000, delay)).toBe(1_000);
    expect(applySimpleDelay(10_000, delay)).toBe(5_000);
    expect(applySimpleDelay(15_500, delay)).toBe(10_500);
  });

  it("should handle zero delay", () => {
    expect(applySimpleDelay(5_000, 0)).toBe(5_000);
    expect(applySimpleDelay(0, 0)).toBe(0);
  });
});

describe("applyBronsteinDelay", () => {
  it("should add back full time spent when within delay", () => {
    const delay = 5_000; // 5 seconds
    const currentTime = 300_000;

    // Spent 3 seconds, add back 3 seconds
    expect(applyBronsteinDelay(currentTime, 3_000, delay)).toBe(303_000);

    // Spent exactly delay, add back delay
    expect(applyBronsteinDelay(currentTime, 5_000, delay)).toBe(305_000);
  });

  it("should add back only delay amount when over delay", () => {
    const delay = 5_000; // 5 seconds
    const currentTime = 300_000;

    // Spent 10 seconds, add back only 5 (delay amount)
    expect(applyBronsteinDelay(currentTime, 10_000, delay)).toBe(305_000);

    // Spent 15 seconds, add back only 5
    expect(applyBronsteinDelay(currentTime, 15_000, delay)).toBe(305_000);
  });

  it("should handle zero delay", () => {
    expect(applyBronsteinDelay(300_000, 5_000, 0)).toBe(300_000);
  });

  it("should handle low time spent", () => {
    expect(applyBronsteinDelay(300_000, 500, 5_000)).toBe(300_500);
    expect(applyBronsteinDelay(300_000, 0, 5_000)).toBe(300_000);
  });
});

describe("calculateSwitchAdjustment", () => {
  const baseConfig = {
    baseTime: 300_000,
    increment: 3_000,
    delay: 5_000,
    timingMethod: "fischer" as const,
    clockStart: "delayed" as const,
  };

  describe("Fischer timing method", () => {
    it("should add increment after switch", () => {
      const result = calculateSwitchAdjustment("fischer", 295_000, 5_000, {
        ...baseConfig,
        timingMethod: "fischer",
      });
      expect(result).toBe(298_000); // 295000 + 3000
    });

    it("should handle zero increment", () => {
      const config = { ...baseConfig, increment: 0 };
      const result = calculateSwitchAdjustment(
        "fischer",
        295_000,
        5_000,
        config,
      );
      expect(result).toBe(295_000); // No increment
    });
  });

  describe("Delay timing method", () => {
    it("should not adjust time (handled in tick)", () => {
      const result = calculateSwitchAdjustment("delay", 295_000, 5_000, {
        ...baseConfig,
        timingMethod: "delay",
      });
      expect(result).toBe(295_000); // No change on switch
    });
  });

  describe("Bronstein timing method", () => {
    it("should add back time spent up to delay", () => {
      // Spent 3 seconds, delay is 5 seconds
      const result = calculateSwitchAdjustment("bronstein", 297_000, 3_000, {
        ...baseConfig,
        timingMethod: "bronstein",
        delay: 5_000,
      });
      expect(result).toBe(300_000); // 297000 + 3000
    });

    it("should add back full delay when over delay", () => {
      // Spent 10 seconds, delay is 5 seconds
      const result = calculateSwitchAdjustment("bronstein", 290_000, 10_000, {
        ...baseConfig,
        timingMethod: "bronstein",
        delay: 5_000,
      });
      expect(result).toBe(295_000); // 290000 + 5000
    });
  });
});

describe("calculateTickDecrement", () => {
  const baseConfig = {
    baseTime: 300_000,
    increment: 3_000,
    delay: 5_000,
    timingMethod: "fischer" as const,
    clockStart: "delayed" as const,
  };

  describe("Fischer timing method", () => {
    it("should decrement full elapsed time", () => {
      const result = calculateTickDecrement(
        "fischer",
        1_000, // elapsed
        3_000, // timeSpentInMove
        0, // delayRemaining
        baseConfig,
      );
      expect(result.decrement).toBe(1_000);
    });
  });

  describe("Delay timing method", () => {
    it("should not decrement within delay period", () => {
      const result = calculateTickDecrement(
        "delay",
        1_000, // elapsed
        3_000, // timeSpentInMove (within 5 second delay)
        2_000, // delayRemaining
        { ...baseConfig, timingMethod: "delay", delay: 5_000 },
      );
      expect(result.decrement).toBe(0);
      expect(result.newDelayRemaining).toBe(2_000);
    });

    it("should decrement after delay period", () => {
      const result = calculateTickDecrement(
        "delay",
        1_000, // elapsed
        6_000, // timeSpentInMove (over 5 second delay)
        0, // delayRemaining
        { ...baseConfig, timingMethod: "delay", delay: 5_000 },
      );
      expect(result.decrement).toBe(1_000);
      expect(result.newDelayRemaining).toBe(0);
    });
  });

  describe("Bronstein timing method", () => {
    it("should decrement full elapsed time", () => {
      const result = calculateTickDecrement(
        "bronstein",
        1_000,
        3_000,
        0,
        baseConfig,
      );
      expect(result.decrement).toBe(1_000);
    });
  });
});

describe("getInitialActivePlayer", () => {
  it("should return white for immediate start", () => {
    expect(getInitialActivePlayer("immediate")).toBe("white");
  });

  it("should return null for delayed start", () => {
    expect(getInitialActivePlayer("delayed")).toBeNull();
  });

  it("should return null for manual start", () => {
    expect(getInitialActivePlayer("manual")).toBeNull();
  });
});

describe("getInitialStatus", () => {
  it("should return running for immediate start", () => {
    expect(getInitialStatus("immediate")).toBe("running");
  });

  it("should return delayed for delayed start", () => {
    expect(getInitialStatus("delayed")).toBe("delayed");
  });

  it("should return idle for manual start", () => {
    expect(getInitialStatus("manual")).toBe("idle");
  });
});
