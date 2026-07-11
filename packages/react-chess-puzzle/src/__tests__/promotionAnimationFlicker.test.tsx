import React from "react";
import { act, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  useChessGameContext,
  ChessGameContextType,
} from "@react-chess-tools/react-chess-game";
import { ChessPuzzle } from "../components/ChessPuzzle";
import type { Puzzle } from "../utils";

// Repro for https://github.com/dancamma/react-chess-tools/issues/82 follow-up
// issue #83: solving a puzzle with a promotion move starts a 300ms animation
// inside react-chessboard; when onSolve immediately swaps the puzzle, the
// stale animation timer used to reapply the previous puzzle's position over
// the new one
const puzzles: Puzzle[] = [
  {
    fen: "8/3P4/6p1/4p3/4Pk1p/5P1P/3K4/r7 w - - 0 51",
    moves: ["d7d8q"],
    makeFirstMove: false,
  },
  {
    fen: "8/1P6/2K4k/7p/8/8/5r2/8 w - - 0 55",
    moves: ["b7b8q"],
    makeFirstMove: false,
  },
];

const contexts: { game: ChessGameContextType | null } = { game: null };

const ContextProbe = () => {
  contexts.game = useChessGameContext();
  return null;
};

const PuzzleSolver = () => {
  const [currentPuzzle, setCurrentPuzzle] = React.useState(0);

  return (
    <ChessPuzzle.Root
      puzzle={puzzles[currentPuzzle]}
      onSolve={() => setCurrentPuzzle((prev) => (prev + 1) % puzzles.length)}
    >
      <ChessPuzzle.Board />
      <ContextProbe />
    </ChessPuzzle.Root>
  );
};

const pieceOn = (square: string) =>
  document
    .querySelector(`[data-square="${square}"] [data-piece]`)
    ?.getAttribute("data-piece");

describe("promotion animation on puzzle change", () => {
  beforeEach(() => {
    contexts.game = null;
    jest.useFakeTimers();
    // jsdom has no layout: give squares a size so react-chessboard animates
    jest
      .spyOn(Element.prototype, "getBoundingClientRect")
      .mockReturnValue(new DOMRect(0, 0, 80, 80));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("should not replay the solved position after the puzzle has changed", () => {
    render(<PuzzleSolver />);

    expect(pieceOn("d7")).toBe("wP");

    // solving move: promotion, which react-chessboard animates over 300ms
    act(() => {
      contexts.game!.methods.makeMove({ from: "d7", to: "d8", promotion: "q" });
    });

    // onSolve already swapped in the second puzzle
    expect(contexts.game!.currentFen).toBe(puzzles[1].fen);
    expect(pieceOn("b7")).toBe("wP");

    // once the stale animation timer fires, the board must still show the
    // second puzzle, not the first puzzle's promoted queen
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(pieceOn("b7")).toBe("wP");
    expect(pieceOn("f2")).toBe("bR");
    expect(pieceOn("d8")).toBeUndefined();
  });
});
