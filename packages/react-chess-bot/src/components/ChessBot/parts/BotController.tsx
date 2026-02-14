/**
 * BotController - Internal component that handles bot move logic.
 *
 * This component consumes both ChessGame and Stockfish contexts to determine
 * when to make moves and execute them. It handles turn detection, delay timing,
 * race conditions, and error handling.
 *
 * Returns null (no DOM output).
 */

import { useEffect, useRef } from "react";
import { useChessGameContext } from "@react-chess-tools/react-chess-game";
import { useStockfish } from "@react-chess-tools/react-chess-stockfish";
import type { PlayAsColor, BotMove } from "../../../types";

interface BotControllerProps {
  /** The color the bot plays as */
  playAs: PlayAsColor;
  /** Minimum delay in milliseconds before making a move */
  minDelayMs: number;
  /** Maximum delay in milliseconds before making a move */
  maxDelayMs: number;
  /** Callback when thinking state changes */
  onThinkingChange: (isThinking: boolean) => void;
  /** Callback when a move is successfully completed */
  onMoveComplete: (move: BotMove) => void;
  /** Callback when bot starts thinking (before delay) */
  onBotMoveStart?: () => void;
  /** Callback when an error occurs */
  onError: (error: Error) => void;
}

/**
 * Maps PlayAsColor ("white" | "black") to chess.js Color ("w" | "b").
 */
function playAsToColor(playAs: PlayAsColor): "w" | "b" {
  return playAs === "white" ? "w" : "b";
}

/**
 * Internal controller component that manages bot move logic.
 *
 * This component:
 * - Detects when it's the bot's turn
 * - Waits for engine results (hasResults)
 * - Applies a random delay before making moves
 * - Handles race conditions when FEN changes during delay
 * - Tracks position to prevent double-moves
 */
export function BotController({
  playAs,
  minDelayMs,
  maxDelayMs,
  onThinkingChange,
  onMoveComplete,
  onBotMoveStart,
  onError,
}: BotControllerProps): null {
  const { currentFen, info: gameInfo, methods } = useChessGameContext();
  const { info: engineInfo, methods: engineMethods } = useStockfish();

  // Track the FEN position when a move was initiated to prevent double-moves
  // and handle race conditions
  const positionFenRef = useRef<string | null>(null);

  // Track if we've already moved for the current position
  const hasMovedForPositionRef = useRef(false);

  // Store timeout ID for cleanup
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // FIX F1: Keep currentFen in a ref so the timeout callback can access the latest value
  const currentFenRef = useRef(currentFen);

  // Store callbacks in refs to avoid triggering effects on callback changes
  const onThinkingChangeRef = useRef(onThinkingChange);
  const onMoveCompleteRef = useRef(onMoveComplete);
  const onBotMoveStartRef = useRef(onBotMoveStart);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onThinkingChangeRef.current = onThinkingChange;
    onMoveCompleteRef.current = onMoveComplete;
    onBotMoveStartRef.current = onBotMoveStart;
    onErrorRef.current = onError;
  });

  // FIX F1: Update currentFen ref when FEN changes
  useEffect(() => {
    currentFenRef.current = currentFen;
  }, [currentFen]);

  // FIX F3: Reset move tracking when FEN changes, but only if no pending timeout
  useEffect(() => {
    if (!timeoutRef.current) {
      hasMovedForPositionRef.current = false;
      positionFenRef.current = null;
    }
  }, [currentFen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // Main effect: attempt to make a move when conditions are met
  useEffect(() => {
    const botColor = playAsToColor(playAs);
    const isBotTurn = gameInfo.turn === botColor;
    const isGameOver = gameInfo.isGameOver;
    const hasResults = engineInfo.hasResults;
    const hasAlreadyMoved = hasMovedForPositionRef.current;

    // Conditions for making a move:
    // 1. It's the bot's turn
    // 2. Game is not over
    // 3. Engine has results
    // 4. We haven't already moved for this position
    // 5. No pending timeout
    if (
      !isBotTurn ||
      isGameOver ||
      !hasResults ||
      hasAlreadyMoved ||
      timeoutRef.current
    ) {
      return;
    }

    // Mark that we're initiating a move for this position
    hasMovedForPositionRef.current = true;
    positionFenRef.current = currentFen;

    // Signal that thinking has started
    onThinkingChangeRef.current(true);
    onBotMoveStartRef.current?.();

    // FIX F2: Ensure delay calculation doesn't produce NaN/negative values
    const effectiveMin = Math.min(minDelayMs, maxDelayMs);
    const effectiveMax = Math.max(minDelayMs, maxDelayMs);
    const delay =
      Math.floor(Math.random() * (effectiveMax - effectiveMin + 1)) +
      effectiveMin;

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;

      // FIX F1: Use ref to get the current FEN (not stale closure value)
      if (currentFenRef.current !== positionFenRef.current) {
        // Reset tracking since position changed
        hasMovedForPositionRef.current = false;
        positionFenRef.current = null;
        onThinkingChangeRef.current(false);
        return;
      }

      // Get the best move from the engine
      const bestMove = engineMethods.getBestMove();

      if (!bestMove) {
        // Engine returned null even with hasResults=true
        const error = new Error(
          "Engine returned no best move despite having results. " +
            "This may indicate an engine error or invalid position.",
        );
        console.warn("[ChessBot]", error.message);
        onErrorRef.current(error);
        onThinkingChangeRef.current(false);
        hasMovedForPositionRef.current = false;
        return;
      }

      // Attempt to make the move
      try {
        const success = methods.makeMove(bestMove.san);

        if (!success) {
          throw new Error(`makeMove returned false for move: ${bestMove.san}`);
        }

        onMoveCompleteRef.current(bestMove);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.warn("[ChessBot] Failed to make move:", error.message);
        onErrorRef.current(error);
        hasMovedForPositionRef.current = false;
      } finally {
        onThinkingChangeRef.current(false);
      }
    }, delay);
  }, [
    playAs,
    currentFen,
    gameInfo.turn,
    gameInfo.isGameOver,
    engineInfo.hasResults,
    engineMethods,
    methods,
    minDelayMs,
    maxDelayMs,
  ]);

  return null;
}
