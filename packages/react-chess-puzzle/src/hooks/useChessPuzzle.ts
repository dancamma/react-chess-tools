import { useEffect, useReducer } from "react";
import { initializePuzzle, reducer } from "./reducer";
import { type Puzzle } from "../utils";
import { useChessGameContext } from "@react-chess-tools/react-chess-game";

export const useChessPuzzle = (
  puzzle: Puzzle,
  onSolve?: (changePuzzle: (puzzle: Puzzle) => void) => void,
  onFail?: (changePuzzle: (puzzle: Puzzle) => void) => void,
) => {
  const gameContext = useChessGameContext();

  const [state, dispatch] = useReducer(
    reducer,
    { puzzle, setPosition: gameContext?.methods.setPosition ?? (() => {}) },
    initializePuzzle,
  );

  const {
    game,
    methods: { makeMove, setPosition },
  } = gameContext;

  useEffect(() => {
    if (gameContext && game.fen() === puzzle.fen && state.needCpuMove) {
      setTimeout(
        () =>
          dispatch({
            type: "CPU_MOVE",
            payload: {
              makeMove,
            },
          }),
        0,
      );
    }
  }, [gameContext, state.needCpuMove]);

  if (!gameContext) {
    throw new Error("useChessPuzzle must be used within a ChessGameContext");
  }

  const changePuzzle = (puzzle: Puzzle) => {
    dispatch({ type: "INITIALIZE", payload: { puzzle, setPosition } });
  };

  useEffect(() => {
    if (game?.history()?.length <= 0 + (puzzle.makeFirstMove ? 1 : 0)) {
      return;
    }
    if (game.history().length % 2 === (puzzle.makeFirstMove ? 0 : 1)) {
      dispatch({
        type: "PLAYER_MOVE",
        payload: {
          move: gameContext?.game?.history({ verbose: true })?.pop() ?? null,
          onSolve,
          onFail,
          changePuzzle,
          game: game,
        },
      });

      dispatch({
        type: "CPU_MOVE",
        payload: {
          makeMove,
        },
      });
    }
  }, [game, game?.history()?.length]);

  const onHint = () => {
    dispatch({ type: "TOGGLE_HINT" });
  };

  return {
    status: state.status,
    changePuzzle,
    puzzle,
    hint: state.hint,
    onHint,
    nextMove: state.nextMove,
    isPlayerTurn: state.isPlayerTurn,
  };
};
