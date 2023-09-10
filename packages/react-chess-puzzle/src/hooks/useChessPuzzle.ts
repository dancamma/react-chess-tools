import { useEffect, useReducer } from "react";
import { initializePuzzle, reducer } from "./reducer";
import { getOrientation, type Puzzle } from "../utils";
import { useChessGameContext } from "@react-chess-tools/react-chess-game";

export const useChessPuzzle = (
  puzzle: Puzzle,
  onSolve?: (changePuzzle: (puzzle: Puzzle) => void) => void,
  onFail?: (changePuzzle: (puzzle: Puzzle) => void) => void,
) => {
  const gameContext = useChessGameContext();

  const [state, dispatch] = useReducer(reducer, { puzzle }, initializePuzzle);

  const {
    game,
    methods: { makeMove, setPosition },
  } = gameContext;

  useEffect(() => {
    if (gameContext && game.fen() !== puzzle.fen) {
      setPosition(puzzle.fen, getOrientation(puzzle));
    }
  }, []);

  const changePuzzle = (puzzle: Puzzle) => {
    dispatch({ type: "INITIALIZE", payload: { puzzle } });
    setPosition(puzzle.fen, getOrientation(puzzle));
  };

  useEffect(() => {
    if (gameContext && game.fen() === puzzle.fen && state.needCpuMove) {
      setTimeout(
        () =>
          dispatch({
            type: "CPU_MOVE",
          }),
        0,
      );
    }
  }, [gameContext, state.needCpuMove]);

  useEffect(() => {
    if (state.cpuMove) {
      makeMove(state.cpuMove);
    }
  }, [state.cpuMove]);

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
      });
    }
  }, [game?.history()?.length]);

  if (!gameContext) {
    throw new Error("useChessPuzzle must be used within a ChessGameContext");
  }

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
