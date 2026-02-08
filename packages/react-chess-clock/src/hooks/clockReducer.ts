import type {
  ClockColor,
  ClockTimes,
  ClockStatus,
  PeriodState,
  TimeControlConfig,
  NormalizedTimeControl,
} from "../types";
import { parseTimeControlConfig, getInitialTimes } from "../utils/timeControl";
import {
  getInitialActivePlayer,
  getInitialStatus,
} from "../utils/timingMethods";

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
  /** Multi-period state tracking (only present for multi-period time controls) */
  periodState?: PeriodState;
  /** The normalized time control configuration (kept in sync with resets) */
  config: NormalizedTimeControl;
  /**
   * Timestamp (ms since epoch) when the current player's move started.
   * Used to calculate elapsed time as `Date.now() - moveStartTime`.
   * Null when the clock hasn't started yet or is paused.
   */
  moveStartTime: number | null;
  /**
   * When the clock is paused, this stores the elapsed time (in ms) at the
   * moment of pause. This allows resuming without "losing" the paused time.
   */
  elapsedAtPause: number;
}

// ============================================================================
// Actions
// ============================================================================

export type ClockAction =
  | { type: "START"; payload?: { now?: number } }
  | { type: "PAUSE"; payload?: { now?: number } }
  | { type: "RESUME"; payload?: { now?: number } }
  | { type: "SWITCH"; payload: { newTimes?: ClockTimes; now?: number } }
  | { type: "TIMEOUT"; payload: { player: ClockColor } }
  | { type: "RESET"; payload: TimeControlConfig & { now?: number } }
  | {
      type: "ADD_TIME";
      payload: { player: ClockColor; milliseconds: number; now?: number };
    }
  | {
      type: "SET_TIME";
      payload: { player: ClockColor; milliseconds: number; now?: number };
    };

// ============================================================================
// Helpers
// ============================================================================

/**
 * After a switch increments period moves, check if any player has completed
 * their required moves for the current period and should advance to the next.
 * Returns updated times and periodState, or the originals if no advancement.
 */
function maybeAdvancePeriod(
  times: ClockTimes,
  periodState: PeriodState,
): { times: ClockTimes; periodState: PeriodState } {
  let newTimes = times;
  let newPeriodState = periodState;

  (["white", "black"] as const).forEach((player) => {
    const playerPeriodIndex = newPeriodState.periodIndex[player];

    if (
      playerPeriodIndex < 0 ||
      playerPeriodIndex >= newPeriodState.periods.length
    ) {
      return;
    }

    const currentPeriod = newPeriodState.periods[playerPeriodIndex];
    if (!currentPeriod?.moves) return; // Sudden death period, no transition

    const movesRequired = currentPeriod.moves;
    const playerMoves = newPeriodState.periodMoves[player];

    if (playerMoves >= movesRequired) {
      const nextPeriodIndex = playerPeriodIndex + 1;

      if (nextPeriodIndex >= newPeriodState.periods.length) {
        return; // Already at final period
      }

      const nextPeriod = newPeriodState.periods[nextPeriodIndex];
      if (!nextPeriod) return;

      const addedTime = nextPeriod.baseTime;

      newPeriodState = {
        ...newPeriodState,
        periodIndex: {
          ...newPeriodState.periodIndex,
          [player]: nextPeriodIndex,
        },
        periodMoves: {
          ...newPeriodState.periodMoves,
          [player]: 0,
        },
      };

      newTimes = {
        ...newTimes,
        [player]: newTimes[player] + addedTime,
      };
    }
  });

  return { times: newTimes, periodState: newPeriodState };
}

// ============================================================================
// Reducer
// ============================================================================

export function clockReducer(
  state: ClockState,
  action: ClockAction,
): ClockState {
  switch (action.type) {
    case "START": {
      if (state.status === "finished") return state;
      // Don't interrupt delayed mode - it transitions to running after both players move
      if (state.status === "delayed") {
        return state; // No change in delayed mode
      }
      const now = action.payload?.now ?? Date.now();
      return {
        ...state,
        status: "running",
        activePlayer: state.activePlayer ?? "white",
        // Initialize move start time if not already set
        moveStartTime: state.moveStartTime ?? now,
      };
    }

    case "PAUSE": {
      if (state.status !== "running") return state;
      const now = action.payload?.now ?? Date.now();
      // Store elapsed time at pause moment
      const elapsedAtPause =
        state.moveStartTime !== null ? now - state.moveStartTime : 0;
      return {
        ...state,
        status: "paused",
        elapsedAtPause,
        moveStartTime: null,
      };
    }

    case "RESUME": {
      if (state.status !== "paused") return state;
      const now = action.payload?.now ?? Date.now();
      // Reset start time based on stored elapsed to resume seamlessly
      return {
        ...state,
        status: "running",
        moveStartTime: now - state.elapsedAtPause,
        elapsedAtPause: 0,
      };
    }

    case "SWITCH": {
      // Track period moves for multi-period time controls
      let newPeriodState = state.periodState;
      const movedPlayer: ClockColor | null = state.activePlayer;
      const now = action.payload.now ?? Date.now();

      // Handle delayed start mode
      if (state.status === "delayed") {
        const newCount = state.switchCount + 1;
        const newPlayer: ClockColor = newCount % 2 === 1 ? "black" : "white";

        // In delayed mode, track which player is making the move
        // First switch: white moves, second switch: black moves
        const delayedMovePlayer: ClockColor =
          newCount % 2 === 1 ? "white" : "black";

        // Track period moves even during delayed mode
        if (state.periodState) {
          newPeriodState = {
            ...state.periodState,
            periodMoves: {
              ...state.periodState.periodMoves,
              [delayedMovePlayer]:
                state.periodState.periodMoves[delayedMovePlayer] + 1,
            },
          };
        }

        // Check for period advancement
        if (newPeriodState) {
          const advanced = maybeAdvancePeriod(state.times, newPeriodState);
          newPeriodState = advanced.periodState;
        }

        const newStateStatus = newCount >= 2 ? "running" : "delayed";

        return {
          ...state,
          activePlayer: newPlayer,
          switchCount: newCount,
          status: newStateStatus,
          periodState: newPeriodState,
          // Start timing when transitioning to running
          moveStartTime:
            newStateStatus === "running" ? now : state.moveStartTime,
        };
      }

      // Normal switch handling
      if (movedPlayer === null) return state;
      const { newTimes } = action.payload;
      const newPlayer = movedPlayer === "white" ? "black" : "white";

      // Track period moves for multi-period time controls
      if (state.periodState) {
        newPeriodState = {
          ...state.periodState,
          periodMoves: {
            ...state.periodState.periodMoves,
            [movedPlayer]: state.periodState.periodMoves[movedPlayer] + 1,
          },
        };
      }

      let resolvedTimes = newTimes ?? state.times;

      // Check for period advancement
      if (newPeriodState) {
        const advanced = maybeAdvancePeriod(resolvedTimes, newPeriodState);
        resolvedTimes = advanced.times;
        newPeriodState = advanced.periodState;
      }

      const newStatus = state.status === "idle" ? "running" : state.status;

      return {
        ...state,
        activePlayer: newPlayer,
        times: resolvedTimes,
        switchCount: state.switchCount + 1,
        periodState: newPeriodState,
        status: newStatus,
        // Reset timing for the new player
        moveStartTime: newStatus === "running" ? now : null,
        elapsedAtPause: 0,
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
      const config = parseTimeControlConfig(action.payload);
      const initialTimes = getInitialTimes(config);
      const now = action.payload.now;

      // Compute period state for multi-period time controls
      const periodState: PeriodState | undefined = config.periods
        ? {
            periodIndex: { white: 0, black: 0 },
            periodMoves: { white: 0, black: 0 },
            periods: config.periods,
          }
        : undefined;

      return createInitialClockState(
        initialTimes,
        getInitialStatus(config.clockStart),
        getInitialActivePlayer(config.clockStart),
        config,
        periodState,
        now,
      );
    }

    case "ADD_TIME": {
      const { player, milliseconds } = action.payload;
      const now = action.payload.now ?? Date.now();
      const newTimes = {
        ...state.times,
        [player]: state.times[player] + milliseconds,
      };
      // Reset timing so display interpolation restarts from the new base time.
      // When paused and modifying the active player's time, reset elapsedAtPause
      // so RESUME doesn't use a stale offset that ignores the time change.
      const resetElapsed =
        state.status === "paused" && player === state.activePlayer;
      return {
        ...state,
        times: newTimes,
        moveStartTime: state.status === "running" ? now : null,
        ...(resetElapsed && { elapsedAtPause: 0 }),
      };
    }

    case "SET_TIME": {
      const { player, milliseconds } = action.payload;
      const now = action.payload.now ?? Date.now();
      const newTimes = {
        ...state.times,
        [player]: Math.max(0, milliseconds),
      };
      // Reset timing so display interpolation restarts from the new base time.
      // When paused and modifying the active player's time, reset elapsedAtPause
      // so RESUME doesn't use a stale offset that ignores the time change.
      const resetElapsed =
        state.status === "paused" && player === state.activePlayer;
      return {
        ...state,
        times: newTimes,
        moveStartTime: state.status === "running" ? now : null,
        ...(resetElapsed && { elapsedAtPause: 0 }),
      };
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
  config: NormalizedTimeControl,
  periodState?: PeriodState,
  now?: number,
): ClockState {
  return {
    times: initialTimes,
    initialTimes,
    status,
    activePlayer,
    timeout: null,
    switchCount: 0,
    periodState,
    config,
    // If starting immediately, initialize the move start time
    moveStartTime: status === "running" ? (now ?? Date.now()) : null,
    elapsedAtPause: 0,
  };
}
