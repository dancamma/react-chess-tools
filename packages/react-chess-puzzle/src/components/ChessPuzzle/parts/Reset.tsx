import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type Puzzle, type Status } from "../../../utils";
import { useChessPuzzleContext, type ChessPuzzleContextType } from "../../..";

export interface ResetProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onReset"
> {
  asChild?: boolean;
  puzzle?: Puzzle;
  onReset?: (puzzleContext: ChessPuzzleContextType) => void;
  /**
   * The puzzle statuses in which the reset button should be visible.
   * @default ["failed", "solved"]
   */
  showOn?: Status[];
}

const defaultShowOn: Status[] = ["failed", "solved"];

export const Reset = React.forwardRef<
  HTMLElement,
  React.PropsWithChildren<ResetProps>
>(
  (
    {
      children,
      asChild,
      puzzle,
      onReset,
      showOn = defaultShowOn,
      className,
      ...rest
    },
    ref,
  ) => {
    const puzzleContext = useChessPuzzleContext();
    if (!puzzleContext) {
      throw new Error("PuzzleContext not found");
    }
    const { changePuzzle, puzzle: contextPuzzle, status } = puzzleContext;

    const handleClick = React.useCallback(() => {
      changePuzzle(puzzle || contextPuzzle);
      onReset?.(puzzleContext);
    }, [changePuzzle, puzzle, contextPuzzle, puzzleContext, onReset]);

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
  },
);

Reset.displayName = "ChessPuzzle.Reset";
