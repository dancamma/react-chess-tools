/**
 * ChessBot compound component.
 *
 * Provides automated CPU opponents for chess games by bridging
 * react-chess-game and react-chess-stockfish.
 *
 * @example
 * ```tsx
 * import { ChessBot } from "@react-chess-tools/react-chess-bot";
 * import { ChessGame } from "@react-chess-tools/react-chess-game";
 *
 * <ChessGame.Root>
 *   <ChessBot.Root
 *     playAs="black"
 *     skillLevel={10}
 *     workerPath="/stockfish.js"
 *   >
 *     <ChessGame.Board />
 *   </ChessBot.Root>
 * </ChessGame.Root>
 * ```
 */

import { Root } from "./parts/Root";

export const ChessBot = {
  Root,
};

export type { RootProps } from "./parts/Root";
