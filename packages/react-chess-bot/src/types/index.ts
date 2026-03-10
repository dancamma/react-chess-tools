import type { Color } from "chess.js";
import type {
  EngineType,
  Evaluation,
  WorkerOptions,
} from "@react-chess-tools/react-chess-stockfish";

export type BotLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface BotResolvedLevel {
  level: BotLevel;
  skillLevel: number;
  moveTimeMs: number;
  maxDepth: number;
  approximateElo: number;
  recommendedEngine: EngineType;
  supportsStandardStockfish: boolean;
}

export type BotStrength =
  | { level: BotLevel }
  | {
      custom: {
        skillLevel?: number;
        limitStrength?: boolean;
        elo?: number;
        moveTimeMs?: number;
        depth?: number;
      };
    };

export type BotVariabilityPreset = "none" | "low" | "medium" | "high";

export type BotVariability =
  | BotVariabilityPreset
  | {
      multiPV?: number;
      thresholdCp?: number;
      selection?: "uniform" | "weighted";
      temperature?: number;
    };

export type BotTiming =
  | number
  | {
      min: number;
      max: number;
    };

export type BotStatus =
  | "initializing"
  | "idle"
  | "thinking"
  | "delaying"
  | "paused"
  | "error";

export interface BotMove {
  color: Color;
  uci: string;
  san: string;
  fenBefore: string;
  fenAfter: string;
  depth: number;
  evaluation: Evaluation | null;
}

export interface BotStateSnapshot {
  color: Color;
  status: BotStatus;
  isThinking: boolean;
  isReady: boolean;
  currentFen: string;
  lastMove: BotMove | null;
  error: Error | null;
}

export interface PlayerProps {
  color: Color;
  workerOptions: WorkerOptions;
  strength?: BotStrength;
  variability?: BotVariability;
  moveDelay?: BotTiming;
  paused?: boolean;
  autoPlay?: boolean;
  onStateChange?: (state: BotStateSnapshot) => void;
  onThinkStart?: (fen: string, color: Color) => void;
  onMoveSelected?: (move: BotMove) => void;
  onMove?: (move: BotMove) => void;
  onError?: (error: Error) => void;
}
