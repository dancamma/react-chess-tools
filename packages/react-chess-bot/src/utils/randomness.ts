import type { Color } from "chess.js";
import type {
  PrincipalVariation,
  PVMove,
  Evaluation,
} from "@react-chess-tools/react-chess-stockfish";
import type { RandomnessLevel } from "../types";

function getMultiPVCount(randomness: RandomnessLevel): number {
  return randomness === 0 ? 1 : 5;
}

function evaluationToWinChance(evaluation: Evaluation | null): number {
  if (!evaluation) return 0.5;

  if (evaluation.type === "mate") {
    if (evaluation.value > 0) return 0.99;
    if (evaluation.value < 0) return 0.01;
    return 0.5;
  }

  const cp = evaluation.value;
  return 1 / (1 + Math.exp(-cp / 400));
}

function normalizeWinChanceForSide(
  winChance: number,
  sideToMove: Color,
): number {
  return sideToMove === "w" ? winChance : 1 - winChance;
}

function calculateWeight(
  pv: PrincipalVariation,
  randomness: RandomnessLevel,
  sideToMove: Color,
): number {
  const rawWinChance = evaluationToWinChance(pv.evaluation);
  const winChance = normalizeWinChanceForSide(rawWinChance, sideToMove);
  const decayFactor = 1 + randomness * 0.5;
  return Math.pow(winChance, decayFactor);
}

function weightedRandomSelect<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }

  return items[items.length - 1];
}

export function selectMoveWithRandomness(
  principalVariations: PrincipalVariation[],
  randomness: RandomnessLevel,
  sideToMove: Color,
): PVMove | null {
  if (principalVariations.length === 0) {
    return null;
  }

  if (randomness === 0) {
    return principalVariations[0].moves[0] ?? null;
  }

  const weights = principalVariations.map((pv) =>
    calculateWeight(pv, randomness, sideToMove),
  );

  const selectedPv = weightedRandomSelect(principalVariations, weights);
  return selectedPv.moves[0] ?? null;
}

export { getMultiPVCount };
