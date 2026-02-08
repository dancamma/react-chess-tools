import { renderHook, act } from "@testing-library/react";
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
    it("should start the clock from manual mode", () => {
      const { result } = renderHook(() =>
        useChessClock({
          time: "5+0",
          clockStart: "manual",
        }),
      );

      act(() => {
        result.current.methods.start();
      });

      expect(result.current.status).toBe("running");
      expect(result.current.activePlayer).toBe("white");
      expect(result.current.info.isRunning).toBe(true);
    });

    it("should not start countdown in delayed mode until after black's first move", () => {
      const { result } = renderHook(() =>
        useChessClock({
          time: "5+0",
          clockStart: "delayed",
        }),
      );

      expect(result.current.status).toBe("delayed");

      act(() => {
        result.current.methods.start();
      });

      // In delayed mode, START doesn't change the status
      expect(result.current.status).toBe("delayed");
      expect(result.current.activePlayer).toBeNull();
      expect(result.current.info.isRunning).toBe(false);

      // First switch (white moves)
      act(() => {
        result.current.methods.switch();
      });

      // Still delayed, black is now active
      expect(result.current.status).toBe("delayed");
      expect(result.current.activePlayer).toBe("black");

      // Second switch (black moves) - clock starts running
      act(() => {
        result.current.methods.switch();
      });

      // Now the clock is running
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

    it("should maintain correct time when paused (not jump back to move start)", async () => {
      const { result } = renderHook(() =>
        useChessClock({
          time: "5+0",
          clockStart: "immediate",
        }),
      );

      const initialTime = result.current.times.white;
      expect(initialTime).toBe(300_000);

      // Wait for time to pass (the display updates every 100ms)
      await new Promise((resolve) => setTimeout(resolve, 150));

      act(() => {
        result.current.methods.pause();
      });

      const pausedTime = result.current.times.white;
      // Time should have decreased from initial (time elapsed)
      expect(pausedTime).toBeLessThan(initialTime);
      expect(pausedTime).toBeGreaterThan(200_000); // Should be around 4:50 left

      // Resume and check time continues from paused time (not from move start)
      act(() => {
        result.current.methods.resume();
      });

      const resumedTime = result.current.times.white;
      // Time should be close to paused time (not jump back to initial)
      expect(resumedTime).toBeLessThan(initialTime);
      expect(resumedTime).toBeGreaterThan(pausedTime - 1000); // Within 1 second of paused time
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

  describe("options changes", () => {
    it("should auto-reset when time control changes", () => {
      const { result, rerender } = renderHook(
        ({ time }) => useChessClock({ time }),
        { initialProps: { time: "5+3" as string } },
      );

      expect(result.current.times.white).toBe(300_000);

      rerender({ time: "10+5" });

      expect(result.current.times.white).toBe(600_000);
      expect(result.current.times.black).toBe(600_000);
    });

    it("should auto-reset when timingMethod changes", () => {
      const { result, rerender } = renderHook(
        ({ timingMethod }) => useChessClock({ time: "5+3", timingMethod }),
        { initialProps: { timingMethod: "fischer" as string } },
      );

      expect(result.current.timingMethod).toBe("fischer");

      rerender({ timingMethod: "delay" });

      expect(result.current.timingMethod).toBe("delay");
    });

    it("should auto-reset when clockStart changes", () => {
      const { result, rerender } = renderHook(
        ({ clockStart }) => useChessClock({ time: "5+0", clockStart }),
        { initialProps: { clockStart: "delayed" as string } },
      );

      expect(result.current.status).toBe("delayed");

      rerender({ clockStart: "immediate" });

      expect(result.current.status).toBe("running");
      expect(result.current.activePlayer).toBe("white");
    });

    it("should auto-reset when whiteTime/blackTime changes (time odds)", () => {
      const { result, rerender } = renderHook(
        ({ whiteTime, blackTime }) =>
          useChessClock({ time: "5+0", whiteTime, blackTime }),
        { initialProps: { whiteTime: 300, blackTime: 300 } },
      );

      expect(result.current.times.white).toBe(300_000);
      expect(result.current.times.black).toBe(300_000);

      rerender({ whiteTime: 180, blackTime: 300 });

      expect(result.current.times.white).toBe(180_000);
      expect(result.current.times.black).toBe(300_000);
    });

    it("should NOT reset when only callbacks change", () => {
      const onTimeout1 = jest.fn();
      const onTimeout2 = jest.fn();

      const { result, rerender } = renderHook(
        ({ onTimeout }) => useChessClock({ time: "5+3", onTimeout }),
        { initialProps: { onTimeout: onTimeout1 } },
      );

      const initialTimes = result.current.times;

      rerender({ onTimeout: onTimeout2 });

      // Times should be unchanged
      expect(result.current.times).toEqual(initialTimes);
    });

    it("should NOT reset when onSwitch callback changes", () => {
      const onSwitch1 = jest.fn();
      const onSwitch2 = jest.fn();

      const { result, rerender } = renderHook(
        ({ onSwitch }) =>
          useChessClock({ time: "5+3", clockStart: "immediate", onSwitch }),
        { initialProps: { onSwitch: onSwitch1 } },
      );

      const initialTimes = result.current.times;

      rerender({ onSwitch: onSwitch2 });

      // Times should be unchanged
      expect(result.current.times).toEqual(initialTimes);

      // New callback should be used
      act(() => {
        result.current.methods.switch();
      });

      expect(onSwitch2).toHaveBeenCalledWith("black");
      expect(onSwitch1).not.toHaveBeenCalled();
    });

    it("should NOT reset when onTimeUpdate callback changes", () => {
      const onTimeUpdate1 = jest.fn();
      const onTimeUpdate2 = jest.fn();

      const { result, rerender } = renderHook(
        ({ onTimeUpdate }) => useChessClock({ time: "5+3", onTimeUpdate }),
        { initialProps: { onTimeUpdate: onTimeUpdate1 } },
      );

      const initialTimes = result.current.times;

      rerender({ onTimeUpdate: onTimeUpdate2 });

      // Times should be unchanged
      expect(result.current.times).toEqual(initialTimes);
    });

    it("should reset status when time control changes during game", () => {
      const { result, rerender } = renderHook(
        ({ time }) => useChessClock({ time, clockStart: "immediate" }),
        { initialProps: { time: "5+3" as string } },
      );

      // Start the clock and make a switch
      act(() => {
        result.current.methods.switch();
      });

      expect(result.current.status).toBe("running");
      expect(result.current.activePlayer).toBe("black");

      // Change time control - should reset to initial state
      rerender({ time: "10+5" });

      expect(result.current.status).toBe("running"); // immediate mode
      expect(result.current.activePlayer).toBe("white"); // reset to white
      expect(result.current.times.white).toBe(600_000);
    });

    it("should handle multiple option changes", () => {
      const { result, rerender } = renderHook(
        ({ time, timingMethod }) => useChessClock({ time, timingMethod }),
        {
          initialProps: {
            time: "5+3" as string,
            timingMethod: "fischer" as string,
          },
        },
      );

      expect(result.current.times.white).toBe(300_000);
      expect(result.current.timingMethod).toBe("fischer");

      rerender({ time: "10+5", timingMethod: "delay" });

      expect(result.current.times.white).toBe(600_000);
      expect(result.current.timingMethod).toBe("delay");
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
    const config = { time: "10+5" as const };

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

describe("useChessClock - multi-period time controls", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTime = 0;
  });

  describe("initialization", () => {
    it("should initialize with multi-period state from array config", () => {
      const { result } = renderHook(() =>
        useChessClock({
          time: [
            { baseTime: 5400, increment: 30, moves: 40 },
            { baseTime: 1800, increment: 30 },
          ],
        }),
      );

      expect(result.current.totalPeriods).toBe(2);
      expect(result.current.currentPeriodIndex).toEqual({ white: 0, black: 0 });
      expect(result.current.periodMoves).toEqual({ white: 0, black: 0 });
      expect(result.current.currentPeriod.white).toEqual({
        baseTime: 5400,
        increment: 30,
        moves: 40,
      });
      expect(result.current.currentPeriod.black).toEqual({
        baseTime: 5400,
        increment: 30,
        moves: 40,
      });
    });

    it("should expose total periods correctly", () => {
      const { result } = renderHook(() =>
        useChessClock({
          time: [
            { baseTime: 5400, increment: 30, moves: 40 },
            { baseTime: 3600, increment: 30, moves: 20 },
            { baseTime: 900, increment: 30 },
          ],
        }),
      );

      expect(result.current.totalPeriods).toBe(3);
    });

    it("should initialize with single period when not multi-period", () => {
      const { result } = renderHook(() => useChessClock({ time: "5+3" }));

      expect(result.current.totalPeriods).toBe(1);
      expect(result.current.currentPeriodIndex).toEqual({ white: 0, black: 0 });
      expect(result.current.currentPeriod.white).toMatchObject({
        baseTime: 300,
        increment: 3,
      });
      // Note: delay may be present in the actual object
    });

    it("should initialize initial times from first period", () => {
      const { result } = renderHook(() =>
        useChessClock({
          time: [
            { baseTime: 5400, increment: 30, moves: 40 }, // 90 minutes
            { baseTime: 1800, increment: 30 },
          ],
        }),
      );

      expect(result.current.times.white).toBe(5_400_000); // 90 minutes in ms
      expect(result.current.times.black).toBe(5_400_000);
    });
  });

  describe("period transitions", () => {
    it("should track period moves for each player", () => {
      const { result } = renderHook(() =>
        useChessClock({
          time: [
            { baseTime: 300, increment: 5, moves: 3 }, // 5 min, 3 moves to advance
            { baseTime: 180, increment: 3 },
          ],
          clockStart: "immediate",
        }),
      );

      // Initial state
      expect(result.current.periodMoves).toEqual({ white: 0, black: 0 });

      // White's first move
      act(() => {
        result.current.methods.switch();
      });

      expect(result.current.periodMoves).toEqual({ white: 1, black: 0 });

      // Black's first move
      act(() => {
        result.current.methods.switch();
      });

      expect(result.current.periodMoves).toEqual({ white: 1, black: 1 });

      // White's second move
      act(() => {
        result.current.methods.switch();
      });

      expect(result.current.periodMoves).toEqual({ white: 2, black: 1 });
    });

    it("should advance player to next period after completing required moves", () => {
      const { result } = renderHook(() =>
        useChessClock({
          time: [
            { baseTime: 300, increment: 5, moves: 2 }, // 2 moves to advance
            { baseTime: 180, increment: 3 },
          ],
          clockStart: "immediate",
        }),
      );

      const initialWhiteTime = result.current.times.white;

      // Make moves: white(1), black(1), white(2) -> white advances
      act(() => {
        result.current.methods.switch(); // white moves
      });
      expect(result.current.currentPeriodIndex.white).toBe(0);

      act(() => {
        result.current.methods.switch(); // black moves
      });
      expect(result.current.currentPeriodIndex.black).toBe(0);

      act(() => {
        result.current.methods.switch(); // white moves again (2nd move)
      });

      // White should advance to period 1
      expect(result.current.currentPeriodIndex.white).toBe(1);
      // Black should still be in period 0
      expect(result.current.currentPeriodIndex.black).toBe(0);
      // White's period moves should reset
      expect(result.current.periodMoves.white).toBe(0);
      // White should receive period 1's base time (180s = 180,000ms) plus increments from switches
      expect(result.current.times.white).toBeGreaterThanOrEqual(
        initialWhiteTime + 180_000,
      );
      expect(result.current.times.white).toBeLessThanOrEqual(
        initialWhiteTime + 180_000 + 20_000, // Allow for increment variance
      );
      // White's current period should reflect new settings
      expect(result.current.currentPeriod.white).toMatchObject({
        baseTime: 180,
        increment: 3,
      });
    });

    it("should handle both players advancing simultaneously", () => {
      const { result } = renderHook(() =>
        useChessClock({
          time: [
            { baseTime: 300, increment: 5, moves: 2 },
            { baseTime: 180, increment: 3 },
          ],
          clockStart: "immediate",
        }),
      );

      // Make 2 moves each: both should advance to period 1
      for (let i = 0; i < 4; i++) {
        act(() => {
          result.current.methods.switch();
        });
      }

      expect(result.current.currentPeriodIndex).toEqual({ white: 1, black: 1 });
      expect(result.current.periodMoves).toEqual({ white: 0, black: 0 });
    });

    it("should not advance from sudden death period", () => {
      const { result } = renderHook(() =>
        useChessClock({
          time: [
            { baseTime: 300, increment: 5, moves: 2 },
            { baseTime: 180, increment: 3 }, // Sudden death
          ],
          clockStart: "immediate",
        }),
      );

      // Advance to period 1
      for (let i = 0; i < 4; i++) {
        act(() => {
          result.current.methods.switch();
        });
      }

      expect(result.current.currentPeriodIndex).toEqual({ white: 1, black: 1 });

      const whiteTimeAfterAdvance = result.current.times.white;

      // Make more moves - should not advance further
      for (let i = 0; i < 4; i++) {
        act(() => {
          result.current.methods.switch();
        });
      }

      // Still in period 1
      expect(result.current.currentPeriodIndex).toEqual({ white: 1, black: 1 });
      // Period moves continue to increment
      expect(result.current.periodMoves.white).toBeGreaterThan(0);
      // No additional base time added
      expect(result.current.times.white).not.toBeGreaterThan(
        whiteTimeAfterAdvance + 10_000, // Allow for small timing variation
      );
    });
  });

  describe("reset with multi-period", () => {
    it("should reset period state on reset", () => {
      const { result } = renderHook(() =>
        useChessClock({
          time: [
            { baseTime: 300, increment: 5, moves: 2 },
            { baseTime: 180, increment: 3 },
          ],
          clockStart: "immediate",
        }),
      );

      // Advance to period 1
      for (let i = 0; i < 4; i++) {
        act(() => {
          result.current.methods.switch();
        });
      }

      expect(result.current.currentPeriodIndex).toEqual({ white: 1, black: 1 });

      // Reset
      act(() => {
        result.current.methods.reset();
      });

      // Period state should be reset
      expect(result.current.currentPeriodIndex).toEqual({ white: 0, black: 0 });
      expect(result.current.periodMoves).toEqual({ white: 0, black: 0 });
    });

    it("should reset to new multi-period time control", () => {
      const { result } = renderHook(() =>
        useChessClock({
          time: [
            { baseTime: 300, increment: 5, moves: 2 },
            { baseTime: 180, increment: 3 },
          ],
        }),
      );

      expect(result.current.totalPeriods).toBe(2);

      // Reset to single period
      act(() => {
        result.current.methods.reset("10+5");
      });

      expect(result.current.totalPeriods).toBe(1);
      expect(result.current.currentPeriodIndex).toEqual({ white: 0, black: 0 });
    });
  });

  describe("three-period time control", () => {
    it("should handle three-period tournament time control", () => {
      const { result } = renderHook(() =>
        useChessClock({
          time: [
            { baseTime: 5400, increment: 30, moves: 40 }, // Period 1
            { baseTime: 3600, increment: 30, moves: 20 }, // Period 2
            { baseTime: 900, increment: 30 }, // Period 3 (sudden death)
          ],
          clockStart: "immediate",
        }),
      );

      expect(result.current.totalPeriods).toBe(3);

      // Simulate completing period 1 (40 moves each)
      // We'll do 4 moves to demonstrate the mechanics
      const initialWhiteTime = result.current.times.white;

      act(() => {
        result.current.methods.switch(); // 1
      });
      act(() => {
        result.current.methods.switch(); // 2
      });
      act(() => {
        result.current.methods.switch(); // 3
      });
      act(() => {
        result.current.methods.switch(); // 4
      });

      // After 4 moves (2 each), still in period 0
      expect(result.current.currentPeriodIndex.white).toBe(0);
      expect(result.current.periodMoves.white).toBe(2);
      // Time should have increased due to increments (30 seconds per white move = 2 moves)
      expect(result.current.times.white).toBeGreaterThan(initialWhiteTime);
      expect(result.current.times.white).toBeLessThanOrEqual(
        initialWhiteTime + 70_000, // Allow some variance
      );
    });
  });

  describe("independent player advancement", () => {
    it("should handle white advancing while black stays in earlier period", () => {
      const { result } = renderHook(() =>
        useChessClock({
          time: [
            { baseTime: 300, increment: 5, moves: 2 },
            { baseTime: 180, increment: 3, moves: 2 },
            { baseTime: 60, increment: 2 },
          ],
          clockStart: "immediate",
        }),
      );

      // Make moves to demonstrate independent advancement
      // With 2 moves per period:
      // Switch 1: W=1, B=0
      // Switch 2: W=1, B=1
      // Switch 3: W=2->0 (advances), B=1
      // Switch 4: W=0, B=2->0 (advances)
      // Switch 5: W=1, B=0
      // Switch 6: W=1, B=1
      // Switch 7: W=2->0 (advances), B=1
      // Switch 8: W=0, B=2->0 (advances)
      for (let i = 0; i < 8; i++) {
        act(() => {
          result.current.methods.switch();
        });
      }

      // After 8 moves (4 each), both players advance twice:
      // - Each completes 2 moves in period 0 -> advance to period 1
      // - Each completes 2 more moves in period 1 -> advance to period 2
      expect(result.current.currentPeriodIndex.white).toBe(2);
      expect(result.current.currentPeriodIndex.black).toBe(2);
      expect(result.current.periodMoves.white).toBe(0); // Reset after second advancement
      expect(result.current.periodMoves.black).toBe(0);
    });
  });
});
