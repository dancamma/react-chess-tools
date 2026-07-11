import React from "react";
import { act, render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  useChessGameContext,
  ChessGameContextType,
} from "@react-chess-tools/react-chess-game";
import { ChessPuzzle } from "../components/ChessPuzzle";
import { useChessPuzzleContext } from "../hooks/useChessPuzzleContext";
import type { ChessPuzzleContextType } from "../hooks/useChessPuzzle";
import type { Puzzle } from "../utils";

// Repro for https://github.com/dancamma/react-chess-tools/issues/82:
// cycling the puzzle prop after solving crashed with "Invalid move" while
// replaying the previous puzzle's history over the new position
const puzzles: Puzzle[] = [
  {
    fen: "3r3r/pQNk1ppp/1qnb1n2/1B6/8/8/PPP3PP/3R1R1K w - - 5 19",
    moves: ["d1d6", "d7d6", "b7b6", "a7b6"],
    makeFirstMove: true,
  },
  {
    fen: "3r1rk1/pp6/5pb1/2p2q2/8/P2P4/1PP4Q/2K3RR w - - 1 27",
    moves: ["h2h7"],
    makeFirstMove: false,
  },
];

const contexts: {
  game: ChessGameContextType | null;
  puzzle: ChessPuzzleContextType | null;
} = { game: null, puzzle: null };

const ContextProbe = () => {
  contexts.game = useChessGameContext();
  contexts.puzzle = useChessPuzzleContext();
  return null;
};

const PuzzleSolver = ({ onSolve }: { onSolve?: () => void }) => {
  const [currentPuzzle, setCurrentPuzzle] = React.useState(0);

  return (
    <ChessPuzzle.Root
      puzzle={puzzles[currentPuzzle]}
      onSolve={() => {
        setCurrentPuzzle((prev) => (prev + 1) % puzzles.length);
        onSolve?.();
      }}
    >
      <ChessPuzzle.Board options={{ showAnimations: false }} />
      <ContextProbe />
    </ChessPuzzle.Root>
  );
};

describe("ChessPuzzle.Root puzzle prop changes", () => {
  beforeEach(() => {
    contexts.game = null;
    contexts.puzzle = null;
  });

  it("should load the next puzzle without errors when the prop changes on solve", async () => {
    const handleSolve = jest.fn();
    render(<PuzzleSolver onSolve={handleSolve} />);

    // makeFirstMove: the cpu move is dispatched via setTimeout(0)
    await waitFor(() =>
      expect(contexts.game!.game.history()).toEqual(["Rxd6+"]),
    );

    act(() => {
      contexts.game!.methods.makeMove("d7d6");
    });
    await waitFor(() =>
      expect(contexts.game!.game.history()).toContain("Qxb6"),
    );

    act(() => {
      contexts.game!.methods.makeMove("a7b6");
    });

    await waitFor(() => expect(handleSolve).toHaveBeenCalledTimes(1));

    // The new puzzle must be loaded cleanly: its fen on the board, no history
    await waitFor(() => {
      expect(contexts.game!.currentFen).toBe(puzzles[1].fen);
    });
    expect(contexts.game!.game.history()).toEqual([]);
    expect(contexts.puzzle!.status).toBe("not-started");

    // And it must be solvable in turn
    act(() => {
      contexts.game!.methods.makeMove("h2h7");
    });
    await waitFor(() => expect(handleSolve).toHaveBeenCalledTimes(2));
  });
});
