import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ChessPuzzle } from "../..";
import { Root } from "../Root";
import { Puzzle } from "../../../../utils";

describe("ChessPuzzle.Root", () => {
  const mockPuzzle: Puzzle = {
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    moves: ["e4", "e5"],
  };

  it("should have correct displayName", () => {
    expect(Root.displayName).toBe("ChessPuzzle.Root");
  });

  it("should render children correctly", () => {
    render(
      <ChessPuzzle.Root puzzle={mockPuzzle}>
        <div data-testid="child">Child Component</div>
      </ChessPuzzle.Root>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Child Component")).toBeInTheDocument();
  });

  it("should render multiple children", () => {
    render(
      <ChessPuzzle.Root puzzle={mockPuzzle}>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </ChessPuzzle.Root>,
    );

    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
    expect(screen.getByTestId("child-3")).toBeInTheDocument();
  });
});
