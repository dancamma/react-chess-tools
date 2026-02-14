/**
 * ChessBot.Root - Provider component for automated chess bot play.
 *
 * This component bridges react-chess-game and react-chess-stockfish to provide
 * automated CPU opponents. It wraps ChessStockfish.Root internally and manages
 * bot state through ChessBotContext.
 *
 * Features:
 * - Configurable skill level (0-20)
 * - Random move delay for natural play feel
 * - Event callbacks for bot actions
 * - Data attributes for styling
 * - ARIA live region for accessibility
 *
 * @example
 * ```tsx
 * <ChessGame.Root>
 *   <ChessBot.Root
 *     playAs="black"
 *     skillLevel={10}
 *     workerPath="/stockfish.js"
 *     onBotMoveComplete={(move) => console.log('Bot played:', move.san)}
 *   >
 *     <ChessGame.Board />
 *   </ChessBot.Root>
 * </ChessGame.Root>
 * ```
 */

import type { ReactNode } from "react";
import { Fragment, useMemo, useRef, useState, useEffect } from "react";
// Import React for JSX compatibility (required for Jest/React Testing Library)
import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChessStockfish } from "@react-chess-tools/react-chess-stockfish";
import { useChessGameContext } from "@react-chess-tools/react-chess-game";
import { ChessBotContext } from "../../../hooks/useChessBotContext";
import { BotController } from "./BotController";
import type { PlayAsColor, BotMove } from "../../../types";
import type {
  StockfishConfig,
  WorkerOptions,
} from "@react-chess-tools/react-chess-stockfish";

/**
 * Props for the ChessBot.Root provider component.
 */
export interface RootProps {
  /** The color the bot plays as ("white" or "black") */
  playAs: PlayAsColor;
  /** Stockfish skill level (0-20). Values outside range are clamped. Default: 10 */
  skillLevel?: number;
  /** Minimum delay before making a move (ms). Default: 0 */
  minDelayMs?: number;
  /** Maximum delay before making a move (ms). Default: 1000 */
  maxDelayMs?: number;
  /** Path to the Stockfish worker JS file */
  workerPath: string;
  /** Render as the child element when using asChild */
  asChild?: boolean;
  /** Called when the bot starts thinking (before delay) */
  onBotMoveStart?: () => void;
  /** Called when the bot successfully makes a move */
  onBotMoveComplete?: (move: BotMove) => void;
  /** Called when an error occurs */
  onBotError?: (error: Error) => void;
  /** React components that consume ChessBot context */
  children?: ReactNode;
}

/**
 * Root provider component for ChessBot compound component.
 *
 * Creates a ChessBot context and wraps ChessStockfish.Root internally.
 * The BotController child component handles the actual move logic.
 *
 * @param playAs - The color the bot plays as ("white" or "black")
 * @param skillLevel - Stockfish skill level (0-20). Values outside range are clamped. Default: 10
 * @param minDelayMs - Minimum delay before making a move (ms). Default: 0
 * @param maxDelayMs - Maximum delay before making a move (ms). Default: 1000
 * @param workerPath - Path to the Stockfish worker JS file
 * @param asChild - Render as the child element when using asChild
 * @param onBotMoveStart - Called when the bot starts thinking (before delay)
 * @param onBotMoveComplete - Called when the bot successfully makes a move
 * @param onBotError - Called when an error occurs
 * @param children - React components that consume ChessBot context
 */
export function Root({
  playAs,
  skillLevel = 10,
  minDelayMs = 0,
  maxDelayMs = 1000,
  workerPath,
  asChild,
  onBotMoveStart,
  onBotMoveComplete,
  onBotError,
  children,
}: RootProps): ReactNode {
  const { currentFen } = useChessGameContext();

  // Bot state
  const [isThinking, setIsThinking] = useState(false);
  const [lastMove, setLastMove] = useState<BotMove | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Track the last announced move for accessibility
  const lastAnnouncedMoveRef = useRef<string | null>(null);

  // FIX F6: Validate workerPath is not empty
  if (process.env.NODE_ENV === "development") {
    if (!workerPath || workerPath.trim() === "") {
      console.warn(
        "[ChessBot] workerPath is required and should not be empty.",
      );
    }
  }

  // Validate and clamp skillLevel to 0-20 range
  const validatedSkillLevel = useMemo(
    () => Math.max(0, Math.min(20, skillLevel)),
    [skillLevel],
  );

  // Stockfish config with validated skill level
  const config = useMemo<StockfishConfig>(
    () => ({ skillLevel: validatedSkillLevel }),
    [validatedSkillLevel],
  );

  // Worker options
  const workerOptions = useMemo<WorkerOptions>(
    () => ({ workerPath }),
    [workerPath],
  );

  // Context value for consumers
  const contextValue = useMemo(
    () => ({
      playAs,
      isThinking,
      lastMove,
      error,
    }),
    [playAs, isThinking, lastMove, error],
  );

  // Handle errors from engine and bot controller
  const handleError = (err: Error) => {
    setError(err);
    onBotError?.(err);
  };

  // Handle move completion
  const handleMoveComplete = (move: BotMove) => {
    setLastMove(move);
    setError(null);
    onBotMoveComplete?.(move);
  };

  // FIX F4: Update the announced move ref when lastMove changes
  useEffect(() => {
    if (lastMove && lastMove.san !== lastAnnouncedMoveRef.current) {
      lastAnnouncedMoveRef.current = lastMove.san;
    }
  }, [lastMove]);

  // FIX F5: Clear error when position changes (user made a move)
  useEffect(() => {
    setError(null);
  }, [currentFen]);

  const Comp = asChild ? Slot : Fragment;

  // FIX F4: Compute announcement text based on lastMove and ref
  const announcementText =
    lastMove && lastMove.san !== lastAnnouncedMoveRef.current
      ? `Bot plays ${lastMove.san}`
      : null;

  return (
    <ChessBotContext.Provider value={contextValue}>
      <Comp>
        <div data-thinking={isThinking ? "true" : "false"} data-color={playAs}>
          <ChessStockfish.Root
            fen={currentFen}
            config={config}
            workerOptions={workerOptions}
            onError={handleError}
          >
            <BotController
              playAs={playAs}
              minDelayMs={minDelayMs}
              maxDelayMs={maxDelayMs}
              onThinkingChange={setIsThinking}
              onMoveComplete={handleMoveComplete}
              onBotMoveStart={onBotMoveStart}
              onError={handleError}
            />
            {children}
          </ChessStockfish.Root>
          {/* Accessibility: Live region for bot move announcements */}
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            style={{
              position: "absolute",
              width: "1px",
              height: "1px",
              padding: 0,
              margin: "-1px",
              overflow: "hidden",
              clip: "rect(0, 0, 0, 0)",
              whiteSpace: "nowrap",
              border: 0,
            }}
          >
            {announcementText}
          </div>
        </div>
      </Comp>
    </ChessBotContext.Provider>
  );
}

Root.displayName = "ChessBot.Root";
