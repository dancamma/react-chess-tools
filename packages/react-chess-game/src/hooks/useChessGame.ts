import React, { useEffect, useRef } from "react";
import { Chess, Color } from "chess.js";
import { cloneGame, getCurrentFen, getGameInfo } from "../utils/chess";
import { useOptionalChessClock } from "@react-chess-tools/react-chess-clock";
import type { TimeControlConfig } from "@react-chess-tools/react-chess-clock";

export type useChessGameProps = {
  fen?: string;
  orientation?: Color;
  /** Optional clock configuration to enable chess clock functionality */
  timeControl?: TimeControlConfig;
  /** Automatically switch the clock after each move (default: true).
   * Set to false to let players manually press the clock, mimicking real-life over-the-board play. */
  autoSwitchOnMove?: boolean;
};

export const useChessGame = ({
  fen,
  orientation: initialOrientation,
  timeControl,
  autoSwitchOnMove = true,
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
  const isLatestMove =
    currentMoveIndex === history.length - 1 || currentMoveIndex === -1;

  const info = React.useMemo(
    () => getGameInfo(game, orientation),
    [game, orientation],
  );

  const currentFen = React.useMemo(
    () => getCurrentFen(fen, game, currentMoveIndex),
    [fen, game, currentMoveIndex],
  );

  const currentPosition = game.history()[currentMoveIndex];

  const clockState = useOptionalChessClock(timeControl);

  // Keep clockState in a ref to avoid re-creating makeMove on every clock tick.
  // The clock state object is recreated on every render (especially during active
  // ticking), which would defeat the useCallback memoization.
  const clockStateRef = useRef(clockState);
  clockStateRef.current = clockState;

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

      // Access clock state via ref to avoid stale closures while keeping
      // the callback stable (not re-created on every clock tick)
      const clock = clockStateRef.current;

      // Don't allow moves after clock timeout
      if (clock && clock.timeout !== null) {
        return false;
      }

      try {
        const copy = cloneGame(game);
        copy.move(move);
        setGame(copy);
        setCurrentMoveIndex(copy.history().length - 1);

        // Auto-start clock on first move
        if (clock && clock.status === "idle") {
          clock.methods.start();
        }

        // Pause clock on game over (checked immediately after move)
        if (clock && clock.status === "running" && copy.isGameOver()) {
          clock.methods.pause();
        }

        // Auto-switch clock after a move is made if enabled
        if (autoSwitchOnMove && clock && clock.status !== "finished") {
          clock.methods.switch();
        }

        return true;
      } catch (e) {
        return false;
      }
    },
    [isLatestMove, game, autoSwitchOnMove],
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
