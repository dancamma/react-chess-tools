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
  TimeControlConfig,
  TimeControlInput,
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

/**
 * Timing refs track elapsed time without triggering React re-renders.
 *
 * Chess clocks need millisecond-precision timing for smooth countdown display.
 * Using React state for timing would cause re-renders on every "tick", degrading
 * performance. Refs provide mutable storage that persists across renders.
 *
 * Key concept: Display time is calculated as `baseTime - elapsed`, where `elapsed`
 * is derived from these refs combined with the current timestamp.
 */
interface TimingRefs {
  /**
   * Timestamp (ms since epoch) when the current player's move started.
   * Used to calculate elapsed time as `Date.now() - moveStartTime`.
   * Set to null when the clock hasn't started yet.
   */
  moveStartTime: number | null;

  /**
   * When the clock is paused, this stores the elapsed time (in ms) at the
   * moment of pause. This allows resuming without "losing" the paused time.
   *
   * On resume, moveStartTime is adjusted backward by this amount so the
   * elapsed calculation continues seamlessly.
   */
  elapsedAtPause: number;
}

/** Creates a fresh TimingRefs object with initial values. Used on clock reset. */
function createTimingRefs(): TimingRefs {
  return {
    moveStartTime: null,
    elapsedAtPause: 0,
  };
}

function calculateDisplayTime(
  baseTime: number,
  moveStartTime: number | null,
  elapsedAtPause: number,
  isPaused: boolean,
  timingMethod: string,
  delay: number,
): number {
  if (moveStartTime === null) return baseTime;

  const now = Date.now();
  const rawElapsed = isPaused ? elapsedAtPause : now - moveStartTime;

  // Apply delay method: time doesn't decrement during delay period
  let effectiveElapsed = rawElapsed;
  if (timingMethod === "delay") {
    effectiveElapsed = Math.max(0, rawElapsed - delay);
  }

  return Math.max(0, baseTime - effectiveElapsed);
}

/**
 * Main hook for chess clock state management
 * Provides timing functionality for chess games with various timing methods
 *
 * @param options - Clock configuration options
 * @returns Clock state, info, and methods
 */
export function useChessClock(options: TimeControlConfig) {
  // Parse and normalize time control configuration
  const config = useMemo<NormalizedTimeControl>(
    () => parseTimeControlConfig(options),
    [options],
  );

  // Get initial times
  const initialTimesValue = useMemo(() => getInitialTimes(config), [config]);

  // Initialize reducer with computed initial state
  const [state, dispatch] = useReducer(clockReducer, null, () =>
    createInitialClockState(
      initialTimesValue,
      getInitialStatus(config.clockStart),
      getInitialActivePlayer(config.clockStart),
    ),
  );

  // Timing refs stored in a single ref object to track elapsed time without triggering re-renders.
  // Display updates every 100ms for smooth-enough animation.
  const timing = useRef<TimingRefs>(createTimingRefs());

  // Display times - local state for periodic updates, synced with times in state
  const [displayTimes, setDisplayTimes] =
    useState<ClockTimes>(initialTimesValue);

  // Options ref for callbacks (avoid stale closures)
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Sync display times with state times when they change (e.g., after SWITCH, ADD_TIME, etc.)
  useEffect(() => {
    setDisplayTimes(state.times);
  }, [state.times]);

  // Initialize move start time when clock starts
  useEffect(() => {
    if (
      state.status === "running" &&
      state.activePlayer !== null &&
      timing.current.moveStartTime === null
    ) {
      timing.current.moveStartTime = Date.now();
    }
  }, [state.status, state.activePlayer]);

  // Pause/Resume Handling (adjust timing refs)
  const prevStatusRef = useRef(state.status);
  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = state.status;

    if (prevStatus === "running" && state.status === "paused") {
      // Pausing: store elapsed time
      if (timing.current.moveStartTime !== null) {
        timing.current.elapsedAtPause =
          Date.now() - timing.current.moveStartTime;
      }
    } else if (prevStatus === "paused" && state.status === "running") {
      // Resuming: reset start time based on stored elapsed
      timing.current.moveStartTime = Date.now() - timing.current.elapsedAtPause;
    }
  }, [state.status]);

  // Display Update Loop (100ms interval)
  useEffect(() => {
    if (state.status !== "running" || state.activePlayer === null) {
      return;
    }

    function tick() {
      const currentTime = calculateDisplayTime(
        state.times[state.activePlayer!],
        timing.current.moveStartTime,
        timing.current.elapsedAtPause,
        false,
        config.timingMethod,
        config.delay,
      );

      const newDisplayTimes = {
        ...state.times,
        [state.activePlayer!]: currentTime,
      };

      setDisplayTimes(newDisplayTimes);
      optionsRef.current.onTimeUpdate?.(newDisplayTimes);
    }

    const intervalId = setInterval(tick, 100);
    return () => clearInterval(intervalId);
  }, [
    state.status,
    state.activePlayer,
    state.times,
    config.timingMethod,
    config.delay,
  ]);

  // Timeout Detection
  useEffect(() => {
    if (
      state.status === "running" &&
      state.activePlayer !== null &&
      displayTimes[state.activePlayer] <= 0
    ) {
      dispatch({ type: "TIMEOUT", payload: { player: state.activePlayer } });
      optionsRef.current.onTimeout?.(state.activePlayer);
    }
  }, [state.status, state.activePlayer, displayTimes]);

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

  // Computed Info
  const info = useMemo<ClockInfo>(
    () => ({
      isRunning: state.status === "running",
      isPaused: state.status === "paused",
      isFinished: state.status === "finished",
      isWhiteActive: state.activePlayer === "white",
      isBlackActive: state.activePlayer === "black",
      hasTimeout: state.timeout !== null,
      hasTimeOdds: state.initialTimes.white !== state.initialTimes.black,
    }),
    [state.status, state.activePlayer, state.timeout, state.initialTimes],
  );

  // Methods
  const start = useCallback(() => {
    if (state.status === "finished") return;

    if (timing.current.moveStartTime === null) {
      timing.current.moveStartTime = Date.now();
    }

    dispatch({ type: "START" });
  }, [state.status]);

  const pause = useCallback(() => {
    dispatch({ type: "PAUSE" });
  }, []);

  const resume = useCallback(() => {
    dispatch({ type: "RESUME" });
  }, []);

  const switchPlayer = useCallback(() => {
    const now = Date.now();

    // Calculate time adjustment for current player (only when not in delayed mode)
    let newTimes: ClockTimes | undefined;
    if (
      state.status !== "delayed" &&
      state.activePlayer &&
      timing.current.moveStartTime !== null
    ) {
      const timeSpent = now - timing.current.moveStartTime;
      const currentTime = state.times[state.activePlayer];

      const newTime = calculateSwitchTime(currentTime, timeSpent, config);

      newTimes = { ...state.times, [state.activePlayer]: newTime };
      optionsRef.current.onTimeUpdate?.(newTimes);

      // Reset timing for next player
      timing.current.moveStartTime = now;
      timing.current.elapsedAtPause = 0;
    }

    dispatch({ type: "SWITCH", payload: { newTimes } });
  }, [state.status, state.activePlayer, state.times, config]);

  const reset = useCallback(
    (newTimeControl?: TimeControlInput) => {
      const newConfig = newTimeControl
        ? parseTimeControlConfig({ ...options, time: newTimeControl })
        : config;

      const newInitialTimes = getInitialTimes(newConfig);

      // Reset timing refs
      timing.current = createTimingRefs();

      dispatch({
        type: "RESET",
        payload: {
          initialTimes: newInitialTimes,
          status: getInitialStatus(newConfig.clockStart),
          activePlayer: getInitialActivePlayer(newConfig.clockStart),
        },
      });
    },
    [config, options],
  );

  const addTime = useCallback((player: ClockColor, milliseconds: number) => {
    dispatch({ type: "ADD_TIME", payload: { player, milliseconds } });
  }, []);

  const setTime = useCallback((player: ClockColor, milliseconds: number) => {
    dispatch({ type: "SET_TIME", payload: { player, milliseconds } });
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

  return {
    times: displayTimes,
    initialTimes: state.initialTimes,
    status: state.status,
    activePlayer: state.activePlayer,
    timeout: state.timeout,
    timingMethod: config.timingMethod,
    info,
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
