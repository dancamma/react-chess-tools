import {
  clockReducer,
  createInitialClockState,
  ClockState,
} from "../clockReducer";

describe("clockReducer", () => {
  const initialTimes = { white: 300000, black: 300000 };

  function createState(overrides: Partial<ClockState> = {}): ClockState {
    return {
      times: initialTimes,
      initialTimes,
      status: "idle",
      activePlayer: null,
      timeout: null,
      switchCount: 0,
      ...overrides,
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

      const newInitialTimes = { white: 600000, black: 600000 };
      const result = clockReducer(state, {
        type: "RESET",
        payload: {
          initialTimes: newInitialTimes,
          status: "idle",
          activePlayer: null,
        },
      });

      expect(result.times).toEqual(newInitialTimes);
      expect(result.initialTimes).toEqual(newInitialTimes);
      expect(result.status).toBe("idle");
      expect(result.activePlayer).toBeNull();
      expect(result.timeout).toBeNull();
      expect(result.switchCount).toBe(0);
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
  it("should create initial state with provided values", () => {
    const initialTimes = { white: 300000, black: 300000 };
    const state = createInitialClockState(initialTimes, "running", "white");

    expect(state).toEqual({
      times: initialTimes,
      initialTimes,
      status: "running",
      activePlayer: "white",
      timeout: null,
      switchCount: 0,
    });
  });

  it("should handle delayed status", () => {
    const initialTimes = { white: 600000, black: 600000 };
    const state = createInitialClockState(initialTimes, "delayed", null);

    expect(state.status).toBe("delayed");
    expect(state.activePlayer).toBeNull();
  });
});
