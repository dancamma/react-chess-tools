import { useEffect, useRef } from "react";
import type { Color } from "chess.js";
import { useChessGameContext } from "@react-chess-tools/react-chess-game";
import { useStockfish } from "@react-chess-tools/react-chess-stockfish";
import type { PlayAsColor, BotMove } from "../../../types";

const DEFAULT_MOVE_DELAY_MS = 500;

interface BotControllerProps {
  playAs: PlayAsColor;
  moveDelayMs?: number;
  onThinkingChange: (isThinking: boolean) => void;
  onMoveComplete: (move: BotMove) => void;
  onBotMoveStart?: () => void;
  onError: (error: Error) => void;
}

function playAsToColor(playAs: PlayAsColor): Color {
  return playAs === "white" ? "w" : "b";
}

export function BotController({
  playAs,
  moveDelayMs = DEFAULT_MOVE_DELAY_MS,
  onThinkingChange,
  onMoveComplete,
  onBotMoveStart,
  onError,
}: BotControllerProps): null {
  const { currentFen, info: gameInfo, methods } = useChessGameContext();
  const { info: engineInfo } = useStockfish();

  const positionFenRef = useRef<string | null>(null);
  const hasMovedForPositionRef = useRef(false);
  const currentFenRef = useRef(currentFen);
  const analysisFenRef = useRef<string | null>(null);
  const prevFenRef = useRef(currentFen);

  const onThinkingChangeRef = useRef(onThinkingChange);
  const onMoveCompleteRef = useRef(onMoveComplete);
  const onBotMoveStartRef = useRef(onBotMoveStart);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onThinkingChangeRef.current = onThinkingChange;
    onMoveCompleteRef.current = onMoveComplete;
    onBotMoveStartRef.current = onBotMoveStart;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    currentFenRef.current = currentFen;
  }, [currentFen]);

  useEffect(() => {
    if (prevFenRef.current !== currentFen) {
      hasMovedForPositionRef.current = false;
      positionFenRef.current = null;
    }
    prevFenRef.current = currentFen;
  }, [currentFen]);

  useEffect(() => {
    const botColor = playAsToColor(playAs);
    const isBotTurn = gameInfo.turn === botColor;
    const isGameOver = gameInfo.isGameOver;
    const hasResults = engineInfo.hasResults;
    const isEngineDone = !engineInfo.isEngineThinking && hasResults;
    const hasAlreadyMoved = hasMovedForPositionRef.current;

    if (!isBotTurn || isGameOver || !isEngineDone || hasAlreadyMoved) {
      return;
    }

    const analyzedFen = engineInfo.analyzedFen;
    if (!analyzedFen) {
      return;
    }
    const analyzedPosition = analyzedFen.split(" ").slice(0, 2).join(" ");
    const currentPosition = currentFen.split(" ").slice(0, 2).join(" ");
    if (analyzedPosition !== currentPosition) {
      return;
    }

    hasMovedForPositionRef.current = true;
    positionFenRef.current = currentFen;
    analysisFenRef.current = currentFen;

    onThinkingChangeRef.current(true);
    onBotMoveStartRef.current?.();

    if (currentFenRef.current !== positionFenRef.current) {
      hasMovedForPositionRef.current = false;
      positionFenRef.current = null;
      analysisFenRef.current = null;
      onThinkingChangeRef.current(false);
      return;
    }

    if (analysisFenRef.current !== currentFenRef.current) {
      hasMovedForPositionRef.current = false;
      positionFenRef.current = null;
      analysisFenRef.current = null;
      onThinkingChangeRef.current(false);
      return;
    }

    const selectedMove = engineInfo.principalVariations[0]?.moves[0] ?? null;

    if (!selectedMove) {
      const error = new Error(
        "No valid move found from engine analysis. " +
          "This may indicate an engine error or invalid position.",
      );
      console.warn("[ChessBot]", error.message);
      onErrorRef.current(error);
      onThinkingChangeRef.current(false);
      hasMovedForPositionRef.current = false;
      return;
    }

    const delayTimeoutId = setTimeout(() => {
      if (currentFenRef.current !== positionFenRef.current) {
        hasMovedForPositionRef.current = false;
        positionFenRef.current = null;
        analysisFenRef.current = null;
        onThinkingChangeRef.current(false);
        return;
      }

      try {
        const success = methods.makeMove(selectedMove.san);

        if (!success) {
          throw new Error(
            `makeMove returned false for move: ${selectedMove.san}`,
          );
        }

        onMoveCompleteRef.current(selectedMove);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.warn("[ChessBot] Failed to make move:", error.message);
        onErrorRef.current(error);
        hasMovedForPositionRef.current = false;
      } finally {
        onThinkingChangeRef.current(false);
      }
    }, moveDelayMs);

    return () => {
      clearTimeout(delayTimeoutId);
      hasMovedForPositionRef.current = false;
      positionFenRef.current = null;
      analysisFenRef.current = null;
    };
  }, [
    playAs,
    moveDelayMs,
    currentFen,
    gameInfo.turn,
    gameInfo.isGameOver,
    engineInfo.hasResults,
    engineInfo.isEngineThinking,
    engineInfo.principalVariations,
    engineInfo.analyzedFen,
    methods,
  ]);

  return null;
}
