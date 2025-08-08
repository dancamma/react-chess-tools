import React, { useEffect } from "react";
import { Chess, Color } from "chess.js";
import { cloneGame, getCurrentFen, getGameInfo } from "../utils/chess";

export type useChessGameProps = {
  fen?: string;
  orientation?: Color;
};

export const useChessGame = ({
  fen,
  orientation: initialOrientation,
}: useChessGameProps = {}) => {
  const [game, setGame] = React.useState(new Chess(fen));

  useEffect(() => {
    setGame(new Chess(fen));
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
    [game, currentMoveIndex],
  );

  const currentPosition = React.useMemo(
    () => game.history()[currentMoveIndex],
    [game, currentMoveIndex],
  );

  const setPosition = React.useCallback((fen: string, orientation: Color) => {
    const newGame = new Chess();
    newGame.load(fen);
    setOrientation(orientation);
    setGame(newGame);
    setCurrentMoveIndex(-1);
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
        return true;
      } catch (e) {
        return false;
      }
    },
    [isLatestMove, game],
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
  };
};
