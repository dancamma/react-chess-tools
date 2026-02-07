import { formatClockTime } from "../formatTime";

describe("formatClockTime", () => {
  describe("auto format", () => {
    it("should show mm:ss for times >= 20 seconds", () => {
      expect(formatClockTime(20_000, "auto")).toBe("0:20");
      expect(formatClockTime(60_000, "auto")).toBe("1:00");
      expect(formatClockTime(300_000, "auto")).toBe("5:00");
      expect(formatClockTime(600_000, "auto")).toBe("10:00");
    });

    it("should show ss.d (seconds with decimal) for times < 20 seconds", () => {
      expect(formatClockTime(19_999, "auto")).toBe("20.0");
      expect(formatClockTime(10_500, "auto")).toBe("10.5");
      expect(formatClockTime(5_000, "auto")).toBe("5.0");
      expect(formatClockTime(500, "auto")).toBe("0.5");
      expect(formatClockTime(100, "auto")).toBe("0.1");
    });
  });

  describe("mm:ss format", () => {
    it("should format time as minutes:seconds", () => {
      expect(formatClockTime(0, "mm:ss")).toBe("0:00");
      expect(formatClockTime(5_000, "mm:ss")).toBe("0:05");
      expect(formatClockTime(60_000, "mm:ss")).toBe("1:00");
      expect(formatClockTime(65_000, "mm:ss")).toBe("1:05");
      expect(formatClockTime(300_000, "mm:ss")).toBe("5:00");
      expect(formatClockTime(365_000, "mm:ss")).toBe("6:05");
    });

    it("should show hours when time exceeds 60 minutes", () => {
      expect(formatClockTime(3_600_000, "mm:ss")).toBe("1:00:00");
      expect(formatClockTime(3_665_000, "mm:ss")).toBe("1:01:05");
      expect(formatClockTime(5_400_000, "mm:ss")).toBe("1:30:00");
      expect(formatClockTime(7_200_000, "mm:ss")).toBe("2:00:00");
    });
  });

  describe("ss.d format", () => {
    it("should format time as seconds with decimal", () => {
      expect(formatClockTime(0, "ss.d")).toBe("0.0");
      expect(formatClockTime(500, "ss.d")).toBe("0.5");
      expect(formatClockTime(5_000, "ss.d")).toBe("5.0");
      expect(formatClockTime(10_500, "ss.d")).toBe("10.5");
      expect(formatClockTime(60_000, "ss.d")).toBe("60.0");
      expect(formatClockTime(125_500, "ss.d")).toBe("125.5");
    });
  });

  describe("hh:mm:ss format", () => {
    it("should format time as hours:minutes:seconds", () => {
      expect(formatClockTime(0, "hh:mm:ss")).toBe("0:00:00");
      expect(formatClockTime(5_000, "hh:mm:ss")).toBe("0:00:05");
      expect(formatClockTime(65_000, "hh:mm:ss")).toBe("0:01:05");
      expect(formatClockTime(3_600_000, "hh:mm:ss")).toBe("1:00:00");
      expect(formatClockTime(3_665_000, "hh:mm:ss")).toBe("1:01:05");
      expect(formatClockTime(5_400_000, "hh:mm:ss")).toBe("1:30:00");
    });
  });

  describe("edge cases", () => {
    it("should clamp negative times to zero", () => {
      expect(formatClockTime(-1000, "auto")).toBe("0.0");
      expect(formatClockTime(-1000, "mm:ss")).toBe("0:00");
    });

    it("should handle zero time", () => {
      expect(formatClockTime(0, "auto")).toBe("0.0");
      expect(formatClockTime(0, "mm:ss")).toBe("0:00");
      expect(formatClockTime(0, "ss.d")).toBe("0.0");
      expect(formatClockTime(0, "hh:mm:ss")).toBe("0:00:00");
    });

    it("should ceil to nearest second for mm:ss and hh:mm:ss", () => {
      // 5999ms should round up to 6 seconds
      expect(formatClockTime(5_999, "mm:ss")).toBe("0:06");
      expect(formatClockTime(5_999, "hh:mm:ss")).toBe("0:00:06");

      // 5001ms should round up
      expect(formatClockTime(5_001, "mm:ss")).toBe("0:06");
    });
  });
});
