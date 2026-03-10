import type { Color } from "chess.js";
import type { PrincipalVariation } from "@react-chess-tools/react-chess-stockfish";

import type { BotVariability, BotVariabilityPreset } from "../types";

export interface ResolvedBotVariability {
  multiPV: number;
  thresholdCp: number;
  selection: "uniform" | "weighted";
  temperature: number | null;
}

export const VARIABILITY_PRESETS: Record<
  BotVariabilityPreset,
  ResolvedBotVariability
> = {
  none: {
    multiPV: 1,
    thresholdCp: 0,
    selection: "uniform",
    temperature: null,
  },
  low: {
    multiPV: 2,
    thresholdCp: 15,
    selection: "uniform",
    temperature: null,
  },
  medium: {
    multiPV: 3,
    thresholdCp: 30,
    selection: "weighted",
    temperature: 30,
  },
  high: {
    multiPV: 5,
    thresholdCp: 60,
    selection: "weighted",
    temperature: 50,
  },
};

function normalizePositiveInteger(value: number | undefined, fallback: number) {
  if (value === undefined) {
    return fallback;
  }

  const normalizedValue = Math.round(value);
  return normalizedValue > 0 ? normalizedValue : fallback;
}

export function normalizeBotVariability(
  variability: BotVariability | undefined,
): ResolvedBotVariability {
  if (!variability || typeof variability === "string") {
    return VARIABILITY_PRESETS[variability ?? "none"];
  }

  const selection = variability.selection ?? "uniform";
  const temperature =
    selection === "weighted"
      ? normalizePositiveInteger(variability.temperature, 30)
      : null;

  return {
    multiPV: normalizePositiveInteger(variability.multiPV, 1),
    thresholdCp: Math.max(0, Math.round(variability.thresholdCp ?? 0)),
    selection,
    temperature,
  };
}

interface CandidateVariation {
  variation: PrincipalVariation;
  score: number;
}

function toMoverCentipawns(value: number, color: Color): number {
  return color === "w" ? value : -value;
}

export function selectVariationForBot(
  principalVariations: PrincipalVariation[],
  color: Color,
  variability: ResolvedBotVariability,
): PrincipalVariation | null {
  const uniqueCandidates = new Map<string, PrincipalVariation>();

  for (const variation of principalVariations) {
    const firstMove = variation.moves[0];

    if (!firstMove || uniqueCandidates.has(firstMove.uci)) {
      continue;
    }

    uniqueCandidates.set(firstMove.uci, variation);
  }

  const candidates = Array.from(uniqueCandidates.values()).sort(
    (left, right) => left.rank - right.rank,
  );

  if (candidates.length === 0) {
    return null;
  }

  const bestCandidate = candidates[0];

  if (variability.multiPV <= 1 || candidates.length === 1) {
    return bestCandidate;
  }

  if (!bestCandidate.evaluation || bestCandidate.evaluation.type !== "cp") {
    return bestCandidate;
  }

  const rankedCandidates: CandidateVariation[] = [];

  for (const variation of candidates.slice(0, variability.multiPV)) {
    if (!variation.evaluation || variation.evaluation.type !== "cp") {
      return bestCandidate;
    }

    rankedCandidates.push({
      variation,
      score: toMoverCentipawns(variation.evaluation.value, color),
    });
  }

  rankedCandidates.sort(
    (left, right) =>
      right.score - left.score || left.variation.rank - right.variation.rank,
  );

  const strongestCandidate = rankedCandidates[0];
  const threshold = strongestCandidate.score - variability.thresholdCp;
  const selectableCandidates = rankedCandidates.filter(
    (candidate) => candidate.score >= threshold,
  );

  if (selectableCandidates.length <= 1) {
    return strongestCandidate.variation;
  }

  if (variability.selection === "uniform") {
    const randomIndex = Math.floor(Math.random() * selectableCandidates.length);
    return selectableCandidates[randomIndex].variation;
  }

  const temperature = variability.temperature ?? 30;

  if (temperature <= 0) {
    return strongestCandidate.variation;
  }

  const weights = selectableCandidates.map((candidate) =>
    Math.exp((candidate.score - strongestCandidate.score) / temperature),
  );
  const totalWeight = weights.reduce((sum, value) => sum + value, 0);
  let randomValue = Math.random() * totalWeight;

  for (let index = 0; index < selectableCandidates.length; index += 1) {
    randomValue -= weights[index];

    if (randomValue <= 0) {
      return selectableCandidates[index].variation;
    }
  }

  return selectableCandidates[selectableCandidates.length - 1].variation;
}
