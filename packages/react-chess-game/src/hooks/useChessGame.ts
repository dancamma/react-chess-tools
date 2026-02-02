import React, { useEffect } from "react";
import { Chess, Color } from "chess.js";
import { cloneGame, getCurrentFen, getGameInfo } from "../utils/chess";
import { useOptionalChessClock } from "@react-chess-tools/react-chess-clock";
import type { TimeControlConfig } from "@react-chess-tools/react-chess-clock";

export type useChessGameProps = {
  fen?: string;
  orientation?: Color;
  /** Optional clock configuration to enable chess clock functionality */
  timeControl?: TimeControlConfig;
};

export const useChessGame = ({
  fen,
  orientation: initialOrientation,
  timeControl,
}: useChessGameProps = {}) => {
  const [game, setGame] = React.useState(() => {
    try {
      return new Chess(fen);
    } catch (e) {
      console.error("Invalid FEN:", fen, e);
      return new Chess();
    }
  });

  useEffect(() => {
    try {
      setGame(new Chess(fen));
    } catch (e) {
      console.error("Invalid FEN:", fen, e);
      setGame(new Chess());
    }
  }, [fen]);

  const [orientation, setOrientation] = React.useState<Color>(
    initialOrientation ?? "w",
  );
  const [currentMoveIndex, setCurrentMoveIndex] = React.useState(-1);

  const history = React.useMemo(() => game.history(), [game]);
  const isLatestMove = React.useMemo(
    () => currentMoveIndex === history.length - 1 || currentMoveIndex === -1,
    [currentMoveIndex, history.length],
  );

  const info = React.useMemo(
    () => getGameInfo(game, orientation),
    [game, orientation],
  );

  const currentFen = React.useMemo(
    () => getCurrentFen(fen, game, currentMoveIndex),
    [fen, game, currentMoveIndex],
  );

  const currentPosition = React.useMemo(
    () => game.history()[currentMoveIndex],
    [game, currentMoveIndex],
  );

  const clockState = useOptionalChessClock(timeControl);

  // Auto-pause clock on game over
  useEffect(() => {
    if (!clockState) return;

    if (info.isGameOver && clockState.status === "running") {
      clockState.methods.pause();
    }
  }, [info.isGameOver, clockState]);

  const setPosition = React.useCallback((fen: string, orientation: Color) => {
    try {
      const newGame = new Chess();
      newGame.load(fen);
      setOrientation(orientation);
      setGame(newGame);
      setCurrentMoveIndex(-1);
    } catch (e) {
      console.error("Failed to load FEN:", fen, e);
    }
  }, []);

  const makeMove = React.useCallback(
    (move: Parameters<Chess["move"]>[0]): boolean => {
      // Only allow moves when we're at the latest position
      if (!isLatestMove) {
        return false;
      }

      try {
        const copy = cloneGame(game);
        copy.move(move);
        setGame(copy);
        setCurrentMoveIndex(copy.history().length - 1);

        // Switch clock after a move is made
        if (clockState?.status !== "finished") {
          clockState?.methods.switch();
        }

        return true;
      } catch (e) {
        return false;
      }
    },
    [isLatestMove, game, clockState],
  );

  const flipBoard = React.useCallback(() => {
    setOrientation((orientation) => (orientation === "w" ? "b" : "w"));
  }, []);

  const goToMove = React.useCallback(
    (moveIndex: number) => {
      if (moveIndex < -1 || moveIndex >= history.length) return;
      setCurrentMoveIndex(moveIndex);
    },
    [history.length],
  );

  const goToStart = React.useCallback(() => goToMove(-1), []);
  const goToEnd = React.useCallback(
    () => goToMove(history.length - 1),
    [history.length],
  );
  const goToPreviousMove = React.useCallback(
    () => goToMove(currentMoveIndex - 1),
    [currentMoveIndex],
  );
  const goToNextMove = React.useCallback(
    () => goToMove(currentMoveIndex + 1),
    [currentMoveIndex],
  );

  const methods = React.useMemo(
    () => ({
      makeMove,
      setPosition,
      flipBoard,
      goToMove,
      goToStart,
      goToEnd,
      goToPreviousMove,
      goToNextMove,
    }),
    [
      makeMove,
      setPosition,
      flipBoard,
      goToMove,
      goToStart,
      goToEnd,
      goToPreviousMove,
      goToNextMove,
    ],
  );

  return {
    game,
    currentFen,
    currentPosition,
    orientation,
    currentMoveIndex,
    isLatestMove,
    info,
    methods,
    clock: clockState,
  };
};
