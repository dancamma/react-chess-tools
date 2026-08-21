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

// chess.js re-serializes the FEN it is given and drops an en-passant square
// when no ep capture is legal, so a raw string compare against the prop FEN
// never matched and the cpu first move was never dispatched.
const enPassantPuzzle: Puzzle = {
  fen: "rnbqkbnr/ppp1pppp/8/3p4/8/8/PPPPPPPP/RNBQKBNR w KQkq d6 0 2",
  moves: ["Nc3", "Nf6"],
  makeFirstMove: true,
};

const otherPuzzle: Puzzle = {
  fen: "3r1rk1/pp6/5pb1/2p2q2/8/P2P4/1PP4Q/2K3RR w - - 1 27",
  moves: ["h2h7"],
  makeFirstMove: false,
};

const contexts: {
  game: ChessGameContextType | null;
  puzzle: ChessPuzzleContextType | null;
} = { game: null, puzzle: null };

const ContextProbe = () => {
  contexts.game = useChessGameContext();
  contexts.puzzle = useChessPuzzleContext();
  return null;
};

const renderPuzzle = (puzzle: Puzzle) =>
  render(
    <ChessPuzzle.Root puzzle={puzzle}>
      <ChessPuzzle.Board options={{ showAnimations: false }} />
      <ContextProbe />
    </ChessPuzzle.Root>,
  );

describe("active puzzle", () => {
  beforeEach(() => {
    contexts.game = null;
    contexts.puzzle = null;
  });

  it("plays the cpu first move when the fen carries an en-passant square", async () => {
    renderPuzzle(enPassantPuzzle);

    await waitFor(() => expect(contexts.game!.game.history()).toEqual(["Nc3"]));
    expect(contexts.puzzle!.isPlayerTurn).toBe(true);
  });

  it("exposes the puzzle set through changePuzzle, not the prop", async () => {
    renderPuzzle(otherPuzzle);

    await waitFor(() => expect(contexts.puzzle).not.toBeNull());
    expect(contexts.puzzle!.totalMoves).toBe(otherPuzzle.moves.length);

    await act(async () => {
      contexts.puzzle!.changePuzzle(enPassantPuzzle);
    });

    await waitFor(() => expect(contexts.puzzle!.puzzle).toBe(enPassantPuzzle));
    expect(contexts.puzzle!.totalMoves).toBe(enPassantPuzzle.moves.length);
    // the cpu move of the puzzle that was actually set, not of the prop
    await waitFor(() => expect(contexts.game!.game.history()).toEqual(["Nc3"]));
  });
});
