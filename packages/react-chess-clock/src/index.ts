// ============================================================================
// Components
// ============================================================================
export { ChessClock } from "./components/ChessClock";

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
} from "./utils/timeControl";

// ============================================================================
// Types
// ============================================================================
export type {
  // Time control types
  TimeControlString,
  SinglePeriodTimeControl,
  TimeControlInput,
  TimingMethod,
  ClockStartMode,
  TimeControlConfig,
  NormalizedTimeControl,
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
