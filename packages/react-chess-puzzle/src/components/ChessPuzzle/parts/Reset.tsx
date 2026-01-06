import React from "react";
import { isClickableElement, type Puzzle, type Status } from "../../../utils";
import { useChessPuzzleContext, type ChessPuzzleContextType } from "../../..";

export interface ResetProps {
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

export const Reset: React.FC<React.PropsWithChildren<ResetProps>> = ({
  children,
  asChild,
  puzzle,
  onReset,
  showOn = defaultShowOn,
}) => {
  const puzzleContext = useChessPuzzleContext();
  if (!puzzleContext) {
    throw new Error("PuzzleContext not found");
  }
  const { changePuzzle, status } = puzzleContext;
  const handleClick = () => {
    changePuzzle(puzzle || puzzleContext.puzzle);
    onReset?.(puzzleContext);
  };

  if (!showOn.includes(status)) {
    return null;
  }

  if (asChild) {
    const child = React.Children.only(children);
    if (isClickableElement(child)) {
      return React.cloneElement(child, {
        onClick: handleClick,
      });
    } else {
      throw new Error("Change child must be a clickable element");
    }
  }

  return (
    <button type="button" onClick={handleClick}>
      {children}
    </button>
  );
};
