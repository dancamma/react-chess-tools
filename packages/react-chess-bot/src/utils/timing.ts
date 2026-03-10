import type { BotTiming } from "../types";

export interface NormalizedBotTiming {
  min: number;
  max: number;
}

function normalizeNonNegativeInteger(value: number): number {
  return Math.max(0, Math.round(value));
}

export function normalizeBotTiming(
  timing: BotTiming | undefined,
): NormalizedBotTiming {
  if (timing === undefined) {
    return { min: 0, max: 0 };
  }

  if (typeof timing === "number") {
    const normalizedValue = normalizeNonNegativeInteger(timing);
    return { min: normalizedValue, max: normalizedValue };
  }

  const min = normalizeNonNegativeInteger(Math.min(timing.min, timing.max));
  const max = normalizeNonNegativeInteger(Math.max(timing.min, timing.max));

  return { min, max };
}

export function resolveBotDelay(timing: NormalizedBotTiming): number {
  if (timing.min === timing.max) {
    return timing.min;
  }

  return Math.round(timing.min + Math.random() * (timing.max - timing.min));
}
