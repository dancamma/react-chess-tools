import {
  parseTimeControlString,
  normalizeTimeControl,
  parseTimeControlConfig,
  getInitialTimes,
  parseMultiPeriodTimeControl,
} from "../timeControl";

describe("parseTimeControlString", () => {
  it("should parse simple time control (no increment)", () => {
    const result = parseTimeControlString("10");
    expect(result).toEqual({
      baseTime: 600, // 10 minutes in seconds
      increment: 0,
    });
  });

  it("should parse time control with increment", () => {
    const result = parseTimeControlString("5+3");
    expect(result).toEqual({
      baseTime: 300,
      increment: 3,
    });
  });

  it("should parse various time controls", () => {
    expect(parseTimeControlString("1+0")).toEqual({
      baseTime: 60,
      increment: 0,
    });
    expect(parseTimeControlString("1+1")).toEqual({
      baseTime: 60,
      increment: 1,
    });
    expect(parseTimeControlString("3+2")).toEqual({
      baseTime: 180,
      increment: 2,
    });
    expect(parseTimeControlString("10+5")).toEqual({
      baseTime: 600,
      increment: 5,
    });
  });

  it("should throw error for invalid format", () => {
    // @ts-expect-error - parseTimeControlString throws for invalid input
    expect(() => parseTimeControlString("invalid")).toThrow(
      "Invalid time control",
    );
    // @ts-expect-error - parseTimeControlString throws for invalid input
    expect(() => parseTimeControlString("5-3")).toThrow("Invalid time control");
    // @ts-expect-error - parseTimeControlString throws for invalid input
    expect(() => parseTimeControlString("")).toThrow("Invalid time control");
  });
});

describe("normalizeTimeControl", () => {
  it("should normalize string time control to milliseconds", () => {
    const result = normalizeTimeControl("5+3", "fischer", "delayed");
    expect(result).toEqual({
      baseTime: 300_000, // 5 minutes in ms
      increment: 3_000, // 3 seconds in ms
      delay: 0,
      timingMethod: "fischer",
      clockStart: "delayed",
    });
  });

  it("should normalize object time control to milliseconds", () => {
    const result = normalizeTimeControl(
      {
        baseTime: 300, // 5 minutes
        increment: 3,
      },
      "fischer",
      "delayed",
    );
    expect(result).toEqual({
      baseTime: 300_000,
      increment: 3_000,
      delay: 0,
      timingMethod: "fischer",
      clockStart: "delayed",
    });
  });

  it("should include delay if specified", () => {
    const result = normalizeTimeControl(
      {
        baseTime: 300,
        increment: 0,
        delay: 5, // 5 second delay
      },
      "fischer",
      "delayed",
    );
    expect(result.delay).toBe(5_000); // 5 seconds in ms
  });
});

describe("parseTimeControlConfig", () => {
  it("should parse config with string time control", () => {
    const result = parseTimeControlConfig({
      time: "5+3",
    });
    expect(result.baseTime).toBe(300_000);
    expect(result.increment).toBe(3_000);
    expect(result.timingMethod).toBe("fischer");
    expect(result.clockStart).toBe("delayed");
  });

  it("should parse config with timing method", () => {
    const result = parseTimeControlConfig({
      time: "5+0",
      timingMethod: "delay",
    });
    expect(result.timingMethod).toBe("delay");
  });

  it("should parse config with clock start mode", () => {
    const result = parseTimeControlConfig({
      time: "5+0",
      clockStart: "immediate",
    });
    expect(result.clockStart).toBe("immediate");
  });

  it("should parse config with time odds", () => {
    const result = parseTimeControlConfig({
      time: "5+0",
      whiteTime: 300, // 5 minutes
      blackTime: 240, // 4 minutes
    });
    expect(result.whiteTimeOverride).toBe(300_000);
    expect(result.blackTimeOverride).toBe(240_000);
  });

  it("should parse config with all options", () => {
    const result = parseTimeControlConfig({
      time: "10+5",
      timingMethod: "bronstein",
      clockStart: "manual",
      whiteTime: 600,
      blackTime: 600,
    });
    expect(result.baseTime).toBe(600_000);
    expect(result.increment).toBe(5_000);
    expect(result.timingMethod).toBe("bronstein");
    expect(result.clockStart).toBe("manual");
    expect(result.whiteTimeOverride).toBe(600_000);
    expect(result.blackTimeOverride).toBe(600_000);
  });
});

describe("getInitialTimes", () => {
  it("should return base time for both players without overrides", () => {
    const config = normalizeTimeControl("5+3", "fischer", "delayed");
    const result = getInitialTimes(config);
    expect(result).toEqual({
      white: 300_000,
      black: 300_000,
    });
  });

  it("should apply time odds when overrides are present", () => {
    const config = parseTimeControlConfig({
      time: "5+0",
      whiteTime: 300, // 5 minutes
      blackTime: 180, // 3 minutes
    });
    const result = getInitialTimes(config);
    expect(result).toEqual({
      white: 300_000,
      black: 180_000,
    });
  });

  it("should apply only white override", () => {
    const config = parseTimeControlConfig({
      time: "5+0",
      whiteTime: 300,
    });
    const result = getInitialTimes(config);
    expect(result).toEqual({
      white: 300_000,
      black: 300_000, // Falls back to base time
    });
  });

  it("should apply only black override", () => {
    const config = parseTimeControlConfig({
      time: "5+0",
      blackTime: 180,
    });
    const result = getInitialTimes(config);
    expect(result).toEqual({
      white: 300_000, // Falls back to base time
      black: 180_000,
    });
  });
});

describe("parseMultiPeriodTimeControl", () => {
  describe("valid formats", () => {
    it("should parse simple two-period time control", () => {
      const result = parseMultiPeriodTimeControl("40/90+30,sd/30+30");
      expect(result).toEqual([
        { baseTime: 5400, increment: 30, moves: 40 },
        { baseTime: 1800, increment: 30 },
      ]);
    });

    it("should parse three-period time control", () => {
      const result = parseMultiPeriodTimeControl("40/90+30,20/60+30,g/15+30");
      expect(result).toEqual([
        { baseTime: 5400, increment: 30, moves: 40 },
        { baseTime: 3600, increment: 30, moves: 20 },
        { baseTime: 900, increment: 30 },
      ]);
    });

    it("should parse with SD prefix (uppercase)", () => {
      const result = parseMultiPeriodTimeControl("40/90,SD/30");
      expect(result).toMatchObject([
        { baseTime: 5400, moves: 40 },
        { baseTime: 1800 },
      ]);
    });

    it("should parse with sd prefix (lowercase)", () => {
      const result = parseMultiPeriodTimeControl("40/90,sd/30");
      expect(result).toMatchObject([
        { baseTime: 5400, moves: 40 },
        { baseTime: 1800 },
      ]);
    });

    it("should parse with G prefix", () => {
      const result = parseMultiPeriodTimeControl("40/90,G/30");
      expect(result).toMatchObject([
        { baseTime: 5400, moves: 40 },
        { baseTime: 1800 },
      ]);
    });

    it("should parse with g prefix (lowercase)", () => {
      const result = parseMultiPeriodTimeControl("40/90,g/30");
      expect(result).toMatchObject([
        { baseTime: 5400, moves: 40 },
        { baseTime: 1800 },
      ]);
    });

    it("should handle whitespace around commas", () => {
      const result = parseMultiPeriodTimeControl("40/90+30 , sd/30+30");
      expect(result).toEqual([
        { baseTime: 5400, increment: 30, moves: 40 },
        { baseTime: 1800, increment: 30 },
      ]);
    });

    it("should parse period without increment", () => {
      const result = parseMultiPeriodTimeControl("40/90,sd/30");
      expect(result).toMatchObject([
        { baseTime: 5400, moves: 40 },
        { baseTime: 1800 },
      ]);
    });

    it("should parse period with decimal minutes", () => {
      const result = parseMultiPeriodTimeControl("40/90.5,sd/30");
      expect(result).toMatchObject([
        { baseTime: 5430, moves: 40 },
        { baseTime: 1800 },
      ]);
    });

    it("should parse decimal increment", () => {
      const result = parseMultiPeriodTimeControl("40/90+2.5,sd/30");
      expect(result).toMatchObject([
        { baseTime: 5400, increment: 3, moves: 40 }, // Note: 2.5 gets rounded to 3
        { baseTime: 1800 },
      ]);
    });

    it("should parse simple sudden death format without moves prefix", () => {
      const result = parseMultiPeriodTimeControl("sd/30+10");
      expect(result).toEqual([{ baseTime: 1800, increment: 10 }]);
    });

    it("should parse G/ format without moves prefix", () => {
      const result = parseMultiPeriodTimeControl("G/30+10");
      expect(result).toEqual([{ baseTime: 1800, increment: 10 }]);
    });
  });

  describe("edge cases", () => {
    it("should handle single period (sudden death only)", () => {
      const result = parseMultiPeriodTimeControl("sd/30+10");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ baseTime: 1800, increment: 10 });
    });

    it("should handle single period with moves", () => {
      const result = parseMultiPeriodTimeControl("40/90+30");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ baseTime: 5400, increment: 30, moves: 40 });
    });

    it("should handle very large move counts", () => {
      const result = parseMultiPeriodTimeControl("100/120,sd/30");
      expect(result).toEqual([
        { baseTime: 7200, moves: 100 },
        { baseTime: 1800 },
      ]);
    });

    it("should handle small move counts", () => {
      const result = parseMultiPeriodTimeControl("5/10+3,sd/5");
      expect(result).toEqual([
        { baseTime: 600, increment: 3, moves: 5 },
        { baseTime: 300 },
      ]);
    });

    it("should handle multiple consecutive sudden death markers", () => {
      const result = parseMultiPeriodTimeControl("sd/30+10,sd/15+5");
      expect(result).toEqual([
        { baseTime: 1800, increment: 10 },
        { baseTime: 900, increment: 5 },
      ]);
    });
  });

  describe("error handling", () => {
    it("should throw on empty string", () => {
      expect(() => parseMultiPeriodTimeControl("")).toThrow();
    });

    it("should throw on invalid period format", () => {
      expect(() => parseMultiPeriodTimeControl("invalid,sd/30")).toThrow(
        "Invalid period format",
      );
    });

    it("should throw on period with negative time", () => {
      expect(() => parseMultiPeriodTimeControl("40/-10,sd/30")).toThrow();
    });

    it("should throw on empty period between commas", () => {
      expect(() => parseMultiPeriodTimeControl("40/90,,sd/30")).toThrow();
    });
  });
});

describe("normalizeTimeControl with multi-period", () => {
  it("should normalize multi-period array to milliseconds", () => {
    const input = [
      { baseTime: 5400, increment: 30, moves: 40 },
      { baseTime: 1800, increment: 30 },
    ];

    const result = normalizeTimeControl(input, "fischer", "delayed");

    expect(result).toEqual({
      baseTime: 5_400_000, // First period base time in ms
      increment: 30_000, // First period increment in ms
      delay: 0,
      timingMethod: "fischer",
      clockStart: "delayed",
      periods: [
        { baseTime: 5_400_000, increment: 30_000, moves: 40 },
        { baseTime: 1_800_000, increment: 30_000 },
      ],
    });
  });

  it("should preserve periods in normalized output with ms values", () => {
    const input = [
      { baseTime: 5400, increment: 30, moves: 40 },
      { baseTime: 3600, increment: 30, moves: 20 },
      { baseTime: 900, increment: 30 },
    ];

    const result = normalizeTimeControl(input, "fischer", "delayed");

    expect(result.periods).toEqual([
      { baseTime: 5_400_000, increment: 30_000, moves: 40 },
      { baseTime: 3_600_000, increment: 30_000, moves: 20 },
      { baseTime: 900_000, increment: 30_000 },
    ]);
  });

  it("should throw on empty array", () => {
    expect(() => normalizeTimeControl([], "fischer", "delayed")).toThrow(
      "Multi-period time control must have at least one period",
    );
  });

  it("should handle single period array", () => {
    const input = [{ baseTime: 300, increment: 3 }];

    const result = normalizeTimeControl(input, "fischer", "delayed");

    expect(result).toEqual({
      baseTime: 300_000,
      increment: 3_000,
      delay: 0,
      timingMethod: "fischer",
      clockStart: "delayed",
      periods: [{ baseTime: 300_000, increment: 3_000 }],
    });
  });
});
