import React from "react";
import type { ClockColor } from "../../../types";
import { useChessClockContext } from "../../../hooks/useChessClockContext";
import { formatClockTime } from "../../../utils/formatTime";

export interface ChessClockDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  color: ClockColor;
  format?: "auto" | "mm:ss" | "ss.d" | "hh:mm:ss";
  formatTime?: (milliseconds: number) => string;
}

/**
 * ChessClock.Display - Displays the current time for a player
 *
 * Renders an unstyled div with data attributes for custom styling.
 *
 * @example
 * ```tsx
 * <ChessClock.Display color="white" format="auto" />
 * <ChessClock.Display color="black" format="ss.d" />
 * <ChessClock.Display
 *   color="white"
 *   formatTime={(ms) => `${Math.ceil(ms / 1000)}s`}
 * />
 * ```
 */
export const Display = React.forwardRef<HTMLDivElement, ChessClockDisplayProps>(
  (
    {
      color,
      format = "auto",
      formatTime: customFormatTime,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const { times, activePlayer, status, timeout } = useChessClockContext();

    const time = times[color];
    const isActive = activePlayer === color;
    const hasTimeout = timeout === color;
    const isPaused = status === "paused";

    // Format the time for display
    const formattedTime = customFormatTime
      ? customFormatTime(time)
      : formatClockTime(time, format);

    return (
      <div
        ref={ref}
        className={className}
        style={style}
        data-clock-color={color}
        data-clock-active={isActive ? "true" : "false"}
        data-clock-paused={isPaused ? "true" : "false"}
        data-clock-timeout={hasTimeout ? "true" : "false"}
        data-clock-status={status}
        {...rest}
      >
        {formattedTime}
      </div>
    );
  },
);

Display.displayName = "ChessClock.Display";
