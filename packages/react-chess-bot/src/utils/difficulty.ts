import type {
  PrincipalVariation,
  PVMove,
  Evaluation,
} from "@react-chess-tools/react-chess-stockfish";
import type { DifficultyLevel, DifficultyConfig } from "../types";

// Lichess AI level calibration from Fairy-Stockfish
// Source: https://github.com/lichess-org/lila/blob/master/modules/fishnet/src/main/scala/fishnet/FishnetApi.scala
//
// Fairy-Stockfish supports skill levels from -20 to +20 (vs standard Stockfish's 0-20)
// MultiPV=4 is used for levels 1-7 to enable the pick_best() randomization algorithm
// Level 8 uses MultiPV=1 for maximum strength
//
// Approximate ELO ratings:
// Level 1: ~400, Level 2: ~500, Level 3: ~800, Level 4: ~1100
// Level 5: ~1500, Level 6: ~1900, Level 7: ~2300, Level 8: ~2800+
export const DIFFICULTY_PRESETS: Record<DifficultyLevel, DifficultyConfig> = {
  1: { depth: 5, skillLevel: -9, moveTime: 50, multiPV: 4 },
  2: { depth: 5, skillLevel: -5, moveTime: 100, multiPV: 4 },
  3: { depth: 5, skillLevel: -1, moveTime: 150, multiPV: 4 },
  4: { depth: 5, skillLevel: 3, moveTime: 200, multiPV: 4 },
  5: { depth: 5, skillLevel: 7, moveTime: 300, multiPV: 4 },
  6: { depth: 8, skillLevel: 11, moveTime: 400, multiPV: 4 },
  7: { depth: 13, skillLevel: 15, moveTime: 500, multiPV: 4 },
  8: { depth: 22, skillLevel: 20, moveTime: 1000, multiPV: 1 },
};

export function getDifficultyConfig(level: DifficultyLevel): DifficultyConfig {
  return DIFFICULTY_PRESETS[level];
}

const PAWN_VALUE_CP = 100;

function evaluationToCentipawns(evaluation: Evaluation | null): number {
  if (!evaluation) return 0;
  if (evaluation.type === "cp") return evaluation.value;
  // Mate scores: convert to large centipawn values
  // Positive mate = winning, negative = losing
  // Use 10000 as base and subtract/add based on moves to mate
  const mateIn = evaluation.value;
  return mateIn > 0 ? 10000 - mateIn * 100 : -10000 - mateIn * 100;
}

// Fairy-Stockfish pick_best() algorithm from search.cpp:1889-1917
// https://github.com/fairy-stockfish/Fairy-Stockfish/blob/master/src/search.cpp
//
// The algorithm adds two components to each move's score:
// 1. Deterministic push: weaker moves (lower score) get bonus proportional to weakness
// 2. Random push: adds unpredictability based on score delta and random factor
//
// Formula: push = (weakness * (topScore - moveScore) + delta * random(0, weakness)) / 128
// Where: weakness = 120 - 2 * skillLevel
export function pickMoveWithRandomness(
  principalVariations: PrincipalVariation[],
  skillLevel: number,
): PVMove | null {
  if (principalVariations.length === 0) return null;
  if (principalVariations.length === 1) {
    return principalVariations[0].moves[0] ?? null;
  }

  const topScore = evaluationToCentipawns(principalVariations[0].evaluation);
  const worstScore = evaluationToCentipawns(
    principalVariations[principalVariations.length - 1].evaluation,
  );
  const delta = Math.min(topScore - worstScore, PAWN_VALUE_CP);
  const weakness = Math.max(0, 120 - 2 * skillLevel);

  let bestMove: PVMove | null = null;
  let maxAdjustedScore = -Infinity;

  for (const pv of principalVariations) {
    const moveScore = evaluationToCentipawns(pv.evaluation);
    const scoreDiff = topScore - moveScore;
    const deterministicPush = weakness * scoreDiff;
    const randomPush =
      delta * Math.floor(Math.random() * Math.max(1, weakness));
    const push = (deterministicPush + randomPush) / 128;
    const adjustedScore = moveScore + push;

    if (adjustedScore >= maxAdjustedScore) {
      maxAdjustedScore = adjustedScore;
      bestMove = pv.moves[0] ?? null;
    }
  }

  return bestMove;
}
