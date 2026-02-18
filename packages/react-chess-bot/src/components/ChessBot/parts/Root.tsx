import type { ReactNode } from "react";
import { useMemo, useRef, useState, useEffect } from "react";
import React from "react";
import { ChessStockfish } from "@react-chess-tools/react-chess-stockfish";
import type {
  StockfishConfig,
  WorkerOptions,
} from "@react-chess-tools/react-chess-stockfish";
import { useChessGameContext } from "@react-chess-tools/react-chess-game";
import { ChessBotContext } from "../../../hooks/useChessBotContext";
import { BotController } from "./BotController";
import type { PlayAsColor, BotMove, DifficultyLevel } from "../../../types";
import { DIFFICULTY_PRESETS } from "../../../utils/difficulty";

export interface RootProps {
  playAs: PlayAsColor;
  difficulty?: DifficultyLevel;
  moveDelayMs?: number;
  workerPath: string;
  onBotMoveStart?: () => void;
  onBotMoveComplete?: (move: BotMove) => void;
  onBotError?: (error: Error) => void;
  children?: ReactNode;
}

export function Root({
  playAs,
  difficulty = 5,
  moveDelayMs,
  workerPath,
  onBotMoveStart,
  onBotMoveComplete,
  onBotError,
  children,
}: RootProps): ReactNode {
  const { currentFen } = useChessGameContext();

  const [isThinking, setIsThinking] = useState(false);
  const [lastMove, setLastMove] = useState<BotMove | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const lastAnnouncedMoveRef = useRef<string | null>(null);

  if (process.env.NODE_ENV === "development") {
    if (!workerPath || workerPath.trim() === "") {
      console.warn(
        "[ChessBot] workerPath is required and should not be empty.",
      );
    }
  }

  const preset = DIFFICULTY_PRESETS[difficulty];

  const config = useMemo<StockfishConfig>(() => {
    return {
      depth: preset.depth,
      skillLevel: preset.skillLevel,
      moveTime: preset.moveTime,
      multiPV: preset.multiPV,
    };
  }, [preset]);

  const workerOptions = useMemo<WorkerOptions>(
    () => ({ workerPath }),
    [workerPath],
  );

  const contextValue = useMemo(
    () => ({
      playAs,
      difficulty,
      isThinking,
      lastMove,
      error,
    }),
    [playAs, difficulty, isThinking, lastMove, error],
  );

  const handleError = (err: Error) => {
    setError(err);
    onBotError?.(err);
  };

  const handleMoveComplete = (move: BotMove) => {
    setLastMove(move);
    setError(null);
    onBotMoveComplete?.(move);
  };

  useEffect(() => {
    if (lastMove && lastMove.san !== lastAnnouncedMoveRef.current) {
      lastAnnouncedMoveRef.current = lastMove.san;
    }
  }, [lastMove]);

  useEffect(() => {
    setError(null);
  }, [currentFen]);

  const announcementText =
    lastMove && lastMove.san !== lastAnnouncedMoveRef.current
      ? `Bot plays ${lastMove.san}`
      : null;

  return (
    <ChessBotContext.Provider value={contextValue}>
      <div
        data-thinking={isThinking ? "true" : "false"}
        data-color={playAs}
        data-difficulty={difficulty}
      >
        <ChessStockfish.Root
          fen={currentFen}
          config={config}
          workerOptions={workerOptions}
          onError={handleError}
        >
          <BotController
            playAs={playAs}
            difficulty={difficulty}
            moveDelayMs={moveDelayMs}
            onThinkingChange={setIsThinking}
            onMoveComplete={handleMoveComplete}
            onBotMoveStart={onBotMoveStart}
            onError={handleError}
          />
          {children}
        </ChessStockfish.Root>
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
    </ChessBotContext.Provider>
  );
}

Root.displayName = "ChessBot.Root";
