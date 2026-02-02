import type {
  NormalizedTimeControl,
  SinglePeriodTimeControl,
  TimeControlConfig,
  TimeControlInput,
  TimeControlString,
} from "../types";

/**
 * Regex to match time control strings like "5+3", "10", or "0.5"
 */
const TIME_CONTROL_REGEX = /^(\d+(?:\.\d+)?)(?:\+(\d+(?:\.\d+)?))?$/;

/**
 * Parse a time control string into a SinglePeriodTimeControl object
 * @param input - Time control string (e.g., "5+3", "10")
 * @returns Parsed time control with baseTime in seconds
 * @throws Error if input is invalid
 */
export function parseTimeControlString(
  input: TimeControlString,
): SinglePeriodTimeControl {
  const match = input.match(TIME_CONTROL_REGEX);
  if (!match) {
    throw new Error(
      `Invalid time control string: "${input}". Expected format: "5+3" (minutes + increment) or "10" (minutes only)`,
    );
  }

  const minutes = parseFloat(match[1]);
  const increment = match[2] ? parseFloat(match[2]) : 0;

  // Convert minutes to seconds
  return {
    baseTime: Math.round(minutes * 60),
    increment: Math.round(increment),
  };
}

/**
 * Normalize any time control input into a NormalizedTimeControl
 * @param input - Time control string, object, or NormalizedTimeControl
 * @param timingMethod - Optional timing method (defaults to "fischer")
 * @param clockStart - Optional clock start mode (defaults to "delayed")
 * @returns Normalized time control with times in milliseconds
 */
export function normalizeTimeControl(
  input: TimeControlInput,
  timingMethod: NormalizedTimeControl["timingMethod"],
  clockStart: NormalizedTimeControl["clockStart"],
): NormalizedTimeControl {
  let parsed: SinglePeriodTimeControl;

  if (typeof input === "string") {
    parsed = parseTimeControlString(input);
  } else {
    parsed = input;
  }

  return {
    baseTime: parsed.baseTime * 1000, // Convert to milliseconds
    increment: (parsed.increment ?? 0) * 1000, // Convert to milliseconds
    delay: (parsed.delay ?? 0) * 1000, // Convert to milliseconds
    timingMethod,
    clockStart,
  };
}

/**
 * Parse complete TimeControlConfig into NormalizedTimeControl
 * @param config - Time control configuration
 * @returns Fully normalized time control
 */
export function parseTimeControlConfig(
  config: TimeControlConfig,
): NormalizedTimeControl {
  const normalized = normalizeTimeControl(
    config.time,
    config.timingMethod ?? "fischer",
    config.clockStart ?? "delayed",
  );

  return {
    ...normalized,
    whiteTimeOverride: config.whiteTime ? config.whiteTime * 1000 : undefined,
    blackTimeOverride: config.blackTime ? config.blackTime * 1000 : undefined,
  };
}

/**
 * Get initial times from a normalized time control
 * @param config - Normalized time control
 * @returns Initial times for white and black in milliseconds
 */
export function getInitialTimes(config: NormalizedTimeControl): {
  white: number;
  black: number;
} {
  return {
    white: config.whiteTimeOverride ?? config.baseTime,
    black: config.blackTimeOverride ?? config.baseTime,
  };
}
