import React from "react";
import type { ReactNode } from "react";
import { Slot } from "@radix-ui/react-slot";
import { useChessClockContext } from "../../../hooks/useChessClockContext";

export interface ChessClockControlProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick"
> {
  asChild?: boolean;
  children?: ReactNode;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

/**
 * ChessClock.Switch - Button to manually switch the active clock
 *
 * Supports the asChild pattern for custom rendering.
 *
 * @example
 * ```tsx
 * <ChessClock.Switch>Switch Clock</ChessClock.Switch>
 *
 * // As child
 * <ChessClock.Switch asChild>
 *   <div className="custom-switch">Switch</div>
 * </ChessClock.Switch>
 * ```
 */
export const Switch = React.forwardRef<
  HTMLElement,
  React.PropsWithChildren<ChessClockControlProps>
>(
  (
    {
      asChild = false,
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
    const isDisabled = disabled || status === "finished" || status === "idle";

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLElement>) => {
        methods.switch();
        onClick?.(e);
      },
      [methods, onClick],
    );

    return asChild ? (
      <Slot
        ref={ref}
        onClick={handleClick}
        className={className}
        style={style}
        {...{ ...rest, disabled: isDisabled }}
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

Switch.displayName = "ChessClock.Switch";
