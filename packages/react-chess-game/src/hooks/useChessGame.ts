import React from "react";
import { Chess, Color } from "chess.js";
import { cloneGame, getGameInfo } from "../utils/chess";

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

  const setPosition = (fen: string, orientation: Color) => {
    const newGame = new Chess();
    newGame.load(fen);
    setGame(newGame);
    setOrientation(orientation);
  };

  const makeMove = (move: Parameters<Chess["move"]>[0]): boolean => {
    try {
      const copy = cloneGame(game);
      copy.move(move);
      setGame(copy);
      return true;
    } catch (e) {
      return false;
    }
  };

  const flipBoard = () => {
    setOrientation((orientation) => (orientation === "w" ? "b" : "w"));
  };

  return {
    game,
    orientation,
    info: getGameInfo(game, orientation),
    methods: {
      makeMove,
      setPosition,
      flipBoard,
    },
  };
};
