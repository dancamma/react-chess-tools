import type { ClockColor, ClockTimes, ClockStatus } from "../types";

// ============================================================================
// State
// ============================================================================

export interface ClockState {
  /** The actual stored time values for each player. Updates when time is deducted (after delays) or added via increments. */
  times: ClockTimes;
  /** The starting time values for each player, used for reset operations. */
  initialTimes: ClockTimes;
  /** Current clock status - whether it's idle, running, paused, or finished. */
  status: ClockStatus;
  /** The player whose clock is currently counting down. Null when clock is idle. */
  activePlayer: ClockColor | null;
  /** Which player timed out, if any. Set when the clock reaches finished status. */
  timeout: ClockColor | null;
  /** Number of times the clock has switched between players. Used for move counting in some time controls. */
  switchCount: number;
}

// ============================================================================
// Actions
// ============================================================================

export type ClockAction =
  | { type: "START" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "SWITCH"; payload: { newTimes?: ClockTimes } }
  | { type: "TIMEOUT"; payload: { player: ClockColor } }
  | {
      type: "RESET";
      payload: {
        initialTimes: ClockTimes;
        status: ClockStatus;
        activePlayer: ClockColor | null;
      };
    }
  | { type: "ADD_TIME"; payload: { player: ClockColor; milliseconds: number } }
  | { type: "SET_TIME"; payload: { player: ClockColor; milliseconds: number } };

// ============================================================================
// Reducer
// ============================================================================

export function clockReducer(
  state: ClockState,
  action: ClockAction,
): ClockState {
  switch (action.type) {
    case "START":
      if (state.status === "finished") return state;
      return {
        ...state,
        status: "running",
        activePlayer: state.activePlayer ?? "white",
      };

    case "PAUSE":
      if (state.status !== "running") return state;
      return { ...state, status: "paused" };

    case "RESUME":
      if (state.status !== "paused") return state;
      return { ...state, status: "running" };

    case "SWITCH": {
      // Handle delayed start mode
      if (state.status === "delayed") {
        const newCount = state.switchCount + 1;
        const newPlayer: ClockColor = newCount % 2 === 1 ? "black" : "white";
        return {
          ...state,
          activePlayer: newPlayer,
          switchCount: newCount,
          status: newCount >= 2 ? "running" : "delayed",
        };
      }

      // Normal switch handling
      if (state.activePlayer === null) return state;
      const { newTimes } = action.payload;
      const newPlayer = state.activePlayer === "white" ? "black" : "white";
      return {
        ...state,
        activePlayer: newPlayer,
        times: newTimes ?? state.times,
        status: state.status === "idle" ? "running" : state.status,
      };
    }

    case "TIMEOUT": {
      const { player } = action.payload;
      return {
        ...state,
        status: "finished",
        timeout: player,
        times: { ...state.times, [player]: 0 },
      };
    }

    case "RESET": {
      const { initialTimes, status, activePlayer } = action.payload;
      return createInitialClockState(initialTimes, status, activePlayer);
    }

    case "ADD_TIME": {
      const { player, milliseconds } = action.payload;
      const newTimes = {
        ...state.times,
        [player]: state.times[player] + milliseconds,
      };
      return { ...state, times: newTimes };
    }

    case "SET_TIME": {
      const { player, milliseconds } = action.payload;
      const newTimes = {
        ...state.times,
        [player]: Math.max(0, milliseconds),
      };
      return { ...state, times: newTimes };
    }

    default:
      return state;
  }
}

// ============================================================================
// Initial State Factory
// ============================================================================

export function createInitialClockState(
  initialTimes: ClockTimes,
  status: ClockStatus,
  activePlayer: ClockColor | null,
): ClockState {
  return {
    times: initialTimes,
    initialTimes,
    status,
    activePlayer,
    timeout: null,
    switchCount: 0,
  };
}
