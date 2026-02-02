import type { NormalizedTimeControl } from "../types";
import { calculateSwitchAdjustment } from "./timingMethods";

/**
 * Calculate the new time for a player after their move ends.
 *
 * This combines:
 * 1. Delay method logic (time doesn't decrement during delay period)
 * 2. Timing method adjustments (Fischer increment, Bronstein)
 *
 * @param currentTime - Current time in milliseconds for the player
 * @param timeSpent - Time spent on the move in milliseconds
 * @param config - Normalized time control configuration
 * @returns New time in milliseconds for the player
 */
export function calculateSwitchTime(
  currentTime: number,
  timeSpent: number,
  config: NormalizedTimeControl,
): number {
  // Apply delay method logic: reduce effective elapsed by delay amount
  let effectiveElapsed = timeSpent;
  if (config.timingMethod === "delay") {
    effectiveElapsed = Math.max(0, timeSpent - config.delay);
  }

  // Decrement time, ensuring it doesn't go below zero
  let newTime = Math.max(0, currentTime - effectiveElapsed);

  // Apply timing method adjustments (Fischer increment, Bronstein)
  return calculateSwitchAdjustment(
    config.timingMethod,
    newTime,
    timeSpent,
    config,
  );
}
