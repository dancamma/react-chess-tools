import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import type {
  ClockColor,
  ClockInfo,
  ClockMethods,
  ClockTimes,
  NormalizedTimeControl,
  PeriodState,
  TimeControlConfig,
  TimeControlInput,
  UseChessClockReturn,
} from "../types";
import { parseTimeControlConfig, getInitialTimes } from "../utils/timeControl";
import { formatClockTime } from "../utils/formatTime";
import { calculateSwitchTime } from "../utils/calculateSwitchTime";
import {
  getInitialActivePlayer,
  getInitialStatus,
} from "../utils/timingMethods";
import { clockReducer, createInitialClockState } from "./clockReducer";

/** Default config used internally when clock is disabled */
const DISABLED_CLOCK_CONFIG: TimeControlConfig = {
  time: { baseTime: 0 },
};

function calculateDisplayTime(
  baseTime: number,
  moveStartTime: number | null,
  elapsedAtPause: number,
  timingMethod: string,
  delay: number,
): number {
  // When paused, use the elapsed time stored at pause moment
  if (moveStartTime === null) {
    let effectiveElapsed = elapsedAtPause;
    if (timingMethod === "delay") {
      effectiveElapsed = Math.max(0, elapsedAtPause - delay);
    }
    return Math.max(0, baseTime - effectiveElapsed);
  }

  const now = Date.now();
  const rawElapsed = now - moveStartTime;

  // Apply delay method: time doesn't decrement during delay period
  let effectiveElapsed = rawElapsed;
  if (timingMethod === "delay") {
    effectiveElapsed = Math.max(0, rawElapsed - delay);
  }

  return Math.max(0, baseTime - effectiveElapsed);
}

/**
 * Main hook for chess clock state management.
 * Provides timing functionality for chess games with various timing methods.
 *
 * For server-authoritative clocks, use `methods.setTime()` to sync server times.
 * The clock will restart its display interpolation from the new value on each call.
 *
 * @param options - Clock configuration options
 * @returns Clock state, info, and methods
 */
export function useChessClock(options: TimeControlConfig): UseChessClockReturn {
  // Parse and normalize time control configuration
  // Note: Not memoized - parseTimeControlConfig is lightweight and options is
  // typically passed inline (e.g., useChessClock({ time: "5+3" }))
  const initialConfig: NormalizedTimeControl = parseTimeControlConfig(options);

  // Get initial times
  const initialTimesValue = getInitialTimes(initialConfig);

  // Initialize period state for multi-period time controls
  const initialPeriodState: PeriodState | undefined =
    initialConfig.periods && initialConfig.periods.length > 1
      ? {
          periodIndex: { white: 0, black: 0 },
          periodMoves: { white: 0, black: 0 },
          periods: initialConfig.periods,
        }
      : undefined;

  // Initialize reducer with computed initial state
  const [state, dispatch] = useReducer(clockReducer, null, () =>
    createInitialClockState(
      initialTimesValue,
      getInitialStatus(initialConfig.clockStart),
      getInitialActivePlayer(initialConfig.clockStart),
      initialConfig,
      initialPeriodState,
    ),
  );

  // Options ref for callbacks (avoid stale closures)
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // State ref for callbacks (avoid stale closures)
  const stateRef = useRef(state);
  stateRef.current = state;

  // ============================================================================
  // DISPLAY STATE
  // ============================================================================

  // Tick counter for triggering re-renders when clock is running
  const [tick, forceUpdate] = useState(0);

  // Display times derived during render (no useMemo — state values change frequently)
  const displayTimes: ClockTimes =
    state.activePlayer === null
      ? state.times
      : {
          ...state.times,
          [state.activePlayer]: calculateDisplayTime(
            state.times[state.activePlayer],
            state.moveStartTime,
            state.elapsedAtPause,
            state.config.timingMethod,
            state.config.delay,
          ),
        };

  // Derive primitive for timeout detection (prevents effect running on every render)
  const activePlayerTimedOut =
    state.status === "running" &&
    state.activePlayer !== null &&
    displayTimes[state.activePlayer] <= 0;

  // ============================================================================
  // DISPLAY UPDATE LOOP (100ms interval)
  // ============================================================================

  useEffect(() => {
    if (state.status !== "running" || state.activePlayer === null) {
      return;
    }

    const intervalId = setInterval(() => forceUpdate((c) => c + 1), 100);

    return () => clearInterval(intervalId);
  }, [state.status, state.activePlayer]);

  // Notify consumer of time updates (only on clock ticks, not on every render)
  useEffect(() => {
    if (state.status === "running" && state.activePlayer !== null) {
      optionsRef.current.onTimeUpdate?.(displayTimes);
    }
  }, [tick]);

  // Timeout Detection
  useEffect(() => {
    if (activePlayerTimedOut && state.activePlayer !== null) {
      dispatch({ type: "TIMEOUT", payload: { player: state.activePlayer } });
      optionsRef.current.onTimeout?.(state.activePlayer);
    }
  }, [activePlayerTimedOut, state.activePlayer]);

  // Active Player Change Callback
  const previousActivePlayerRef = useRef(state.activePlayer);
  useEffect(() => {
    if (
      state.activePlayer !== previousActivePlayerRef.current &&
      state.activePlayer !== null
    ) {
      optionsRef.current.onSwitch?.(state.activePlayer);
    }
    previousActivePlayerRef.current = state.activePlayer;
  }, [state.activePlayer]);

  // ============================================================================
  // COMPUTED INFO
  // ============================================================================

  const info = useMemo<ClockInfo>(
    () => ({
      isRunning: state.status === "running",
      isPaused: state.status === "paused",
      isFinished: state.status === "finished",
      isWhiteActive: state.activePlayer === "white",
      isBlackActive: state.activePlayer === "black",
      hasTimeout: state.timeout !== null,
      // Time odds is based on initial configuration, not current remaining time
      hasTimeOdds: state.initialTimes.white !== state.initialTimes.black,
    }),
    [
      state.status,
      state.activePlayer,
      state.timeout,
      state.initialTimes.white,
      state.initialTimes.black,
    ],
  );

  // ============================================================================
  // METHODS
  // ============================================================================

  const start = useCallback(() => {
    dispatch({ type: "START", payload: { now: Date.now() } });
  }, []);

  const pause = useCallback(() => {
    dispatch({ type: "PAUSE", payload: { now: Date.now() } });
  }, []);

  const resume = useCallback(() => {
    dispatch({ type: "RESUME", payload: { now: Date.now() } });
  }, []);

  const switchPlayer = useCallback(() => {
    const currentState = stateRef.current;
    const now = Date.now();

    // Calculate time adjustment for current player (not in delayed mode)
    let newTimes: ClockTimes | undefined;
    if (
      currentState.status !== "delayed" &&
      currentState.activePlayer &&
      currentState.moveStartTime !== null
    ) {
      const timeSpent = now - currentState.moveStartTime;
      const currentTime = currentState.times[currentState.activePlayer];

      const newTime = calculateSwitchTime(
        currentTime,
        timeSpent,
        currentState.config,
      );

      newTimes = {
        ...currentState.times,
        [currentState.activePlayer]: newTime,
      };
    }

    dispatch({ type: "SWITCH", payload: { newTimes, now } });
  }, []);

  const reset = useCallback((newTimeControl?: TimeControlInput) => {
    // Build the full config for the reducer
    const currentOptions = optionsRef.current;
    const resetConfig: TimeControlConfig = newTimeControl
      ? { ...currentOptions, time: newTimeControl }
      : currentOptions;

    // The reducer will parse the config, update state.config, and reset timing state
    dispatch({ type: "RESET", payload: resetConfig });
  }, []);

  const addTime = useCallback((player: ClockColor, milliseconds: number) => {
    dispatch({
      type: "ADD_TIME",
      payload: { player, milliseconds, now: Date.now() },
    });
    // Note: when adding time while clock is running, we update the base time
    // but moveStartTime stays the same, so the display interpolates correctly
  }, []);

  const setTime = useCallback((player: ClockColor, milliseconds: number) => {
    dispatch({
      type: "SET_TIME",
      payload: { player, milliseconds, now: Date.now() },
    });
    // Note: when setting time while clock is running, we update the base time
    // but moveStartTime stays the same, so the display interpolates correctly
  }, []);

  // Memoize methods
  const methods = useMemo<ClockMethods>(
    () => ({
      start,
      pause,
      resume,
      switch: switchPlayer,
      reset,
      addTime,
      setTime,
    }),
    [start, pause, resume, switchPlayer, reset, addTime, setTime],
  );

  // Computed period information
  const periodInfo = useMemo(() => {
    if (!state.periodState) {
      // Single period: return defaults
      return {
        currentPeriodIndex: { white: 0, black: 0 },
        totalPeriods: 1,
        currentPeriod: {
          white: {
            baseTime: state.config.baseTime / 1000,
            increment: state.config.increment / 1000,
            delay: state.config.delay / 1000,
          },
          black: {
            baseTime: state.config.baseTime / 1000,
            increment: state.config.increment / 1000,
            delay: state.config.delay / 1000,
          },
        },
        periodMoves: { white: 0, black: 0 },
      };
    }

    // Get current period for each player (with bounds checking)
    // Convert from internal milliseconds back to seconds for public API
    const periods = state.periodState.periods;
    const getCurrentPeriod = (periodIndex: number) => {
      const period =
        periodIndex >= 0 && periodIndex < periods.length
          ? periods[periodIndex]
          : periods[0];
      return {
        ...period,
        baseTime: period.baseTime / 1000,
        increment:
          period.increment !== undefined ? period.increment / 1000 : undefined,
        delay: period.delay !== undefined ? period.delay / 1000 : undefined,
      };
    };

    return {
      currentPeriodIndex: state.periodState.periodIndex,
      totalPeriods: periods.length,
      currentPeriod: {
        white: getCurrentPeriod(state.periodState.periodIndex.white),
        black: getCurrentPeriod(state.periodState.periodIndex.black),
      },
      periodMoves: state.periodState.periodMoves,
    };
  }, [state.periodState, state.config]);

  return {
    times: displayTimes,
    initialTimes: state.initialTimes,
    status: state.status,
    activePlayer: state.activePlayer,
    timeout: state.timeout,
    timingMethod: state.config.timingMethod,
    info,
    ...periodInfo,
    methods,
  };
}

/**
 * Optional chess clock hook for cases where clock may not be needed
 * Maintains hook order by always calling the implementation internally
 *
 * @param options - Clock configuration options, or undefined to disable
 * @returns Clock state, info, and methods, or null if disabled
 */
export function useOptionalChessClock(
  options?: TimeControlConfig,
): ReturnType<typeof useChessClock> | null {
  // Always call useChessClock to maintain hook order
  const result = useChessClock(options ?? DISABLED_CLOCK_CONFIG);

  return options === undefined ? null : result;
}

/**
 * Export the format function for convenience
 */
export { formatClockTime };
