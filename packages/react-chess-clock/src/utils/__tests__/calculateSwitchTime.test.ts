import { calculateSwitchTime } from "../calculateSwitchTime";

describe("calculateSwitchTime", () => {
  const baseConfig = {
    baseTime: 300_000,
    increment: 3_000,
    delay: 5_000,
    timingMethod: "fischer" as const,
    clockStart: "delayed" as const,
  };

  describe("Fischer timing method", () => {
    it("should decrement time spent and add increment", () => {
      const result = calculateSwitchTime(
        300_000, // currentTime
        5_000, // timeSpent
        { ...baseConfig, timingMethod: "fischer", increment: 3_000 },
      );
      expect(result).toBe(298_000); // 300000 - 5000 + 3000
    });

    it("should handle time spent less than increment", () => {
      const result = calculateSwitchTime(300_000, 2_000, {
        ...baseConfig,
        timingMethod: "fischer",
        increment: 5_000,
      });
      expect(result).toBe(303_000); // 300000 - 2000 + 5000
    });

    it("should handle zero increment", () => {
      const result = calculateSwitchTime(300_000, 5_000, {
        ...baseConfig,
        timingMethod: "fischer",
        increment: 0,
      });
      expect(result).toBe(295_000); // 300000 - 5000
    });

    it("should not go below zero before increment", () => {
      const result = calculateSwitchTime(1_000, 5_000, {
        ...baseConfig,
        timingMethod: "fischer",
        increment: 3_000,
      });
      expect(result).toBe(3_000); // max(0, 1000 - 5000) + 3000
    });

    it("should handle increment on very low time", () => {
      const result = calculateSwitchTime(100, 5_000, {
        ...baseConfig,
        timingMethod: "fischer",
        increment: 3_000,
      });
      expect(result).toBe(3_000); // max(0, 100 - 5000) + 3000 = 0 + 3000
    });
  });

  describe("Delay timing method", () => {
    it("should not decrement when within delay period", () => {
      const result = calculateSwitchTime(
        300_000,
        3_000, // within 5 second delay
        { ...baseConfig, timingMethod: "delay", delay: 5_000 },
      );
      expect(result).toBe(300_000); // No decrement (3s - 5s delay = 0 effective)
    });

    it("should decrement only time spent after delay", () => {
      const result = calculateSwitchTime(
        300_000,
        10_000, // 10 seconds spent, 5 second delay
        { ...baseConfig, timingMethod: "delay", delay: 5_000 },
      );
      expect(result).toBe(295_000); // 300000 - (10000 - 5000) = 295000
    });

    it("should handle exactly at delay boundary", () => {
      const result = calculateSwitchTime(
        300_000,
        5_000, // exactly delay amount
        { ...baseConfig, timingMethod: "delay", delay: 5_000 },
      );
      expect(result).toBe(300_000); // max(0, 5000 - 5000) = 0 effective
    });

    it("should handle zero delay", () => {
      const result = calculateSwitchTime(300_000, 5_000, {
        ...baseConfig,
        timingMethod: "delay",
        delay: 0,
      });
      expect(result).toBe(295_000); // 300000 - 5000
    });
  });

  describe("Bronstein timing method", () => {
    it("should decrement and add back time spent within delay", () => {
      const result = calculateSwitchTime(
        300_000,
        3_000, // 3 seconds spent, 5 second delay
        { ...baseConfig, timingMethod: "bronstein", delay: 5_000 },
      );
      expect(result).toBe(300_000); // 300000 - 3000 + 3000 = 300000
    });

    it("should add back only delay amount when over delay", () => {
      const result = calculateSwitchTime(
        300_000,
        10_000, // 10 seconds spent, 5 second delay
        { ...baseConfig, timingMethod: "bronstein", delay: 5_000 },
      );
      expect(result).toBe(295_000); // 300000 - 10000 + 5000 = 295000
    });

    it("should handle zero delay", () => {
      const result = calculateSwitchTime(300_000, 5_000, {
        ...baseConfig,
        timingMethod: "bronstein",
        delay: 0,
      });
      expect(result).toBe(295_000); // 300000 - 5000 + 0 = 295000
    });
  });

  describe("Edge cases", () => {
    it("should handle zero time spent", () => {
      const result = calculateSwitchTime(300_000, 0, baseConfig);
      expect(result).toBe(303_000); // 300000 - 0 + 3000 (increment)
    });

    it("should handle very low current time", () => {
      const result = calculateSwitchTime(500, 3_000, {
        ...baseConfig,
        timingMethod: "fischer",
        increment: 2_000,
      });
      expect(result).toBe(2_000); // max(0, 500 - 3000) + 2000 = 0 + 2000
    });

    it("should handle zero current time", () => {
      const result = calculateSwitchTime(0, 3_000, {
        ...baseConfig,
        timingMethod: "fischer",
        increment: 2_000,
      });
      expect(result).toBe(2_000); // max(0, 0 - 3000) + 2000 = 0 + 2000
    });
  });
});
