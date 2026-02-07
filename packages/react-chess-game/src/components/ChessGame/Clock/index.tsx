import React from "react";
import { useChessGameContext } from "../../../hooks/useChessGameContext";
import {
  Display as ClockDisplay,
  Switch as ClockSwitch,
  PlayPause as ClockPlayPause,
  Reset as ClockReset,
  ChessClockContext,
} from "@react-chess-tools/react-chess-clock";
import type {
  ChessClockDisplayProps,
  ChessClockControlProps,
  ChessClockPlayPauseProps,
  ChessClockResetProps,
  ClockColor,
} from "@react-chess-tools/react-chess-clock";

export type {
  ChessClockDisplayProps,
  ChessClockControlProps,
  ChessClockPlayPauseProps,
  ChessClockResetProps,
  ClockColor,
} from "@react-chess-tools/react-chess-clock";

export interface ClockDisplayProps extends Omit<
  ChessClockDisplayProps,
  "color"
> {
  color: ClockColor;
}

/**
 * ChessGame.Clock.Display - Autonomous display component
 *
 * Wraps react-chess-clock's Display component, providing clock state from ChessGame.Root context.
 * No need to pass timeControl - it's inherited from the root.
 *
 * @example
 * ```tsx
 * <ChessGame.Root timeControl={{ time: "5+3" }}>
 *   <ChessGame.Clock.Display color="white" />
 *   <ChessGame.Board />
 *   <ChessGame.Clock.Display color="black" />
 * </ChessGame.Root>
 * ```
 */
export const Display = React.forwardRef<HTMLDivElement, ClockDisplayProps>(
  ({ color, ...rest }, ref) => {
    const { clock } = useChessGameContext();

    if (!clock) {
      console.warn(
        "ChessGame.Clock.Display used without timeControl in ChessGame.Root",
      );
      return null;
    }

    return (
      <ChessClockContext.Provider value={clock}>
        <ClockDisplay ref={ref} color={color} {...rest} />
      </ChessClockContext.Provider>
    );
  },
);

Display.displayName = "ChessGame.Clock.Display";

/**
 * ChessGame.Clock.Switch - Manual switch control
 *
 * Wraps react-chess-clock's Switch component, providing clock state from ChessGame.Root context.
 *
 * @example
 * ```tsx
 * <ChessGame.Root timeControl={{ time: "5+3" }}>
 *   <ChessGame.Clock.Switch>Switch Clock</ChessGame.Clock.Switch>
 * </ChessGame.Root>
 * ```
 */
export const Switch = React.forwardRef<
  HTMLElement,
  React.PropsWithChildren<ChessClockControlProps>
>(({ children, ...rest }, ref) => {
  const { clock } = useChessGameContext();

  if (!clock) {
    console.warn(
      "ChessGame.Clock.Switch used without timeControl in ChessGame.Root",
    );
    return null;
  }

  return (
    <ChessClockContext.Provider value={clock}>
      <ClockSwitch ref={ref} {...rest}>
        {children}
      </ClockSwitch>
    </ChessClockContext.Provider>
  );
});

Switch.displayName = "ChessGame.Clock.Switch";

/**
 * ChessGame.Clock.PlayPause - Play/pause control
 *
 * Wraps react-chess-clock's PlayPause component, providing clock state from ChessGame.Root context.
 *
 * @example
 * ```tsx
 * <ChessGame.Root timeControl={{ time: "5+3" }}>
 *   <ChessGame.Clock.PlayPause
 *     startContent="Start"
 *     pauseContent="Pause"
 *     resumeContent="Resume"
 *   />
 * </ChessGame.Root>
 * ```
 */
export const PlayPause = React.forwardRef<
  HTMLElement,
  React.PropsWithChildren<ChessClockPlayPauseProps>
>(({ children, ...rest }, ref) => {
  const { clock } = useChessGameContext();

  if (!clock) {
    console.warn(
      "ChessGame.Clock.PlayPause used without timeControl in ChessGame.Root",
    );
    return null;
  }

  return (
    <ChessClockContext.Provider value={clock}>
      <ClockPlayPause ref={ref} {...rest}>
        {children}
      </ClockPlayPause>
    </ChessClockContext.Provider>
  );
});

PlayPause.displayName = "ChessGame.Clock.PlayPause";

/**
 * ChessGame.Clock.Reset - Reset control
 *
 * Wraps react-chess-clock's Reset component, providing clock state from ChessGame.Root context.
 *
 * @example
 * ```tsx
 * <ChessGame.Root timeControl={{ time: "5+3" }}>
 *   <ChessGame.Clock.Reset>Reset</ChessGame.Clock.Reset>
 * </ChessGame.Root>
 * ```
 */
export const Reset = React.forwardRef<
  HTMLElement,
  React.PropsWithChildren<ChessClockResetProps>
>(({ children, ...rest }, ref) => {
  const { clock } = useChessGameContext();

  if (!clock) {
    console.warn(
      "ChessGame.Clock.Reset used without timeControl in ChessGame.Root",
    );
    return null;
  }

  return (
    <ChessClockContext.Provider value={clock}>
      <ClockReset ref={ref} {...rest}>
        {children}
      </ClockReset>
    </ChessClockContext.Provider>
  );
});

Reset.displayName = "ChessGame.Clock.Reset";

export const Clock = {
  Display,
  Switch,
  PlayPause,
  Reset,
};
