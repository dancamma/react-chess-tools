import { useEffect, useReducer, useCallback, useMemo } from "react";
import { initializePuzzle, reducer } from "./reducer";
import { getOrientation, type Puzzle, type Hint, type Status } from "../utils";
import { useChessGameContext } from "@react-chess-tools/react-chess-game";

export type ChessPuzzleContextType = {
  status: Status;
  changePuzzle: (puzzle: Puzzle) => void;
  resetPuzzle: () => void;
  puzzle: Puzzle;
  hint: Hint;
  nextMove?: string | null;
  isPlayerTurn: boolean;
  onHint: () => void;
  puzzleState: Status;
  movesPlayed: number;
  totalMoves: number;
};

export const useChessPuzzle = (
  puzzle: Puzzle,
  onSolve?: (puzzleContext: ChessPuzzleContextType) => void,
  onFail?: (puzzleContext: ChessPuzzleContextType) => void,
  solveOnCheckmate: boolean = true,
): ChessPuzzleContextType => {
  const gameContext = useChessGameContext();

  const [state, dispatch] = useReducer(reducer, { puzzle }, initializePuzzle);

  const {
    game,
    methods: { makeMove, setPosition },
  } = gameContext;

  const changePuzzle = useCallback(
    (puzzle: Puzzle) => {
      setPosition(puzzle.fen, getOrientation(puzzle));
      dispatch({ type: "INITIALIZE", payload: { puzzle } });
    },
    [setPosition],
  );

  useEffect(() => {
    changePuzzle(puzzle);
  }, [JSON.stringify(puzzle), changePuzzle]);

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

  if (!gameContext) {
    throw new Error("useChessPuzzle must be used within a ChessGameContext");
  }

  const onHint = useCallback(() => {
    dispatch({ type: "TOGGLE_HINT" });
  }, []);

  const resetPuzzle = useCallback(() => {
    changePuzzle(puzzle);
  }, [changePuzzle, puzzle]);

  const puzzleContext: ChessPuzzleContextType = useMemo(
    () => ({
      status: state.status,
      changePuzzle,
      resetPuzzle,
      puzzle,
      hint: state.hint,
      onHint,
      nextMove: state.nextMove,
      isPlayerTurn: state.isPlayerTurn,
      puzzleState: state.status,
      movesPlayed: state.currentMoveIndex,
      totalMoves: puzzle.moves.length,
    }),
    [
      state.status,
      changePuzzle,
      resetPuzzle,
      puzzle,
      state.hint,
      onHint,
      state.nextMove,
      state.isPlayerTurn,
      state.currentMoveIndex,
    ],
  );

  useEffect(() => {
    if (game?.history()?.length <= 0 + (puzzle.makeFirstMove ? 1 : 0)) {
      return;
    }
    if (game.history().length % 2 === (puzzle.makeFirstMove ? 0 : 1)) {
      dispatch({
        type: "PLAYER_MOVE",
        payload: {
          move: gameContext?.game?.history({ verbose: true })?.pop() ?? null,
          puzzleContext,
          game: game,
          solveOnCheckmate,
        },
      });

      dispatch({
        type: "CPU_MOVE",
      });
    }
  }, [game?.history()?.length]);

  useEffect(() => {
    if (state.status === "solved" && !state.onSolveInvoked && onSolve) {
      onSolve(puzzleContext);
      dispatch({ type: "MARK_SOLVE_INVOKED" });
    }
  }, [state.status, state.onSolveInvoked]);

  useEffect(() => {
    if (state.status === "failed" && !state.onFailInvoked && onFail) {
      onFail(puzzleContext);
      dispatch({ type: "MARK_FAIL_INVOKED" });
    }
  }, [state.status, state.onFailInvoked]);

  return puzzleContext;
};
