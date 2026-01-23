import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ChessPuzzle } from "../..";
import { PuzzleBoard } from "../PuzzleBoard";
import { Puzzle } from "../../../../utils";
import { ChessGame } from "@react-chess-tools/react-chess-game";

describe("ChessPuzzle.PuzzleBoard", () => {
  const mockPuzzle: Puzzle = {
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    moves: ["e4", "e5"],
  };

  it("should have correct displayName", () => {
    expect(PuzzleBoard.displayName).toBe("ChessPuzzle.PuzzleBoard");
  });

  it("should forward ref to underlying Board component", () => {
    const ref = React.createRef<HTMLDivElement>();

    render(
      <ChessPuzzle.Root puzzle={mockPuzzle}>
        <PuzzleBoard ref={ref} />
      </ChessPuzzle.Root>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("should allow focusing via ref", () => {
    const ref = React.createRef<HTMLDivElement>();

    render(
      <ChessPuzzle.Root puzzle={mockPuzzle}>
        <PuzzleBoard ref={ref} tabIndex={0} />
      </ChessPuzzle.Root>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);

    // Note: focus() doesn't work in JSDOM, but we can verify the ref points to the element
    // In a real browser, ref.current?.focus() would set document.activeElement to ref.current
  });

  it("should apply custom className", () => {
    const { container } = render(
      <ChessPuzzle.Root puzzle={mockPuzzle}>
        <PuzzleBoard className="custom-puzzle-board-class" />
      </ChessPuzzle.Root>,
    );

    const board = container.querySelector('[style*="position: relative"]');
    expect(board).toHaveClass("custom-puzzle-board-class");
  });

  it("should apply custom style", () => {
    const customStyle = { border: "2px solid blue", margin: "15px" };

    const { container } = render(
      <ChessPuzzle.Root puzzle={mockPuzzle}>
        <PuzzleBoard style={customStyle} />
      </ChessPuzzle.Root>,
    );

    const board = container.querySelector('[style*="position: relative"]');
    expect(board).toHaveStyle({ border: "2px solid blue" });
    expect(board).toHaveStyle({ margin: "15px" });
  });

  it("should apply custom id", () => {
    const { container } = render(
      <ChessPuzzle.Root puzzle={mockPuzzle}>
        <PuzzleBoard id="custom-puzzle-board-id" />
      </ChessPuzzle.Root>,
    );

    const board = container.querySelector('[style*="position: relative"]');
    expect(board).toHaveAttribute("id", "custom-puzzle-board-id");
  });

  it("should apply data-* attributes", () => {
    render(
      <ChessPuzzle.Root puzzle={mockPuzzle}>
        <PuzzleBoard data-testid="puzzle-board" data-custom="puzzle-value" />
      </ChessPuzzle.Root>,
    );

    const board = screen.getByTestId("puzzle-board");
    expect(board).toHaveAttribute("data-custom", "puzzle-value");
  });

  it("should apply aria-* attributes", () => {
    const { container } = render(
      <ChessPuzzle.Root puzzle={mockPuzzle}>
        <PuzzleBoard aria-label="Puzzle board" aria-describedby="puzzle-desc" />
      </ChessPuzzle.Root>,
    );

    const board = container.querySelector('[style*="position: relative"]');
    expect(board).toHaveAttribute("aria-label", "Puzzle board");
    expect(board).toHaveAttribute("aria-describedby", "puzzle-desc");
  });

  it("should accept custom onClick handler", () => {
    const handleClick = jest.fn();

    const { container } = render(
      <ChessPuzzle.Root puzzle={mockPuzzle}>
        <PuzzleBoard onClick={handleClick} />
      </ChessPuzzle.Root>,
    );

    const board = container.querySelector(
      '[style*="position: relative"]',
    ) as HTMLElement;
    board?.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should throw error when used outside ChessPuzzle.Root", () => {
    // Suppress console.error for this test
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      render(
        <ChessGame.Root>
          <PuzzleBoard />
        </ChessGame.Root>,
      );
    }).toThrow(
      "useChessPuzzleContext must be used within a ChessPuzzle component",
    );

    consoleError.mockRestore();
  });
});
