import { Chess } from "chess.js";
import type { Color } from "chess.js";
import type { PrincipalVariation } from "@react-chess-tools/react-chess-stockfish";

import type { BotMove } from "../types";

export function parseUciMove(uci: string): {
  from: string;
  to: string;
  promotion?: string;
} {
  const promotion = uci.slice(4) || undefined;

  return {
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion,
  };
}

export function createBotMove(
  color: Color,
  fen: string,
  depth: number,
  variation: PrincipalVariation,
): BotMove | null {
  const firstMove = variation.moves[0];

  if (!firstMove) {
    return null;
  }

  try {
    const game = new Chess(fen);
    const appliedMove = game.move(parseUciMove(firstMove.uci));

    if (!appliedMove) {
      return null;
    }

    return {
      color,
      uci: firstMove.uci,
      san: firstMove.san || appliedMove.san,
      fenBefore: fen,
      fenAfter: game.fen(),
      depth,
      evaluation: variation.evaluation ? { ...variation.evaluation } : null,
    };
  } catch {
    return null;
  }
}
