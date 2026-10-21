import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useChessGameContext } from "@react-chess-tools/react-chess-game";

import {
  ChessPuzzle,
  useChessPuzzleContext,
  type ChessPuzzleContextType,
  type Puzzle,
} from "..";

const MATE: Puzzle = {
  fen: "6k1/5ppp/8/8/8/8/6PP/4R1K1 w - - 0 1",
  moves: ["e1e8"],
};
const LINE: Puzzle = {
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  moves: ["e4", "e5", "Nf3"],
};

function Controls({ moves }: { moves: string[] }) {
  const game = useChessGameContext();
  const puzzle = useChessPuzzleContext();
  return (
    <>
      <output data-testid="count">{puzzle.movesPlayed}</output>
      <output data-testid="history">{game.game.history().join(",")}</output>
      {moves.map((move) => (
        <button key={move} onClick={() => game.methods.makeMove(move)}>
          {move}
        </button>
      ))}
      <button onClick={puzzle.onHint}>Hook hint</button>
      <ChessPuzzle.Hint>Hint</ChessPuzzle.Hint>
      <button onClick={puzzle.resetPuzzle}>Reset</button>
    </>
  );
}

it("reports the final accepted move in the solve callback for a one-move mate", () => {
  const solved = jest.fn<void, [ChessPuzzleContextType]>();
  render(
    <ChessPuzzle.Root puzzle={MATE} onSolve={solved}>
      <Controls moves={["e1e8"]} />
    </ChessPuzzle.Root>,
  );
  fireEvent.click(screen.getByText("e1e8"));
  expect(solved).toHaveBeenCalledTimes(1);
  expect(solved.mock.calls[0][0]).toMatchObject({
    status: "solved",
    movesPlayed: 1,
    totalMoves: 1,
  });
});

it("counts CPU and player plies while excluding a wrong move", async () => {
  const solved = jest.fn();
  const failed = jest.fn();
  render(
    <ChessPuzzle.Root puzzle={LINE} onSolve={solved} onFail={failed}>
      <Controls moves={["e4", "Nc3", "Nf3"]} />
    </ChessPuzzle.Root>,
  );
  fireEvent.click(screen.getByText("e4"));
  await waitFor(() =>
    expect(screen.getByTestId("count")).toHaveTextContent("2"),
  );
  fireEvent.click(screen.getByText("Nc3"));
  expect(failed.mock.calls[0][0].movesPlayed).toBe(2);
  fireEvent.click(screen.getByText("Reset"));
  expect(screen.getByTestId("count")).toHaveTextContent("0");
  fireEvent.click(screen.getByText("e4"));
  await waitFor(() =>
    expect(screen.getByTestId("history")).toHaveTextContent("e4,e5"),
  );
  fireEvent.click(screen.getByText("Nf3"));
  expect(solved.mock.calls[0][0].movesPlayed).toBe(3);
});

it("blocks programmatic moves and hints while disabled, then resumes the same position", () => {
  const hint = jest.fn();
  const { rerender } = render(
    <ChessPuzzle.Root puzzle={MATE} disabled onHint={hint}>
      <Controls moves={["e1e8"]} />
    </ChessPuzzle.Root>,
  );
  fireEvent.click(screen.getByText("e1e8"));
  fireEvent.click(screen.getByText("Hook hint"));
  expect(screen.getByTestId("history")).toBeEmptyDOMElement();
  expect(screen.getByText("Hint")).toBeDisabled();
  expect(hint).not.toHaveBeenCalled();
  rerender(
    <ChessPuzzle.Root puzzle={MATE} onHint={hint}>
      <Controls moves={["e1e8"]} />
    </ChessPuzzle.Root>,
  );
  fireEvent.click(screen.getByText("Hook hint"));
  expect(hint).toHaveBeenLastCalledWith("piece");
  fireEvent.click(screen.getByText("Hook hint"));
  expect(hint).toHaveBeenLastCalledWith("move");
  fireEvent.click(screen.getByText("Hook hint"));
  expect(hint).toHaveBeenCalledTimes(2);
  fireEvent.click(screen.getByText("e1e8"));
  expect(screen.getByTestId("count")).toHaveTextContent("1");
});

it("defers a CPU-first move until enabled and never replays it after another pause", async () => {
  const puzzle = { ...LINE, moves: ["e4", "e5"], makeFirstMove: true };
  const solved = jest.fn();
  const { rerender } = render(
    <ChessPuzzle.Root puzzle={puzzle} disabled onSolve={solved}>
      <Controls moves={["e5"]} />
    </ChessPuzzle.Root>,
  );
  expect(screen.getByTestId("history")).toBeEmptyDOMElement();
  rerender(
    <ChessPuzzle.Root puzzle={puzzle} onSolve={solved}>
      <Controls moves={["e5"]} />
    </ChessPuzzle.Root>,
  );
  await waitFor(() =>
    expect(screen.getByTestId("history")).toHaveTextContent("e4"),
  );
  rerender(
    <ChessPuzzle.Root puzzle={puzzle} disabled onSolve={solved}>
      <Controls moves={["e5"]} />
    </ChessPuzzle.Root>,
  );
  rerender(
    <ChessPuzzle.Root puzzle={puzzle} onSolve={solved}>
      <Controls moves={["e5"]} />
    </ChessPuzzle.Root>,
  );
  fireEvent.click(screen.getByText("e5"));
  expect(solved).toHaveBeenCalledTimes(1);
  expect(solved.mock.calls[0][0].movesPlayed).toBe(2);
  expect(screen.getByTestId("history")).toHaveTextContent("e4,e5");
});

it("resumes a CPU reply paused immediately after a player move", async () => {
  function PausablePuzzle() {
    const [disabled, setDisabled] = React.useState(false);
    function PauseOnMove() {
      const game = useChessGameContext();
      return (
        <button
          onClick={() => {
            game.methods.makeMove("e4");
            setDisabled(true);
          }}
        >
          Move and pause
        </button>
      );
    }
    return (
      <ChessPuzzle.Root puzzle={LINE} disabled={disabled}>
        <Controls moves={["Nf3"]} />
        <PauseOnMove />
        <button onClick={() => setDisabled(false)}>Resume</button>
      </ChessPuzzle.Root>
    );
  }
  render(<PausablePuzzle />);
  fireEvent.click(screen.getByText("Move and pause"));
  expect(screen.getByTestId("history").textContent).toBe("e4");
  expect(screen.getByTestId("count").textContent).toBe("1");
  fireEvent.click(screen.getByText("Resume"));
  await waitFor(() =>
    expect(screen.getByTestId("history").textContent).toBe("e4,e5"),
  );
  fireEvent.click(screen.getByText("Nf3"));
  expect(screen.getByTestId("count").textContent).toBe("3");
});
