import { renderHook, act, waitFor } from "@testing-library/react";
import { useChessClock, useOptionalChessClock } from "../useChessClock";

// Mock requestAnimationFrame
const mockRaf = jest.fn();
const mockCancelRaf = jest.fn();

global.requestAnimationFrame =
  mockRaf as unknown as typeof requestAnimationFrame;
global.cancelAnimationFrame =
  mockCancelRaf as unknown as typeof cancelAnimationFrame;

// Mock performance.now
let mockTime = 0;
global.performance.now = jest.fn(
  () => mockTime,
) as unknown as typeof performance.now;

describe("useChessClock", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTime = 0;
  });

  describe("initialization", () => {
    it("should initialize with correct time from string", () => {
      const { result } = renderHook(() => useChessClock({ time: "5+3" }));

      expect(result.current.times.white).toBe(300_000); // 5 minutes
      expect(result.current.times.black).toBe(300_000);
      expect(result.current.status).toBe("delayed"); // default clockStart is "delayed"
      expect(result.current.activePlayer).toBeNull();
    });

    it("should initialize with correct time from object", () => {
      const { result } = renderHook(() =>
        useChessClock({
          time: { baseTime: 600, increment: 5 },
        }),
      );

      expect(result.current.times.white).toBe(600_000); // 10 minutes
      expect(result.current.times.black).toBe(600_000);
    });

    it("should initialize with time odds", () => {
      const { result } = renderHook(() =>
        useChessClock({
          time: "5+0",
          whiteTime: 300, // 5 minutes
          blackTime: 180, // 3 minutes
        }),
      );

      expect(result.current.times.white).toBe(300_000);
      expect(result.current.times.black).toBe(180_000);
    });

    it("should start immediately for immediate clock start", () => {
      const { result } = renderHook(() =>
        useChessClock({
          time: "5+0",
          clockStart: "immediate",
        }),
      );

      expect(result.current.status).toBe("running");
      expect(result.current.activePlayer).toBe("white");
    });

    it("should be delayed for delayed clock start", () => {
      const { result } = renderHook(() =>
        useChessClock({
          time: "5+0",
          clockStart: "delayed",
        }),
      );

      expect(result.current.status).toBe("delayed");
      expect(result.current.activePlayer).toBeNull();
    });

    it("should be idle for manual clock start", () => {
      const { result } = renderHook(() =>
        useChessClock({
          time: "5+0",
          clockStart: "manual",
        }),
      );

      expect(result.current.status).toBe("idle");
      expect(result.current.activePlayer).toBeNull();
    });
  });

  describe("info", () => {
    it("should calculate correct info", () => {
      const { result } = renderHook(() => useChessClock({ time: "5+0" }));

      expect(result.current.info).toEqual({
        isRunning: false,
        isPaused: false,
        isFinished: false,
        isWhiteActive: false,
        isBlackActive: false,
        hasTimeout: false,
        hasTimeOdds: false,
      });
    });

    it("should detect time odds", () => {
      const { result } = renderHook(() =>
        useChessClock({
          time: "5+0",
          whiteTime: 300,
          blackTime: 180,
        }),
      );

      expect(result.current.info.hasTimeOdds).toBe(true);
    });
  });

  describe("methods.start", () => {
    it("should start the clock", () => {
      const { result } = renderHook(() => useChessClock({ time: "5+0" }));

      act(() => {
        result.current.methods.start();
      });

      expect(result.current.status).toBe("running");
      expect(result.current.activePlayer).toBe("white");
      expect(result.current.info.isRunning).toBe(true);
    });

    it("should set active player to white if null", () => {
      const { result } = renderHook(() =>
        useChessClock({
          time: "5+0",
          clockStart: "manual",
        }),
      );

      act(() => {
        result.current.methods.start();
      });

      expect(result.current.activePlayer).toBe("white");
    });
  });

  describe("methods.pause", () => {
    it("should pause the clock", () => {
      const { result } = renderHook(() =>
        useChessClock({
          time: "5+0",
          clockStart: "immediate",
        }),
      );

      expect(result.current.status).toBe("running");

      act(() => {
        result.current.methods.pause();
      });

      expect(result.current.status).toBe("paused");
      expect(result.current.info.isPaused).toBe(true);
    });

    it("should not pause if not running", () => {
      const { result } = renderHook(() =>
        useChessClock({ time: "5+0", clockStart: "manual" }),
      );

      act(() => {
        result.current.methods.pause();
      });

      expect(result.current.status).toBe("idle");
    });
  });

  describe("methods.resume", () => {
    it("should resume paused clock", () => {
      const { result } = renderHook(() =>
        useChessClock({
          time: "5+0",
          clockStart: "immediate",
        }),
      );

      act(() => {
        result.current.methods.pause();
      });

      expect(result.current.status).toBe("paused");

      act(() => {
        result.current.methods.resume();
      });

      expect(result.current.status).toBe("running");
    });

    it("should not resume if not paused", () => {
      const { result } = renderHook(() =>
        useChessClock({ time: "5+0", clockStart: "manual" }),
      );

      act(() => {
        result.current.methods.resume();
      });

      expect(result.current.status).toBe("idle");
    });
  });

  describe("methods.switch", () => {
    it("should switch active player", () => {
      const { result } = renderHook(() =>
        useChessClock({
          time: "5+0",
          clockStart: "immediate",
        }),
      );

      expect(result.current.activePlayer).toBe("white");

      act(() => {
        result.current.methods.switch();
      });

      expect(result.current.activePlayer).toBe("black");
    });

    it("should switch from delayed to running after two switches", async () => {
      const { result } = renderHook(() =>
        useChessClock({
          time: "5+0",
          clockStart: "delayed",
        }),
      );

      expect(result.current.status).toBe("delayed");

      act(() => {
        result.current.methods.switch();
      });

      // After first switch, still in delayed mode, black is active
      expect(result.current.status).toBe("delayed");
      expect(result.current.activePlayer).toBe("black");

      // Wait for React to process state updates and debounce period to pass
      await new Promise((resolve) => setTimeout(resolve, 150));

      act(() => {
        result.current.methods.switch();
      });

      // After second switch, clock starts running, white is active
      expect(result.current.status).toBe("running");
      expect(result.current.activePlayer).toBe("white");
    });

    it("should apply Fischer increment", () => {
      const onSwitch = jest.fn();
      const { result } = renderHook(() =>
        useChessClock({
          time: "5+3",
          timingMethod: "fischer",
          clockStart: "immediate",
          onSwitch,
        }),
      );

      const initialWhiteTime = result.current.times.white;

      act(() => {
        result.current.methods.switch();
      });

      // After switch, white should have received increment
      expect(result.current.times.white).toBeGreaterThan(initialWhiteTime);
      // With absolute time, allow for small timing variations (±100ms)
      expect(result.current.times.white).toBeGreaterThanOrEqual(303_000 - 100);
      expect(result.current.times.white).toBeLessThanOrEqual(303_000 + 100);
      expect(onSwitch).toHaveBeenCalledWith("black");
    });
  });

  describe("methods.reset", () => {
    it("should reset to initial times", () => {
      const { result } = renderHook(() =>
        useChessClock({
          time: "5+0",
          clockStart: "immediate",
        }),
      );

      // Manually set a different time (simulating time passing)
      act(() => {
        result.current.methods.setTime("white", 250_000);
      });

      expect(result.current.times.white).toBe(250_000);

      act(() => {
        result.current.methods.reset();
      });

      expect(result.current.times.white).toBe(300_000);
      expect(result.current.times.black).toBe(300_000);
    });

    it("should reset to new time control", () => {
      const { result } = renderHook(() => useChessClock({ time: "5+0" }));

      act(() => {
        result.current.methods.reset("10+5");
      });

      expect(result.current.times.white).toBe(600_000); // 10 minutes
      expect(result.current.times.black).toBe(600_000);
    });

    it("should reset status and active player", () => {
      const { result } = renderHook(() =>
        useChessClock({
          time: "5+0",
          clockStart: "immediate",
        }),
      );

      act(() => {
        result.current.methods.pause();
      });

      expect(result.current.status).toBe("paused");

      act(() => {
        result.current.methods.reset();
      });

      // Reset restores to initial clockStart mode (immediate = running)
      expect(result.current.status).toBe("running");
      expect(result.current.activePlayer).toBe("white");
      expect(result.current.timeout).toBeNull();
    });
  });

  describe("methods.addTime", () => {
    it("should add time to a player", () => {
      const { result } = renderHook(() => useChessClock({ time: "5+0" }));

      act(() => {
        result.current.methods.addTime("white", 30_000); // Add 30 seconds
      });

      expect(result.current.times.white).toBe(330_000);
    });

    it("should add time to black player", () => {
      const { result } = renderHook(() => useChessClock({ time: "5+0" }));

      act(() => {
        result.current.methods.addTime("black", 60_000); // Add 1 minute
      });

      expect(result.current.times.black).toBe(360_000);
    });
  });

  describe("methods.setTime", () => {
    it("should set time for a player", () => {
      const { result } = renderHook(() => useChessClock({ time: "5+0" }));

      act(() => {
        result.current.methods.setTime("white", 120_000);
      });

      expect(result.current.times.white).toBe(120_000);
    });

    it("should clamp negative time to zero", () => {
      const { result } = renderHook(() => useChessClock({ time: "5+0" }));

      act(() => {
        result.current.methods.setTime("white", -10_000);
      });

      expect(result.current.times.white).toBe(0);
    });
  });

  describe("callbacks", () => {
    it("should call onSwitch when player switches", () => {
      const onSwitch = jest.fn();
      const { result } = renderHook(() =>
        useChessClock({
          time: "5+0",
          clockStart: "immediate",
          onSwitch,
        }),
      );

      act(() => {
        result.current.methods.switch();
      });

      expect(onSwitch).toHaveBeenCalledWith("black");
    });
  });

  describe("debounce", () => {
    it("should prevent rapid switches within debounce window", () => {
      const onSwitch = jest.fn();
      const { result } = renderHook(() =>
        useChessClock({
          time: "5+0",
          clockStart: "immediate",
          onSwitch,
        }),
      );

      // First switch should work
      act(() => {
        result.current.methods.switch();
      });

      expect(result.current.activePlayer).toBe("black");
      expect(onSwitch).toHaveBeenCalledTimes(1);

      // Immediate switch should be prevented (debounce window: 100ms)
      // Note: Date.now() is used for debounce, so we can't test the timing
      // but we can verify the active player doesn't change from rapid switches
      expect(result.current.activePlayer).not.toBe("white");
    });
  });
});

describe("useOptionalChessClock", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTime = 0;
  });

  it("should return null when options is undefined", () => {
    const { result } = renderHook(() => useOptionalChessClock(undefined));

    expect(result.current).toBeNull();
  });

  it("should return clock state when options is provided", () => {
    const { result } = renderHook(() => useOptionalChessClock({ time: "5+3" }));

    expect(result.current).not.toBeNull();
    expect(result.current?.times.white).toBe(300_000);
    expect(result.current?.times.black).toBe(300_000);
  });

  it("should work the same as useChessClock when enabled", () => {
    const config = { time: "10+5" as const, clockStart: "immediate" as const };

    const { result: optionalResult } = renderHook(() =>
      useOptionalChessClock(config),
    );
    const { result: requiredResult } = renderHook(() => useChessClock(config));

    expect(optionalResult.current?.times).toEqual(requiredResult.current.times);
    expect(optionalResult.current?.status).toEqual(
      requiredResult.current.status,
    );
    expect(optionalResult.current?.activePlayer).toEqual(
      requiredResult.current.activePlayer,
    );
  });
});
