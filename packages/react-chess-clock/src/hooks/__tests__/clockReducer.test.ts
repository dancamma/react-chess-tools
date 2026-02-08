import {
  clockReducer,
  createInitialClockState,
  ClockState,
} from "../clockReducer";
import { parseTimeControlConfig } from "../../utils/timeControl";
import { ClockStatus, PeriodState } from "../../types";

describe("clockReducer", () => {
  const initialTimes = { white: 300000, black: 300000 };
  const defaultConfig = parseTimeControlConfig({ time: "5+0" });

  function createState(overrides?: Partial<ClockState>): ClockState {
    const { moveStartTime, elapsedAtPause, ...rest } = overrides ?? {};
    return {
      times: initialTimes,
      initialTimes,
      status: "idle",
      activePlayer: null,
      timeout: null,
      switchCount: 0,
      config: defaultConfig,
      moveStartTime: moveStartTime ?? null,
      elapsedAtPause: elapsedAtPause ?? 0,
      ...rest,
    };
  }

  describe("START", () => {
    it("should start the clock and set active player to white", () => {
      const state = createState();
      const result = clockReducer(state, { type: "START" });

      expect(result.status).toBe("running");
      expect(result.activePlayer).toBe("white");
    });

    it("should preserve existing active player", () => {
      const state = createState({ activePlayer: "black" });
      const result = clockReducer(state, { type: "START" });

      expect(result.status).toBe("running");
      expect(result.activePlayer).toBe("black");
    });

    it("should not start if already finished", () => {
      const state = createState({ status: "finished" });
      const result = clockReducer(state, { type: "START" });

      expect(result).toBe(state);
    });
  });

  describe("PAUSE", () => {
    it("should pause a running clock", () => {
      const state = createState({ status: "running", activePlayer: "white" });
      const result = clockReducer(state, { type: "PAUSE" });

      expect(result.status).toBe("paused");
    });

    it("should not pause if not running", () => {
      const state = createState({ status: "idle" });
      const result = clockReducer(state, { type: "PAUSE" });

      expect(result).toBe(state);
    });
  });

  describe("RESUME", () => {
    it("should resume a paused clock", () => {
      const state = createState({ status: "paused", activePlayer: "white" });
      const result = clockReducer(state, { type: "RESUME" });

      expect(result.status).toBe("running");
    });

    it("should not resume if not paused", () => {
      const state = createState({ status: "running", activePlayer: "white" });
      const result = clockReducer(state, { type: "RESUME" });

      expect(result).toBe(state);
    });
  });

  describe("SWITCH", () => {
    it("should switch to the opposite player", () => {
      const state = createState({ status: "running", activePlayer: "white" });
      const result = clockReducer(state, { type: "SWITCH", payload: {} });

      expect(result.activePlayer).toBe("black");
    });

    it("should switch from black to white", () => {
      const state = createState({ status: "running", activePlayer: "black" });
      const result = clockReducer(state, { type: "SWITCH", payload: {} });

      expect(result.activePlayer).toBe("white");
    });

    it("should update times if provided", () => {
      const state = createState({ status: "running", activePlayer: "white" });
      const newTimes = { white: 290000, black: 300000 };
      const result = clockReducer(state, {
        type: "SWITCH",
        payload: { newTimes },
      });

      expect(result.times).toEqual(newTimes);
    });

    it("should start clock if idle but activePlayer is set", () => {
      const state = createState({ status: "idle", activePlayer: "white" });
      const result = clockReducer(state, { type: "SWITCH", payload: {} });

      expect(result.status).toBe("running");
      expect(result.activePlayer).toBe("black");
    });

    it("should no-op if activePlayer is null", () => {
      const state = createState({ status: "idle", activePlayer: null });
      const result = clockReducer(state, { type: "SWITCH", payload: {} });

      expect(result).toBe(state);
    });

    it("should preserve times if not provided", () => {
      const state = createState({ status: "running", activePlayer: "white" });
      const result = clockReducer(state, { type: "SWITCH", payload: {} });

      expect(result.times).toEqual(initialTimes);
    });
  });

  describe("SWITCH (delayed mode)", () => {
    it("should set active player to black on first switch in delayed mode", () => {
      const state = createState({ status: "delayed" });
      const result = clockReducer(state, { type: "SWITCH", payload: {} });

      expect(result.activePlayer).toBe("black");
      expect(result.switchCount).toBe(1);
      expect(result.status).toBe("delayed");
    });

    it("should set active player to white on second switch and start clock", () => {
      const state = createState({ status: "delayed", switchCount: 1 });
      const result = clockReducer(state, { type: "SWITCH", payload: {} });

      expect(result.activePlayer).toBe("white");
      expect(result.switchCount).toBe(2);
      expect(result.status).toBe("running");
    });

    it("should not modify times during delayed switches", () => {
      const state = createState({
        status: "delayed",
        times: { white: 300000, black: 300000 },
      });
      const result = clockReducer(state, { type: "SWITCH", payload: {} });

      expect(result.times).toEqual({ white: 300000, black: 300000 });
    });
  });

  describe("TIMEOUT", () => {
    it("should set finished status and timeout player", () => {
      const state = createState({ status: "running", activePlayer: "white" });
      const result = clockReducer(state, {
        type: "TIMEOUT",
        payload: { player: "white" },
      });

      expect(result.status).toBe("finished");
      expect(result.timeout).toBe("white");
      expect(result.times.white).toBe(0);
    });

    it("should preserve other player time", () => {
      const state = createState({
        status: "running",
        activePlayer: "white",
        times: { white: 100, black: 300000 },
      });
      const result = clockReducer(state, {
        type: "TIMEOUT",
        payload: { player: "white" },
      });

      expect(result.times.black).toBe(300000);
    });
  });

  describe("RESET", () => {
    it("should reset to new initial state", () => {
      const state = createState({
        status: "finished",
        activePlayer: "black",
        timeout: "white",
        switchCount: 5,
        times: { white: 0, black: 100000 },
      });

      const result = clockReducer(state, {
        type: "RESET",
        payload: { time: "10+0" },
      });

      expect(result.times).toEqual({ white: 600000, black: 600000 });
      expect(result.initialTimes).toEqual({ white: 600000, black: 600000 });
      expect(result.status).toBe("delayed");
      expect(result.activePlayer).toBeNull();
      expect(result.timeout).toBeNull();
      expect(result.switchCount).toBe(0);
    });

    it("should reset to immediate clock start", () => {
      const state = createState({
        status: "finished",
        activePlayer: "black",
        timeout: "white",
      });

      const result = clockReducer(state, {
        type: "RESET",
        payload: { time: "10+0", clockStart: "immediate" },
      });

      expect(result.status).toBe("running");
      expect(result.activePlayer).toBe("white");
    });

    it("should set moveStartTime when resetting to immediate clock start", () => {
      const state = createState({
        status: "finished",
        activePlayer: "black",
        timeout: "white",
      });

      const result = clockReducer(state, {
        type: "RESET",
        payload: { time: "10+0", clockStart: "immediate" },
      });

      // When clock starts immediately, moveStartTime should be set
      // so the clock display can count down correctly
      expect(result.moveStartTime).not.toBeNull();
      expect(typeof result.moveStartTime).toBe("number");
      expect(result.moveStartTime).toBeGreaterThan(0);
    });

    it("should respect explicit now parameter for purity", () => {
      const state = createState({
        status: "finished",
        activePlayer: "black",
        timeout: "white",
      });

      const now = 1234567890;
      const result = clockReducer(state, {
        type: "RESET",
        payload: { time: "10+0", clockStart: "immediate", now },
      });

      expect(result.moveStartTime).toBe(now);
    });

    it("should produce deterministic output with same now parameter", () => {
      const state = createState({
        status: "finished",
        activePlayer: "black",
        timeout: "white",
      });

      const now = 1234567890;
      const result1 = clockReducer(state, {
        type: "RESET",
        payload: { time: "10+0", clockStart: "immediate", now },
      });
      const result2 = clockReducer(state, {
        type: "RESET",
        payload: { time: "10+0", clockStart: "immediate", now },
      });

      // Same inputs should produce same outputs (purity)
      expect(result1.moveStartTime).toBe(result2.moveStartTime);
      expect(result1.moveStartTime).toBe(now);
    });

    it("should work without now parameter for backward compatibility", () => {
      const state = createState({
        status: "finished",
        activePlayer: "black",
        timeout: "white",
      });

      const result = clockReducer(state, {
        type: "RESET",
        payload: { time: "10+0", clockStart: "immediate" },
      });

      // Should still work when now is not provided (uses Date.now() as fallback)
      expect(result.moveStartTime).not.toBeNull();
      expect(typeof result.moveStartTime).toBe("number");
      expect(result.moveStartTime).toBeGreaterThan(0);
    });
  });

  describe("ADD_TIME", () => {
    it("should add time to specified player", () => {
      const state = createState();
      const result = clockReducer(state, {
        type: "ADD_TIME",
        payload: { player: "white", milliseconds: 10000 },
      });

      expect(result.times.white).toBe(310000);
      expect(result.times.black).toBe(300000);
    });

    it("should handle negative additions", () => {
      const state = createState();
      const result = clockReducer(state, {
        type: "ADD_TIME",
        payload: { player: "black", milliseconds: -50000 },
      });

      expect(result.times.black).toBe(250000);
    });

    it("should reset elapsedAtPause when adding time to active player while paused", () => {
      const state = createState({
        status: "paused",
        activePlayer: "white",
        elapsedAtPause: 2000,
      });
      const result = clockReducer(state, {
        type: "ADD_TIME",
        payload: { player: "white", milliseconds: 5000 },
      });

      expect(result.times.white).toBe(305000);
      expect(result.elapsedAtPause).toBe(0);
    });

    it("should not reset elapsedAtPause when adding time to non-active player while paused", () => {
      const state = createState({
        status: "paused",
        activePlayer: "white",
        elapsedAtPause: 2000,
      });
      const result = clockReducer(state, {
        type: "ADD_TIME",
        payload: { player: "black", milliseconds: 5000 },
      });

      expect(result.times.black).toBe(305000);
      expect(result.elapsedAtPause).toBe(2000);
    });

    it("should account for added time on resume after pause", () => {
      // Simulate: running -> pause after 2s -> add 5s to active player -> resume
      const startTime = 1000000;
      let state = createState({
        status: "running",
        activePlayer: "white",
        moveStartTime: startTime,
      });

      // Pause after 2 seconds
      const pauseTime = startTime + 2000;
      state = clockReducer(state, {
        type: "PAUSE",
        payload: { now: pauseTime },
      });
      expect(state.elapsedAtPause).toBe(2000);

      // Add 5 seconds while paused
      state = clockReducer(state, {
        type: "ADD_TIME",
        payload: { player: "white", milliseconds: 5000 },
      });
      expect(state.elapsedAtPause).toBe(0);

      // Resume - moveStartTime should equal now (no stale offset)
      const resumeTime = pauseTime + 1000;
      state = clockReducer(state, {
        type: "RESUME",
        payload: { now: resumeTime },
      });
      expect(state.moveStartTime).toBe(resumeTime);
    });
  });

  describe("SET_TIME", () => {
    it("should set time for specified player", () => {
      const state = createState();
      const result = clockReducer(state, {
        type: "SET_TIME",
        payload: { player: "white", milliseconds: 120000 },
      });

      expect(result.times.white).toBe(120000);
      expect(result.times.black).toBe(300000);
    });

    it("should clamp negative values to zero", () => {
      const state = createState();
      const result = clockReducer(state, {
        type: "SET_TIME",
        payload: { player: "white", milliseconds: -5000 },
      });

      expect(result.times.white).toBe(0);
    });

    it("should reset elapsedAtPause when setting time for active player while paused", () => {
      const state = createState({
        status: "paused",
        activePlayer: "white",
        elapsedAtPause: 2000,
      });
      const result = clockReducer(state, {
        type: "SET_TIME",
        payload: { player: "white", milliseconds: 120000 },
      });

      expect(result.times.white).toBe(120000);
      expect(result.elapsedAtPause).toBe(0);
    });

    it("should not reset elapsedAtPause when setting time for non-active player while paused", () => {
      const state = createState({
        status: "paused",
        activePlayer: "white",
        elapsedAtPause: 2000,
      });
      const result = clockReducer(state, {
        type: "SET_TIME",
        payload: { player: "black", milliseconds: 120000 },
      });

      expect(result.times.black).toBe(120000);
      expect(result.elapsedAtPause).toBe(2000);
    });
  });

  describe("unknown action", () => {
    it("should return state unchanged for unknown action", () => {
      const state = createState();
      // @ts-expect-error - testing unknown action
      const result = clockReducer(state, { type: "UNKNOWN" });

      expect(result).toBe(state);
    });
  });
});

describe("createInitialClockState", () => {
  const testConfig = parseTimeControlConfig({ time: "5+0" });

  it("should create initial state with provided values", () => {
    const initialTimes = { white: 300000, black: 300000 };
    const state = createInitialClockState(
      initialTimes,
      "running",
      "white",
      testConfig,
    );

    expect(state).toEqual({
      times: initialTimes,
      initialTimes,
      status: "running",
      activePlayer: "white",
      timeout: null,
      switchCount: 0,
      periodState: undefined,
      config: testConfig,
      moveStartTime: expect.any(Number),
      elapsedAtPause: 0,
    });
    expect(state.moveStartTime).toBeGreaterThan(0);
  });

  it("should handle delayed status", () => {
    const initialTimes = { white: 600000, black: 600000 };
    const state = createInitialClockState(
      initialTimes,
      "delayed",
      null,
      testConfig,
    );

    expect(state.status).toBe("delayed");
    expect(state.activePlayer).toBeNull();
  });

  it("should include periodState when provided", () => {
    const initialTimes = { white: 300000, black: 300000 };
    const periodState: PeriodState = {
      periodIndex: { white: 0, black: 0 },
      periodMoves: { white: 0, black: 0 },
      periods: [
        { baseTime: 5_400_000, increment: 30_000, moves: 40 },
        { baseTime: 1_800_000, increment: 30_000 },
      ],
    };

    const state = createInitialClockState(
      initialTimes,
      "running",
      "white",
      testConfig,
      periodState,
    );

    expect(state.periodState).toEqual(periodState);
  });
});

// ============================================================================
// Multi-Period Time Control Tests
// ============================================================================

describe("clockReducer - multi-period time controls", () => {
  const initialTimes = { white: 300000, black: 300000 };
  const multiPeriodConfig = parseTimeControlConfig({
    time: [
      { baseTime: 5400, increment: 30, moves: 40 },
      { baseTime: 1800, increment: 30 },
    ],
  });

  function createState(overrides?: Partial<ClockState>): ClockState {
    const { moveStartTime, elapsedAtPause, ...rest } = overrides ?? {};
    return {
      times: initialTimes,
      initialTimes,
      status: "idle",
      activePlayer: null,
      timeout: null,
      switchCount: 0,
      config: multiPeriodConfig,
      moveStartTime: moveStartTime ?? null,
      elapsedAtPause: elapsedAtPause ?? 0,
      ...rest,
    };
  }

  function createPeriodState(
    periodIndex: { white: number; black: number },
    periodMoves: { white: number; black: number },
    periods: PeriodState["periods"],
  ): PeriodState {
    return {
      periodIndex,
      periodMoves,
      periods,
    };
  }

  describe("period advancement - both players simultaneously", () => {
    it("should advance both players to next period when both complete required moves", () => {
      const periods = [
        { baseTime: 5_400_000, increment: 30_000, moves: 40 },
        { baseTime: 1_800_000, increment: 30_000 },
      ];

      const periodState = createPeriodState(
        { white: 0, black: 0 },
        { white: 40, black: 40 },
        periods,
      );

      const state = createState({
        status: "running",
        activePlayer: "white",
        periodState,
      });

      const result = clockReducer(state, {
        type: "SWITCH",
        payload: { newTimes: { white: 100000, black: 100000 } },
      });

      // Both players advance to period 1
      expect(result.periodState?.periodIndex).toEqual({ white: 1, black: 1 });
      // Both players have move counters reset
      expect(result.periodState?.periodMoves).toEqual({ white: 0, black: 0 });
      // Both players receive next period's base time (1,800,000ms)
      expect(result.times.white).toBe(100000 + 1_800_000);
      expect(result.times.black).toBe(100000 + 1_800_000);
    });

    it("should add correct base time when advancing", () => {
      const periods = [
        { baseTime: 300_000, increment: 5_000, moves: 5 },
        { baseTime: 180_000, increment: 3_000 },
      ];

      const periodState = createPeriodState(
        { white: 0, black: 0 },
        { white: 5, black: 5 },
        periods,
      );

      const state = createState({
        status: "running",
        activePlayer: "white",
        periodState,
        times: { white: 150000, black: 150000 },
      });

      const result = clockReducer(state, {
        type: "SWITCH",
        payload: { newTimes: { white: 150000, black: 150000 } },
      });

      // Each player gets 180,000ms added
      expect(result.times.white).toBe(150000 + 180_000);
      expect(result.times.black).toBe(150000 + 180_000);
    });
  });

  describe("period advancement - players at different rates", () => {
    it("should advance only white when white completes required moves but black does not", () => {
      const periods = [
        { baseTime: 5_400_000, increment: 30_000, moves: 40 },
        { baseTime: 1_800_000, increment: 30_000 },
      ];

      const periodState = createPeriodState(
        { white: 0, black: 0 },
        { white: 40, black: 35 },
        periods,
      );

      const state = createState({
        status: "running",
        activePlayer: "white",
        periodState,
      });

      const result = clockReducer(state, {
        type: "SWITCH",
        payload: { newTimes: { white: 100000, black: 100000 } },
      });

      // White advances, black stays in period 0
      expect(result.periodState?.periodIndex).toEqual({ white: 1, black: 0 });
      // White's move counter resets, black's continues
      expect(result.periodState?.periodMoves).toEqual({ white: 0, black: 35 });
      // Only white receives additional time
      expect(result.times.white).toBe(100000 + 1_800_000);
      expect(result.times.black).toBe(100000);
    });

    it("should advance only black when black completes required moves but white does not", () => {
      const periods = [
        { baseTime: 5_400_000, increment: 30_000, moves: 40 },
        { baseTime: 1_800_000, increment: 30_000 },
      ];

      const periodState = createPeriodState(
        { white: 0, black: 0 },
        { white: 35, black: 40 },
        periods,
      );

      const state = createState({
        status: "running",
        activePlayer: "black",
        periodState,
      });

      const result = clockReducer(state, {
        type: "SWITCH",
        payload: { newTimes: { white: 100000, black: 100000 } },
      });

      expect(result.periodState?.periodIndex).toEqual({ white: 0, black: 1 });
      expect(result.periodState?.periodMoves).toEqual({ white: 35, black: 0 });
      expect(result.times.white).toBe(100000);
      expect(result.times.black).toBe(100000 + 1_800_000);
    });

    it("should handle gradual catch-up - white advances first, black catches up later", () => {
      const periods = [
        { baseTime: 300_000, increment: 5_000, moves: 3 },
        { baseTime: 180_000, increment: 3_000 },
      ];

      // Initial: white has 2 moves, black has 2 moves (one away from advancing)
      const periodState = createPeriodState(
        { white: 0, black: 0 },
        { white: 2, black: 2 },
        periods,
      );

      let state = createState({
        status: "running",
        activePlayer: "white",
        periodState,
      });

      // First switch - white moves (3rd move), advances to period 1
      let result = clockReducer(state, {
        type: "SWITCH",
        payload: { newTimes: { white: 100000, black: 100000 } },
      });

      expect(result.periodState?.periodIndex).toEqual({ white: 1, black: 0 });
      expect(result.periodState?.periodMoves).toEqual({ white: 0, black: 2 });

      // Second switch - black moves (3rd move), advances to period 1
      state = { ...result, times: result.times };
      result = clockReducer(state, {
        type: "SWITCH",
        payload: { newTimes: { white: 1900000, black: 100000 } },
      });

      // Both players now in period 1
      expect(result.periodState?.periodIndex).toEqual({ white: 1, black: 1 });
      expect(result.periodState?.periodMoves).toEqual({ white: 0, black: 0 });
    });
  });

  describe("final sudden death period", () => {
    it("should not advance from sudden death period", () => {
      const periods = [
        { baseTime: 5_400_000, increment: 30_000, moves: 40 },
        { baseTime: 1_800_000, increment: 30_000 },
      ];

      const periodState = createPeriodState(
        { white: 1, black: 1 },
        { white: 50, black: 50 },
        periods,
      );

      const state = createState({
        status: "running",
        activePlayer: "white",
        periodState,
      });

      const result = clockReducer(state, {
        type: "SWITCH",
        payload: { newTimes: { white: 100000, black: 100000 } },
      });

      // No advancement from sudden death
      expect(result.periodState?.periodIndex).toEqual({ white: 1, black: 1 });
      // Move counter continues to increment (white was active, so white's count increases)
      expect(result.periodState?.periodMoves).toEqual({ white: 51, black: 50 });
      // No additional time added
      expect(result.times.white).toBe(100000);
      expect(result.times.black).toBe(100000);
    });

    it("should handle three-period time control with final sudden death", () => {
      const periods = [
        { baseTime: 5_400_000, increment: 30_000, moves: 40 },
        { baseTime: 3_600_000, increment: 30_000, moves: 20 },
        { baseTime: 900_000, increment: 30_000 },
      ];

      const periodState = createPeriodState(
        { white: 1, black: 2 },
        { white: 15, black: 25 },
        periods,
      );

      const state = createState({
        status: "running",
        activePlayer: "white",
        periodState,
      });

      const result = clockReducer(state, {
        type: "SWITCH",
        payload: { newTimes: { white: 500000, black: 200000 } },
      });

      // White in period 1, black in period 2 (sudden death)
      expect(result.periodState?.periodIndex).toEqual({ white: 1, black: 2 });
    });
  });

  describe("edge cases", () => {
    it("should handle exceeding required moves by more than 1", () => {
      const periods = [
        { baseTime: 300_000, increment: 5_000, moves: 5 },
        { baseTime: 180_000, increment: 3_000 },
      ];

      const periodState = createPeriodState(
        { white: 0, black: 0 },
        { white: 10, black: 3 },
        periods,
      );

      const state = createState({
        status: "running",
        activePlayer: "white",
        periodState,
      });

      const result = clockReducer(state, {
        type: "SWITCH",
        payload: { newTimes: { white: 100000, black: 100000 } },
      });

      // White advances despite having way more moves than required
      expect(result.periodState?.periodIndex).toEqual({ white: 1, black: 0 });
      expect(result.periodState?.periodMoves).toEqual({ white: 0, black: 3 });
    });

    it("should handle zero moves required (treated as sudden death, no advancement)", () => {
      const periods = [
        { baseTime: 5_400_000, increment: 30_000, moves: 0 },
        { baseTime: 1_800_000, increment: 30_000 },
      ];

      const periodState = createPeriodState(
        { white: 0, black: 0 },
        { white: 0, black: 0 },
        periods,
      );

      const state = createState({
        status: "running",
        activePlayer: "white",
        periodState,
      });

      const result = clockReducer(state, {
        type: "SWITCH",
        payload: { newTimes: { white: 100000, black: 100000 } },
      });

      // Zero moves is treated as falsy (like undefined), so no advancement occurs
      // This is because !0 === true in the check at line 78
      expect(result.periodState?.periodIndex).toEqual({ white: 0, black: 0 });
      // Move count still increments
      expect(result.periodState?.periodMoves).toEqual({ white: 1, black: 0 });
    });

    it("should advance when moves equals required after switch", () => {
      const periods = [
        { baseTime: 5_400_000, increment: 30_000, moves: 40 },
        { baseTime: 1_800_000, increment: 30_000 },
      ];

      // Start with 39 moves each - one away from advancement
      const periodState = createPeriodState(
        { white: 0, black: 0 },
        { white: 39, black: 39 },
        periods,
      );

      const state = createState({
        status: "running",
        activePlayer: "white",
        periodState,
      });

      const result = clockReducer(state, {
        type: "SWITCH",
        payload: { newTimes: { white: 100000, black: 100000 } },
      });

      // White moves (39 -> 40), which meets the requirement, so white advances
      expect(result.periodState?.periodIndex).toEqual({ white: 1, black: 0 });
      expect(result.periodState?.periodMoves).toEqual({ white: 0, black: 39 });
    });
  });

  describe("delayed mode with multi-period", () => {
    it("should track period moves during delayed mode", () => {
      const periods = [
        { baseTime: 300_000, increment: 5_000, moves: 2 },
        { baseTime: 180_000, increment: 3_000 },
      ];

      const periodState = createPeriodState(
        { white: 0, black: 0 },
        { white: 0, black: 0 },
        periods,
      );

      const state = createInitialClockState(
        { white: 300000, black: 300000 },
        "delayed",
        null,
        multiPeriodConfig,
        periodState,
      );

      // First switch: white moves (delayed mode)
      let result = clockReducer(state, { type: "SWITCH", payload: {} });

      expect(result.status).toBe("delayed");
      expect(result.activePlayer).toBe("black");
      expect(result.periodState?.periodMoves).toEqual({ white: 1, black: 0 });

      // Second switch: black moves (transition to running)
      result = clockReducer(result, { type: "SWITCH", payload: {} });

      expect(result.status).toBe("running");
      expect(result.activePlayer).toBe("white");
      expect(result.periodState?.periodMoves).toEqual({ white: 1, black: 1 });

      // Third switch: white moves again (completes 2 moves, advances)
      result = clockReducer(result, {
        type: "SWITCH",
        payload: { newTimes: { white: 300000, black: 300000 } },
      });

      expect(result.periodState?.periodIndex).toEqual({ white: 1, black: 0 });
      expect(result.periodState?.periodMoves).toEqual({ white: 0, black: 1 });
    });
  });

  describe("RESET with multi-period state", () => {
    it("should reset period state to initial values", () => {
      const periods = [
        { baseTime: 5_400_000, increment: 30_000, moves: 40 },
        { baseTime: 1_800_000, increment: 30_000 },
      ];

      const periodState: PeriodState = {
        periodIndex: { white: 1, black: 0 },
        periodMoves: { white: 15, black: 38 },
        periods,
      };

      const state = createInitialClockState(
        { white: 300000, black: 300000 },
        "running",
        "white",
        multiPeriodConfig,
        periodState,
      );

      const modifiedState = {
        ...state,
        times: { white: 100000, black: 200000 },
        status: "paused" as ClockStatus,
      };

      const result = clockReducer(modifiedState, {
        type: "RESET",
        payload: {
          time: [
            { baseTime: 5400, increment: 30, moves: 40 },
            { baseTime: 1800, increment: 30 },
          ],
          clockStart: "delayed",
        },
      });

      expect(result.times).toEqual({ white: 5400000, black: 5400000 });
      expect(result.status).toBe("delayed");
      expect(result.activePlayer).toBeNull();
      expect(result.periodState?.periodIndex).toEqual({ white: 0, black: 0 });
      expect(result.periodState?.periodMoves).toEqual({ white: 0, black: 0 });
    });
  });
});
