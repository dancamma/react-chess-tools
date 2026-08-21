import { useEffect, useReducer, useCallback, useMemo } from "react";
import { Chess } from "chess.js";
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
  const gameFen = game.fen();
  const activePuzzle = state.puzzle;
  // chess.js re-serializes the FEN it is given (it drops an en-passant square
  // when no ep capture is legal), so compare against the normalized form.
  const activeFen = new Chess(activePuzzle.fen).fen();

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
    if (gameFen === activeFen && state.needCpuMove) {
      const timeoutId = setTimeout(() => {
        dispatch({
          type: "CPU_MOVE",
        });
      }, 0);
      return () => clearTimeout(timeoutId);
    }
    // Depend on stable position values rather than the fresh gameContext object.
    // Both are needed so changing between CPU-first puzzles first cancels the old
    // timer, then schedules a new one once the game has loaded the new FEN.
  }, [gameFen, activeFen, state.needCpuMove]);

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
    changePuzzle(activePuzzle);
  }, [changePuzzle, activePuzzle]);

  const puzzleContext: ChessPuzzleContextType = useMemo(
    () => ({
      status: state.status,
      changePuzzle,
      resetPuzzle,
      puzzle: activePuzzle,
      hint: state.hint,
      onHint,
      nextMove: state.nextMove,
      isPlayerTurn: state.isPlayerTurn,
      puzzleState: state.status,
      movesPlayed: state.currentMoveIndex,
      totalMoves: activePuzzle.moves.length,
    }),
    [
      state.status,
      changePuzzle,
      resetPuzzle,
      activePuzzle,
      state.hint,
      onHint,
      state.nextMove,
      state.isPlayerTurn,
      state.currentMoveIndex,
    ],
  );

  useEffect(() => {
    if (game?.history()?.length <= 0 + (activePuzzle.makeFirstMove ? 1 : 0)) {
      return;
    }
    if (game.history().length % 2 === (activePuzzle.makeFirstMove ? 0 : 1)) {
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
