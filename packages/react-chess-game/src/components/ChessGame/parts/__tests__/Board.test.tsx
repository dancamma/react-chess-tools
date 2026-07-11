import React from "react";
import { fireEvent, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ChessGame } from "../..";
import { Board } from "../Board";
import { useChessGameContext } from "../../../../hooks/useChessGameContext";
import type { ChessGameEvent } from "../../../../types/gameEvents";

const GameEventProbe = ({ events }: { events: (ChessGameEvent | null)[] }) => {
  const { gameEvent } = useChessGameContext();
  React.useEffect(() => {
    events.push(gameEvent);
  }, [gameEvent, events]);
  return null;
};

describe("ChessGame.Board", () => {
  it("should have correct displayName", () => {
    expect(Board.displayName).toBe("ChessGame.Board");
  });

  it("should forward ref to div element", () => {
    const ref = React.createRef<HTMLDivElement>();

    render(
      <ChessGame.Root>
        <Board ref={ref} />
      </ChessGame.Root>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("should apply custom className", () => {
    const { container } = render(
      <ChessGame.Root>
        <Board className="custom-board-class" />
      </ChessGame.Root>,
    );

    const board = container.querySelector(".custom-board-class");
    expect(board).toBeInTheDocument();
  });

  it("should merge multiple className props", () => {
    const { container } = render(
      <ChessGame.Root>
        <Board className="class-1 class-2" />
      </ChessGame.Root>,
    );

    const board = container.querySelector(".class-1");
    expect(board).toHaveClass("class-1");
    expect(board).toHaveClass("class-2");
  });

  it("should apply custom style", () => {
    const customStyle = { border: "2px solid red", margin: "10px" };

    const { container } = render(
      <ChessGame.Root>
        <Board style={customStyle} />
      </ChessGame.Root>,
    );

    const board = container.firstElementChild as HTMLElement;
    expect(board).toHaveStyle({ border: "2px solid red" });
    expect(board).toHaveStyle({ margin: "10px" });
  });

  it("should apply custom id", () => {
    const { container } = render(
      <ChessGame.Root>
        <Board id="custom-board-id" />
      </ChessGame.Root>,
    );

    const board = container.querySelector("#custom-board-id");
    expect(board).toBeInTheDocument();
  });

  it("should apply data-* attributes", () => {
    const { container } = render(
      <ChessGame.Root>
        <Board data-testid="board" data-custom="value" />
      </ChessGame.Root>,
    );

    const board = container.querySelector("[data-custom='value']");
    expect(board).toHaveAttribute("data-testid", "board");
  });

  it("should apply aria-* attributes", () => {
    const { container } = render(
      <ChessGame.Root>
        <Board aria-label="Chess board" aria-describedby="board-desc" />
      </ChessGame.Root>,
    );

    const board = container.firstElementChild as HTMLElement;
    expect(board).toHaveAttribute("aria-label", "Chess board");
    expect(board).toHaveAttribute("aria-describedby", "board-desc");
  });

  it("should accept custom onClick handler", () => {
    const handleClick = jest.fn();

    const { container } = render(
      <ChessGame.Root>
        <Board onClick={handleClick} />
      </ChessGame.Root>,
    );

    const board = container.firstElementChild as HTMLElement;
    board.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should focus the board container on pointer interaction", () => {
    const { container } = render(
      <ChessGame.Root>
        <Board />
      </ChessGame.Root>,
    );

    const board = container.firstElementChild as HTMLDivElement;

    expect(document.activeElement).not.toBe(board);

    fireEvent.pointerDown(board);

    expect(document.activeElement).toBe(board);
  });

  it("should not emit an illegal-move event when a click deselects the piece", () => {
    const events: (ChessGameEvent | null)[] = [];
    const { container } = render(
      <ChessGame.Root>
        <Board />
        <GameEventProbe events={events} />
      </ChessGame.Root>,
    );

    fireEvent.click(container.querySelector('[data-square="e2"]')!);
    fireEvent.click(container.querySelector('[data-square="d5"]')!);

    expect(events.filter(Boolean)).toEqual([]);
  });

  it("should emit a move-made event when a legal move is played by click", () => {
    const events: (ChessGameEvent | null)[] = [];
    const { container } = render(
      <ChessGame.Root>
        <Board options={{ showAnimations: false }} />
        <GameEventProbe events={events} />
      </ChessGame.Root>,
    );

    fireEvent.click(container.querySelector('[data-square="e2"]')!);
    fireEvent.click(container.querySelector('[data-square="e4"]')!);

    const emitted = events.filter(Boolean) as ChessGameEvent[];
    expect(emitted).toHaveLength(1);
    expect(emitted[0]).toMatchObject({ type: "move-made" });
  });

  it("should throw error when used outside ChessGame.Root", () => {
    // Suppress console.error for this test
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      render(<Board />);
    }).toThrow("useChessGameContext must be used within a ChessGame component");

    consoleError.mockRestore();
  });
});
