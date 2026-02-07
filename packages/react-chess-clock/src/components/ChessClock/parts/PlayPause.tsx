import React from "react";
import type { ReactNode } from "react";
import { Slot } from "@radix-ui/react-slot";
import { useChessClockContext } from "../../../hooks/useChessClockContext";

// Default content for each clock state
const DEFAULT_CONTENT = {
  start: "Start",
  pause: "Pause",
  resume: "Resume",
  delayed: "Start",
  finished: "Game Over",
} as const;

export interface ChessClockPlayPauseProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick"
> {
  asChild?: boolean;
  children?: ReactNode;
  onClick?: React.MouseEventHandler<HTMLElement>;
  /** Content shown when clock is idle (not yet started) - clicking will start the clock */
  startContent?: ReactNode;
  /** Content shown when clock is running - clicking will pause */
  pauseContent?: ReactNode;
  /** Content shown when clock is paused - clicking will resume */
  resumeContent?: ReactNode;
  /** Content shown when clock is in delayed mode - clicking will start the clock immediately */
  delayedContent?: ReactNode;
  /** Content shown when clock is finished - button is disabled but shows this content */
  finishedContent?: ReactNode;
}

/**
 * ChessClock.PlayPause - Button to start, pause, and resume the clock
 *
 * Supports the asChild pattern and conditional content based on clock state.
 * When no children or custom content is provided, sensible defaults are used for each state.
 *
 * @example
 * ```tsx
 * // With children (backward compatible)
 * <ChessClock.PlayPause>
 *   <span>Toggle</span>
 * </ChessClock.PlayPause>
 *
 * // No props - uses defaults for all states
 * <ChessClock.PlayPause />
 * // Shows: "Start" → "Pause" → "Resume" → "Game Over"
 *
 * // Override just one state, others use defaults
 * <ChessClock.PlayPause pauseContent="⏸️ Stop" />
 * // Shows: "Start" → "⏸️ Stop" → "Resume" → "Game Over"
 *
 * // As child
 * <ChessClock.PlayPause asChild>
 *   <div className="custom-button">Toggle</div>
 * </ChessClock.PlayPause>
 * ```
 */
export const PlayPause = React.forwardRef<
  HTMLElement,
  React.PropsWithChildren<ChessClockPlayPauseProps>
>(
  (
    {
      asChild = false,
      startContent,
      pauseContent,
      resumeContent,
      delayedContent,
      finishedContent,
      children,
      onClick,
      disabled,
      className,
      style,
      type,
      ...rest
    },
    ref,
  ) => {
    const { status, methods } = useChessClockContext();
    const isIdle = status === "idle";
    const isDelayed = status === "delayed";
    const isPaused = status === "paused";
    const isRunning = status === "running";
    const isFinished = status === "finished";

    // Treat "delayed" like "idle" - clock hasn't started yet
    const shouldShowStart = isIdle || isDelayed;

    const isDisabled = disabled || isFinished || isDelayed;

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLElement>) => {
        if (shouldShowStart) {
          methods.start();
        } else if (isPaused) {
          methods.resume();
        } else if (isRunning) {
          methods.pause();
        }
        onClick?.(e);
      },
      [shouldShowStart, isPaused, isRunning, methods, onClick],
    );

    // Determine if any custom content is provided
    const hasCustomContent =
      startContent !== undefined ||
      pauseContent !== undefined ||
      resumeContent !== undefined ||
      delayedContent !== undefined ||
      finishedContent !== undefined;

    // Determine content to render
    // Priority: children > custom+defaults > all defaults
    let content: ReactNode;
    if (children) {
      // Children take precedence (backward compatibility)
      content = children;
    } else if (hasCustomContent) {
      // Use custom content with defaults for unspecified states
      if (isFinished) {
        content = finishedContent ?? DEFAULT_CONTENT.finished;
      } else if (isDelayed) {
        content = delayedContent ?? DEFAULT_CONTENT.delayed;
      } else if (shouldShowStart) {
        content = startContent ?? DEFAULT_CONTENT.start;
      } else if (isPaused) {
        content = resumeContent ?? DEFAULT_CONTENT.resume;
      } else if (isRunning) {
        content = pauseContent ?? DEFAULT_CONTENT.pause;
      } else {
        content = DEFAULT_CONTENT.start;
      }
    } else {
      // Use all defaults
      if (isFinished) {
        content = DEFAULT_CONTENT.finished;
      } else if (isDelayed) {
        content = DEFAULT_CONTENT.delayed;
      } else if (shouldShowStart) {
        content = DEFAULT_CONTENT.start;
      } else if (isPaused) {
        content = DEFAULT_CONTENT.resume;
      } else if (isRunning) {
        content = DEFAULT_CONTENT.pause;
      } else {
        content = DEFAULT_CONTENT.start;
      }
    }

    return asChild ? (
      <Slot
        ref={ref}
        onClick={handleClick}
        className={className}
        style={style}
        {...rest}
      >
        {content}
      </Slot>
    ) : (
      <button
        ref={ref as React.RefObject<HTMLButtonElement>}
        type={type || "button"}
        className={className}
        style={style}
        onClick={handleClick}
        disabled={isDisabled}
        {...rest}
      >
        {content}
      </button>
    );
  },
);

PlayPause.displayName = "ChessClock.PlayPause";
