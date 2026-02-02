// ============================================================================
// Time Control Types
// ============================================================================

/**
 * String notation for time controls
 * Examples: "5+3" (5 minutes, 3 second increment), "10" (10 minutes, no increment)
 */
export type TimeControlString = `${number}+${number}` | `${number}`;

/**
 * Single period time control configuration
 * Used for standalone games or the final period of tournament controls
 */
export interface SinglePeriodTimeControl {
  /** Base time in seconds */
  baseTime: number;
  /** Increment in seconds (default: 0) */
  increment?: number;
  /** Delay in seconds (for delay timing methods) */
  delay?: number;
}

/**
 * Time control input - accepts string notation or object configuration
 */
export type TimeControlInput = TimeControlString | SinglePeriodTimeControl;

/**
 * Clock timing method
 * - "fischer": Standard increment - adds time after each move
 * - "delay": Simple delay - countdown waits before decrementing
 * - "bronstein": Bronstein delay - adds back actual time used up to delay amount
 */
export type TimingMethod = "fischer" | "delay" | "bronstein";

/**
 * Clock start behavior
 * - "delayed": Clock starts after Black's first move (Lichess-style)
 * - "immediate": White's clock starts immediately (Chess.com-style)
 * - "manual": Clock starts only when user explicitly calls start()
 */
export type ClockStartMode = "delayed" | "immediate" | "manual";

/**
 * Clock status
 */
export type ClockStatus =
  | "idle"
  | "delayed"
  | "running"
  | "paused"
  | "finished";

/**
 * Player color
 */
export type ClockColor = "white" | "black";

/**
 * Time control configuration
 */
export interface TimeControlConfig {
  /** Time specification (required) */
  time: TimeControlInput;
  /** Override starting time for white (seconds) - for time odds */
  whiteTime?: number;
  /** Override starting time for black (seconds) - for time odds */
  blackTime?: number;
  /** Timing method (default: 'fischer') */
  timingMethod?: TimingMethod;
  /** Clock start behavior (default: 'delayed') */
  clockStart?: ClockStartMode;
  /** Callback when a player's time runs out */
  onTimeout?: (loser: ClockColor) => void;
  /** Callback when active player switches */
  onSwitch?: (activePlayer: ClockColor) => void;
  /** Callback on each time update */
  onTimeUpdate?: (times: { white: number; black: number }) => void;
}

/**
 * Normalized time control (internal use)
 */
export interface NormalizedTimeControl {
  baseTime: number; // milliseconds
  increment: number; // milliseconds
  delay: number; // milliseconds
  timingMethod: TimingMethod;
  clockStart: ClockStartMode;
  whiteTimeOverride?: number; // milliseconds
  blackTimeOverride?: number; // milliseconds
}

// ============================================================================
// Clock State Types
// ============================================================================

/**
 * Clock times state (used for both current and initial times)
 */
export interface ClockTimes {
  white: number; // milliseconds
  black: number; // milliseconds
}

/**
 * Computed clock info
 */
export interface ClockInfo {
  isRunning: boolean;
  isPaused: boolean;
  isFinished: boolean;
  isWhiteActive: boolean;
  isBlackActive: boolean;
  hasTimeout: boolean;
  hasTimeOdds: boolean;
}

/**
 * Clock methods
 */
export interface ClockMethods {
  start: () => void;
  pause: () => void;
  resume: () => void;
  switch: () => void;
  reset: (timeControl?: TimeControlInput) => void;
  addTime: (player: ClockColor, milliseconds: number) => void;
  setTime: (player: ClockColor, milliseconds: number) => void;
}

/**
 * Complete clock state return type
 */
export interface UseChessClockReturn {
  // Time values (milliseconds)
  times: ClockTimes;
  initialTimes: ClockTimes;

  // Status
  status: ClockStatus;
  activePlayer: ClockColor | null;
  timeout: ClockColor | null;

  // Configuration
  timingMethod: TimingMethod;

  // Computed
  info: ClockInfo;

  // Methods
  methods: ClockMethods;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Time format options
 */
export type TimeFormat = "auto" | "mm:ss" | "ss.d" | "hh:mm:ss";

/**
 * Timing method result
 */
export interface TimingMethodResult {
  newTime: number; // milliseconds
  delayRemaining: number; // milliseconds (for delay methods)
}
