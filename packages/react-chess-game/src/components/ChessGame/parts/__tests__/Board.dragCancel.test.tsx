import React from "react";
import { act, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import type { ChessboardOptions } from "react-chessboard";
import { ChessGame } from "../..";
import { Board } from "../Board";
import { useChessGameContext } from "../../../../hooks/useChessGameContext";
import type { ChessGameEvent } from "../../../../types/gameEvents";

let latestOptions: ChessboardOptions | undefined;

jest.mock("react-chessboard", () => {
  const actual = jest.requireActual("react-chessboard");
  return {
    ...actual,
    Chessboard: ({ options }: { options: ChessboardOptions }) => {
      latestOptions = options;
      return <div data-testid="chessboard" />;
    },
  };
});

const GameEventProbe = ({ events }: { events: (ChessGameEvent | null)[] }) => {
  const { gameEvent } = useChessGameContext();
  React.useEffect(() => {
    events.push(gameEvent);
  }, [gameEvent, events]);
  return null;
};

describe("ChessGame.Board drag cancel (react-chessboard 5.12)", () => {
  afterEach(() => {
    latestOptions = undefined;
  });

  it("clears active-square highlights when a drag is cancelled", () => {
    render(
      <ChessGame.Root>
        <Board />
      </ChessGame.Root>,
    );

    act(() => {
      latestOptions?.onPieceDrag?.({
        isSparePiece: false,
        piece: { pieceType: "wP" },
        square: "e2",
      });
    });

    expect(latestOptions?.squareStyles).toHaveProperty("e2");
    expect(latestOptions?.squareStyles).toHaveProperty("e4");

    act(() => {
      latestOptions?.onPieceDragCancel?.();
    });

    expect(latestOptions?.squareStyles?.e2).toBeUndefined();
    expect(latestOptions?.squareStyles?.e4).toBeUndefined();
  });

  it("does not emit an illegal-move event when a piece is dropped off the board", () => {
    const events: (ChessGameEvent | null)[] = [];

    render(
      <ChessGame.Root>
        <Board />
        <GameEventProbe events={events} />
      </ChessGame.Root>,
    );

    act(() => {
      latestOptions?.onPieceDrop?.({
        piece: {
          isSparePiece: false,
          position: "e2",
          pieceType: "wP",
        },
        sourceSquare: "e2",
        targetSquare: null,
      });
    });

    expect(events.filter(Boolean)).toEqual([]);
  });
});
