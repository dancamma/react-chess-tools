// ============================================================================
// Components
// ============================================================================
export { ChessClock } from "./components/ChessClock";
export { Display } from "./components/ChessClock/parts/Display";
export { Switch } from "./components/ChessClock/parts/Switch";
export { PlayPause } from "./components/ChessClock/parts/PlayPause";
export { Reset } from "./components/ChessClock/parts/Reset";

// ============================================================================
// Hooks
// ============================================================================
export { useChessClock, useOptionalChessClock } from "./hooks/useChessClock";
export {
  useChessClockContext,
  ChessClockContext,
} from "./hooks/useChessClockContext";

// ============================================================================
// Utilities
// ============================================================================
export { formatClockTime } from "./utils/formatTime";
export {
  parseTimeControlString,
  normalizeTimeControl,
  parseTimeControlConfig,
  getInitialTimes,
  parseMultiPeriodTimeControl,
} from "./utils/timeControl";
export { presets } from "./utils/presets";

// ============================================================================
// Types
// ============================================================================
export type {
  // Time control types
  TimeControlString,
  TimeControl,
  TimeControlPhase,
  TimeControlInput,
  TimingMethod,
  ClockStartMode,
  TimeControlConfig,
  NormalizedTimeControl,
  PeriodState,
  // State types
  ClockStatus,
  ClockColor,
  ClockTimes,
  ClockInfo,
  ClockMethods,
  UseChessClockReturn,
  // Utility types
  TimeFormat,
  TimingMethodResult,
} from "./types";

// Component prop types are exported via the ChessClock component
export type {
  ChessClockRootProps,
  ChessClockDisplayProps,
  ChessClockControlProps,
  ChessClockPlayPauseProps,
  ChessClockResetProps,
} from "./components/ChessClock";
