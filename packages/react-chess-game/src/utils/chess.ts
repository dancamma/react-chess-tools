import { Chess, Color, Square } from "chess.js";
import _ from "lodash";

/**
 * Creates a clone of the given Chess.js instance. This is needed to update the state
 * of react-chessboard component
 * @param game - The Chess.js instance to clone.
 * @returns A new Chess.js instance with the same state as the original.
 */
export const cloneGame = (game: Chess) => {
  const copy = new Chess();
  copy.loadPgn(game.pgn());
  return copy;
};

/**
 * Returns an object with information about the current state of the game. This can be determined
 * using chess.js instance, but this function is provided for convenience.
 * @param game - The Chess.js instance representing the game.
 * @returns An object with information about the current state of the game.
 */

export const getGameInfo = (game: Chess, orientation: Color) => {
  const turn = game.turn();
  const isPlayerTurn = turn === orientation;
  const isOpponentTurn = !isPlayerTurn;
  const moveNumber = game.history().length;
  const lastMove = _.last(game.history({ verbose: true }));
  const isCheck = game.isCheck();
  const isCheckmate = game.isCheckmate();
  const isDraw = game.isDraw();
  const isStalemate = game.isStalemate();
  const isThreefoldRepetition = game.isThreefoldRepetition();
  const isInsufficientMaterial = game.isInsufficientMaterial();
  const isGameOver = game.isGameOver();
  const hasPlayerWon = isPlayerTurn && isGameOver && !isDraw;
  const hasPlayerLost = isOpponentTurn && isGameOver && !isDraw;
  const isDrawn = game.isDraw();
  return {
    turn,
    isPlayerTurn,
    isOpponentTurn,
    moveNumber,
    lastMove,
    isCheck,
    isCheckmate,
    isDraw,
    isStalemate,
    isThreefoldRepetition,
    isInsufficientMaterial,
    isGameOver,
    isDrawn,
    hasPlayerWon,
    hasPlayerLost,
  };
};

export type GameInfo = ReturnType<typeof getGameInfo>;

export const isLegalMove = (
  game: Chess,
  move: Parameters<Chess["move"]>[0],
) => {
  try {
    const copy = cloneGame(game);
    copy.move(move);
    return true;
  } catch (e) {
    return false;
  }
};

export const requiresPromotion = (
  game: Chess,
  move: Parameters<Chess["move"]>[0],
) => {
  const copy = cloneGame(game);
  const result = copy.move(move);

  if (result === null) {
    return false;
  }

  return result.flags.indexOf("p") !== -1;
};

export const getDestinationSquares = (game: Chess, square: Square) => {
  const moves = game.moves({ square, verbose: true });
  return moves.map((move) => move.to);
};

export const getCurrentFen = (
  fen: string | undefined,
  game: Chess,
  currentMoveIndex: number,
) => {
  const tempGame = new Chess();
  if (currentMoveIndex === -1) {
    if (fen) {
      tempGame.load(fen);
    }
  } else {
    const moves = game.history().slice(0, currentMoveIndex + 1);
    if (fen) {
      tempGame.load(fen);
    }
    moves.forEach((move) => tempGame.move(move));
  }
  return tempGame.fen();
};
