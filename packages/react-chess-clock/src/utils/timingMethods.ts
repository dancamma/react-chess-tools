import type { NormalizedTimeControl, TimingMethod } from "../types";

/**
 * Apply Fischer increment
 * Adds the full increment amount after each move
 * @param currentTime - Current time in milliseconds
 * @param increment - Increment in milliseconds
 * @returns New time with increment added
 */
export function applyFischerIncrement(
  currentTime: number,
  increment: number,
): number {
  return currentTime + increment;
}

/**
 * Calculate time to decrement for simple delay method
 * Clock doesn't decrement during the delay period
 * @param timeSpent - Time spent in current move in milliseconds
 * @param delay - Delay in milliseconds
 * @returns Actual time to decrement (0 if within delay period)
 */
export function applySimpleDelay(timeSpent: number, delay: number): number {
  if (timeSpent <= delay) {
    return 0; // Still within delay period, no decrement
  }
  return timeSpent - delay; // Decrement actual time spent after delay
}

/**
 * Calculate Bronstein delay adjustment
 * Adds back the actual time used, up to the delay amount
 * @param currentTime - Current time in milliseconds
 * @param timeSpent - Time spent in current move in milliseconds
 * @param delay - Delay in milliseconds
 * @returns New time with Bronstein adjustment
 */
export function applyBronsteinDelay(
  currentTime: number,
  timeSpent: number,
  delay: number,
): number {
  const addBack = Math.min(timeSpent, delay);
  return currentTime + addBack;
}

/**
 * Calculate the time adjustment when switching players
 * @param timingMethod - The timing method to use
 * @param currentTime - Current time in milliseconds
 * @param timeSpent - Time spent in current move in milliseconds
 * @param config - Normalized time control config
 * @returns New time in milliseconds
 */
export function calculateSwitchAdjustment(
  timingMethod: TimingMethod,
  currentTime: number,
  timeSpent: number,
  config: NormalizedTimeControl,
): number {
  switch (timingMethod) {
    case "fischer":
      return applyFischerIncrement(currentTime, config.increment);

    case "delay":
      // For delay, the adjustment happens during ticking, not on switch
      // Just return current time (delay is handled in tick calculation)
      return currentTime;

    case "bronstein":
      return applyBronsteinDelay(currentTime, timeSpent, config.delay);

    default:
      return currentTime;
  }
}

/**
 * Calculate initial active player based on clock start mode
 * @param clockStart - Clock start mode
 * @returns Initial active player or null
 */
export function getInitialActivePlayer(
  clockStart: "delayed" | "immediate" | "manual",
): "white" | null {
  // For "immediate", white starts immediately
  // For "delayed" and "manual", no active player until first move/start
  return clockStart === "immediate" ? "white" : null;
}

/**
 * Get initial status based on clock start mode
 * @param clockStart - Clock start mode
 * @returns Initial clock status
 */
export function getInitialStatus(
  clockStart: "delayed" | "immediate" | "manual",
): "idle" | "delayed" | "running" {
  if (clockStart === "immediate") return "running";
  if (clockStart === "delayed") return "delayed";
  return "idle";
}
