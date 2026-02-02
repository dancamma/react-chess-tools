import {
  parseTimeControlString,
  normalizeTimeControl,
  parseTimeControlConfig,
  getInitialTimes,
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
      baseTime: 300, // 5 minutes in seconds
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
    expect(() => parseTimeControlString("invalid")).toThrow(
      "Invalid time control",
    );
    expect(() => parseTimeControlString("5-3")).toThrow("Invalid time control");
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
