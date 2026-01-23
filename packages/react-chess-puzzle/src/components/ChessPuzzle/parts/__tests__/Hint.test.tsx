import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ChessPuzzle } from "../..";
import { Hint } from "../Hint";
import { Puzzle } from "../../../../utils";

describe("ChessPuzzle.Hint", () => {
  const mockPuzzle: Puzzle = {
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    moves: ["e4", "e5"],
  };

  it("should have correct displayName", () => {
    expect(Hint.displayName).toBe("ChessPuzzle.Hint");
  });

  it("should forward ref to button element", () => {
    const ref = React.createRef<HTMLElement>();

    render(
      <ChessPuzzle.Root puzzle={mockPuzzle}>
        <Hint ref={ref} />
      </ChessPuzzle.Root>,
    );

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("should forward ref when using asChild", () => {
    const ref = React.createRef<HTMLElement>();

    render(
      <ChessPuzzle.Root puzzle={mockPuzzle}>
        <Hint ref={ref} asChild>
          <button>Custom Hint</button>
        </Hint>
      </ChessPuzzle.Root>,
    );

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("should be visible when status matches showOn", () => {
    render(
      <ChessPuzzle.Root puzzle={mockPuzzle}>
        <Hint showOn={["not-started"]}>Hint</Hint>
      </ChessPuzzle.Root>,
    );

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should be hidden when status does not match showOn", () => {
    render(
      <ChessPuzzle.Root puzzle={mockPuzzle}>
        <Hint showOn={["solved"]}>Hint</Hint>
      </ChessPuzzle.Root>,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should default to showing on not-started and in-progress statuses", () => {
    render(
      <ChessPuzzle.Root puzzle={mockPuzzle}>
        <Hint>Hint</Hint>
      </ChessPuzzle.Root>,
    );

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should accept multiple statuses in showOn", () => {
    render(
      <ChessPuzzle.Root puzzle={mockPuzzle}>
        <Hint showOn={["not-started", "in-progress", "failed", "solved"]}>
          Hint
        </Hint>
      </ChessPuzzle.Root>,
    );

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should render custom element when asChild is true", () => {
    render(
      <ChessPuzzle.Root puzzle={mockPuzzle}>
        <Hint asChild>
          <button className="custom-button">Custom Hint</button>
        </Hint>
      </ChessPuzzle.Root>,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Custom Hint");
    expect(button).toHaveClass("custom-button");
  });

  it("should compose onClick handlers with asChild", () => {
    const childOnClick = jest.fn();

    render(
      <ChessPuzzle.Root puzzle={mockPuzzle}>
        <Hint asChild>
          <button onClick={childOnClick}>Hint</button>
        </Hint>
      </ChessPuzzle.Root>,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(childOnClick).toHaveBeenCalledTimes(1);
  });

  it("should throw error when used outside ChessPuzzle.Root", () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      render(<Hint>Hint</Hint>);
    }).toThrow();

    consoleError.mockRestore();
  });

  it("should render text children", () => {
    render(
      <ChessPuzzle.Root puzzle={mockPuzzle}>
        <Hint>Show Hint</Hint>
      </ChessPuzzle.Root>,
    );

    expect(screen.getByRole("button")).toHaveTextContent("Show Hint");
  });

  it("should render element children", () => {
    render(
      <ChessPuzzle.Root puzzle={mockPuzzle}>
        <Hint>
          <span data-testid="child">Hint Icon</span>
        </Hint>
      </ChessPuzzle.Root>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("should render without children", () => {
    render(
      <ChessPuzzle.Root puzzle={mockPuzzle}>
        <Hint aria-label="Show hint" />
      </ChessPuzzle.Root>,
    );

    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
