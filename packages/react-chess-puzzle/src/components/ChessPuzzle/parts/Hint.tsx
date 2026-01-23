import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Status } from "../../../utils";
import { useChessPuzzleContext } from "../../..";

export interface HintProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick"
> {
  asChild?: boolean;
  /**
   * The puzzle statuses in which the hint button should be visible.
   * @default ["not-started", "in-progress"]
   */
  showOn?: Status[];
}

const defaultShowOn: Status[] = ["not-started", "in-progress"];

export const Hint = React.forwardRef<
  HTMLElement,
  React.PropsWithChildren<HintProps>
>(({ children, asChild, showOn = defaultShowOn, className, ...rest }, ref) => {
  const puzzleContext = useChessPuzzleContext();
  if (!puzzleContext) {
    throw new Error("PuzzleContext not found");
  }
  const { onHint, status } = puzzleContext;

  const handleClick = React.useCallback(() => {
    onHint();
  }, [onHint]);

  if (!showOn.includes(status)) {
    return null;
  }

  return asChild ? (
    <Slot ref={ref} onClick={handleClick} className={className} {...rest}>
      {children}
    </Slot>
  ) : (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type="button"
      className={className}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </button>
  );
});

Hint.displayName = "ChessPuzzle.Hint";
