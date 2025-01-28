import React from "react";
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
  const [orientation, setOrientation] = React.useState<Color>(
    initialOrientation ?? "w",
  );
  const [currentMoveIndex, setCurrentMoveIndex] = React.useState(-1);

  const history = React.useMemo(() => game.history(), [game]);
  const isLatestMove =
    currentMoveIndex === history.length - 1 || currentMoveIndex === -1;

  const setPosition = (fen: string, orientation: Color) => {
    const newGame = new Chess();
    newGame.load(fen);
    setOrientation(orientation);
    setGame(newGame);
    setCurrentMoveIndex(-1);
  };

  const makeMove = (move: Parameters<Chess["move"]>[0]): boolean => {
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
  };

  const flipBoard = () => {
    setOrientation((orientation) => (orientation === "w" ? "b" : "w"));
  };

  const goToMove = (moveIndex: number) => {
    if (moveIndex < -1 || moveIndex >= history.length) return;
    setCurrentMoveIndex(moveIndex);
  };

  const goToStart = () => goToMove(-1);
  const goToEnd = () => goToMove(history.length - 1);
  const goToPreviousMove = () => goToMove(currentMoveIndex - 1);
  const goToNextMove = () => goToMove(currentMoveIndex + 1);

  return {
    game,
    currentFen: getCurrentFen(fen, game, currentMoveIndex),
    currentPosition: game.history()[currentMoveIndex],
    orientation,
    currentMoveIndex,
    isLatestMove,
    info: getGameInfo(game, orientation),
    methods: {
      makeMove,
      setPosition,
      flipBoard,
      goToMove,
      goToStart,
      goToEnd,
      goToPreviousMove,
      goToNextMove,
    },
  };
};
