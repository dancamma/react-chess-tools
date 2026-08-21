import React from "react";
import { fireEvent, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ChessGame } from "../..";
import { Board } from "../Board";
import { useChessGameContext } from "../../../../hooks/useChessGameContext";
import type { ChessGameEvent } from "../../../../types/gameEvents";
import { defaultGameTheme } from "../../../../theme/defaults";

const GameEventProbe = ({ events }: { events: (ChessGameEvent | null)[] }) => {
  const { gameEvent } = useChessGameContext();
  React.useEffect(() => {
    events.push(gameEvent);
  }, [gameEvent, events]);
  return null;
};

describe("ChessGame.Board", () => {
  it("should not keep the live position's highlights while reviewing history", () => {
    const LAST_MOVE = defaultGameTheme.state.lastMove;
    const CHECK = defaultGameTheme.state.check;

    const Nav = () => {
      const { methods } = useChessGameContext();
      return (
        <>
          <button onClick={() => methods.makeMove("e4")} type="button">
            e4
          </button>
          <button onClick={() => methods.makeMove("e5")} type="button">
            e5
          </button>
          <button onClick={() => methods.makeMove("Qh5")} type="button">
            Qh5
          </button>
          <button onClick={() => methods.makeMove("Nc6")} type="button">
            Nc6
          </button>
          <button onClick={() => methods.makeMove("Qxf7+")} type="button">
            Qxf7
          </button>
          <button onClick={() => methods.goToPreviousMove()} type="button">
            Prev
          </button>
        </>
      );
    };

    const { container, getByText } = render(
      <ChessGame.Root>
        <Board options={{ showAnimations: false }} />
        <Nav />
      </ChessGame.Root>,
    );

    // react-chessboard renders squareStyles on the overlay div inside the square
    const highlight = (name: string) =>
      (container.querySelector(`[data-square="${name}"] > div`) as HTMLElement)
        .style.backgroundColor;

    ["e4", "e5", "Qh5", "Nc6", "Qxf7"].forEach((move) =>
      fireEvent.click(getByText(move)),
    );

    // Live position: last move h5-f7, black king in check on e8
    expect(highlight("f7")).toBe(LAST_MOVE);
    expect(highlight("e8")).toBe(CHECK);

    // Step back to the position after 2.Qh5: neither highlight belongs there
    fireEvent.click(getByText("Prev"));
    fireEvent.click(getByText("Prev"));

    expect(highlight("e8")).not.toBe(CHECK);
    // the move that actually led here is 2.Qh5, so d1-h5 is the last move
    expect(highlight("d1")).toBe(LAST_MOVE);
    expect(highlight("h5")).toBe(LAST_MOVE);
  });

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

  it("should not react to clicks while reviewing history", () => {
    const events: (ChessGameEvent | null)[] = [];
    const NavigateBack = () => {
      const {
        methods: { goToStart },
        game,
      } = useChessGameContext();
      React.useEffect(() => {
        if (game.history().length > 0) {
          goToStart();
        }
      }, [game.history().length, goToStart]);
      return null;
    };

    const { container } = render(
      <ChessGame.Root>
        <Board options={{ showAnimations: false }} />
        <GameEventProbe events={events} />
        <NavigateBack />
      </ChessGame.Root>,
    );

    fireEvent.click(container.querySelector('[data-square="e2"]')!);
    fireEvent.click(container.querySelector('[data-square="e4"]')!);
    events.length = 0;

    // Now at the start position in review mode: clicks must be inert
    fireEvent.click(container.querySelector('[data-square="d2"]')!);
    fireEvent.click(container.querySelector('[data-square="d4"]')!);

    expect(events.filter(Boolean)).toEqual([]);
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
