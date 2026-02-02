import { Root } from "./parts/Root";
import { Display } from "./parts/Display";
import { Switch } from "./parts/Switch";
import { PlayPause } from "./parts/PlayPause";
import { Reset } from "./parts/Reset";

/**
 * ChessClock compound components
 *
 * @example
 * ```tsx
 * import { ChessClock } from "@react-chess-tools/react-chess-clock";
 *
 * function ClockApp() {
 *   return (
 *     <ChessClock.Root timeControl={{ time: "5+3" }}>
 *       <ChessClock.Display color="black" />
 *       <ChessClock.Display color="white" />
 *       <ChessClock.Switch>Switch</ChessClock.Switch>
 *       <ChessClock.PlayPause
 *         startContent="Start"
 *         pauseContent="Pause"
 *         resumeContent="Resume"
 *       />
 *       <ChessClock.Reset>Reset</ChessClock.Reset>
 *     </ChessClock.Root>
 *   );
 * }
 * ```
 */
export const ChessClock = {
  Root,
  Display,
  Switch,
  PlayPause,
  Reset,
};

// Re-export types for convenience
export type { ChessClockRootProps } from "./parts/Root";
export type { ChessClockDisplayProps } from "./parts/Display";
export type { ChessClockControlProps } from "./parts/Switch";
export type { ChessClockPlayPauseProps } from "./parts/PlayPause";
export type { ChessClockResetProps } from "./parts/Reset";
