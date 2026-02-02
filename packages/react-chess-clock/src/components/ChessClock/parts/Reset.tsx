import React from "react";
import type { ReactNode } from "react";
import { Slot } from "@radix-ui/react-slot";
import { useChessClockContext } from "../../../hooks/useChessClockContext";
import type { TimeControlInput } from "../../../types";

export interface ChessClockResetProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick"
> {
  asChild?: boolean;
  children?: ReactNode;
  onClick?: React.MouseEventHandler<HTMLElement>;
  timeControl?: TimeControlInput;
}

/**
 * ChessClock.Reset - Button to reset the clock
 *
 * Supports the asChild pattern and optional new time control on reset.
 *
 * @example
 * ```tsx
 * <ChessClock.Reset>Reset</ChessClock.Reset>
 *
 * // Reset with new time control
 * <ChessClock.Reset timeControl="10+5">Change to 10+5</ChessClock.Reset>
 *
 * // As child
 * <ChessClock.Reset asChild>
 *   <div className="custom-reset">Reset</div>
 * </ChessClock.Reset>
 * ```
 */
export const Reset = React.forwardRef<
  HTMLElement,
  React.PropsWithChildren<ChessClockResetProps>
>(
  (
    {
      asChild = false,
      timeControl,
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
    const { methods, status } = useChessClockContext();
    const isDisabled = disabled || status === "idle";

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLElement>) => {
        methods.reset(timeControl);
        onClick?.(e);
      },
      [methods, timeControl, onClick],
    );

    return asChild ? (
      <Slot
        ref={ref}
        onClick={handleClick}
        className={className}
        style={style}
        {...rest}
      >
        {children}
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
        {children}
      </button>
    );
  },
);

Reset.displayName = "ChessClock.Reset";
