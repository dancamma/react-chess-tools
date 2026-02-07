import type {
  NormalizedTimeControl,
  TimeControl,
  TimeControlConfig,
  TimeControlInput,
  TimeControlPhase,
  TimeControlString,
} from "../types";

/**
 * Regex to match time control strings like "5+3", "10", or "0.5"
 */
const TIME_CONTROL_REGEX = /^(\d+(?:\.\d+)?)(?:\+(\d+(?:\.\d+)?))?$/;

/**
 * Regex to match a single period in multi-period time control
 * Matches: "40/90+30", "sd/30+30", "SD/30+30", "G/30+30", "40/90"
 * Group 1: moves count (e.g., "40" in "40/90")
 * Group 2: time in minutes (e.g., "90" in "40/90+30")
 * Group 3: increment in seconds (e.g., "30" in "40/90+30")
 */
const PERIOD_REGEX =
  /^(?:(?:(\d+)|sd|g)\/)?(\d+(?:\.\d+)?)(?:\+(\d+(?:\.\d+)?))?$/i;

/**
 * Parse a time control string into a TimeControl object
 * @param input - Time control string (e.g., "5+3", "10")
 * @returns Parsed time control with baseTime in seconds
 * @throws Error if input is invalid
 */
export function parseTimeControlString(input: TimeControlString): TimeControl {
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
 * Parse a single period string into a TimeControlPhase object
 * @param periodStr - Period string (e.g., "40/90+30", "sd/30+30", "G/30")
 * @returns Parsed period with baseTime in seconds
 * @throws Error if input is invalid
 */
function parsePeriod(periodStr: string): TimeControlPhase {
  const trimmed = periodStr.trim();
  const match = trimmed.match(PERIOD_REGEX);

  if (!match) {
    throw new Error(
      `Invalid period format: "${trimmed}". Expected format: "40/90+30" or "sd/30+30"`,
    );
  }

  const [, movesStr, timeStr, incrementStr] = match;
  const moves = movesStr ? parseInt(movesStr, 10) : undefined;
  const minutes = parseFloat(timeStr);
  const increment = incrementStr ? parseFloat(incrementStr) : 0;

  return {
    baseTime: Math.round(minutes * 60),
    increment: increment > 0 ? Math.round(increment) : undefined,
    moves,
  };
}

/**
 * Parse a multi-period time control string into an array of TimeControlPhase
 * Format: "40/90+30,sd/30+30" or "40/120+30,20/60+30,g/15+30"
 *
 * Period format: [moves/]time[+increment] or [SD|G/]time[+increment]
 * - moves: Number of moves required for this period (e.g., "40" in "40/90+30")
 * - time: Time in minutes for this period (e.g., "90" in "40/90+30")
 * - increment: Increment in seconds after each move (e.g., "30" in "40/90+30")
 * - SD or G prefix: Sudden death period (no moves requirement, overrides any moves prefix)
 *
 * @param input - Multi-period time control string
 * @returns Array of TimeControlPhase with times in seconds
 * @throws Error if input is invalid
 *
 * @example
 * ```ts
 * parseMultiPeriodTimeControl("40/90+30,sd/30+30")
 * // Returns: [
 * //   { baseTime: 5400, increment: 30, moves: 40 },
 * //   { baseTime: 1800, increment: 30 }
 * // ]
 * ```
 */
export function parseMultiPeriodTimeControl(input: string): TimeControlPhase[] {
  const parts = input.split(/\s*,\s*/);

  // Note: input.split() always returns at least one element, so this is safe
  return parts.map((part) => parsePeriod(part));
}

/**
 * Normalize any time control input into a NormalizedTimeControl
 * @param input - Time control string, object, or array of periods
 * @param timingMethod - Optional timing method (defaults to "fischer")
 * @param clockStart - Optional clock start mode (defaults to "delayed")
 * @returns Normalized time control with times in milliseconds
 */
export function normalizeTimeControl(
  input: TimeControlInput,
  timingMethod: NormalizedTimeControl["timingMethod"],
  clockStart: NormalizedTimeControl["clockStart"],
): NormalizedTimeControl {
  // Handle multi-period time control
  if (Array.isArray(input)) {
    if (input.length === 0) {
      throw new Error(
        "Multi-period time control must have at least one period",
      );
    }

    // Clone the input to avoid mutating the caller's data
    // If the last period has a moves requirement, remove it (final period should be sudden death)
    // Convert all period times from seconds to milliseconds for internal consistency
    const periods: TimeControlPhase[] = input.map((period) => ({
      ...period,
      baseTime: period.baseTime * 1000,
      increment:
        period.increment !== undefined ? period.increment * 1000 : undefined,
      delay: period.delay !== undefined ? period.delay * 1000 : undefined,
    }));
    const lastPeriod = periods[periods.length - 1];
    if (lastPeriod.moves !== undefined) {
      lastPeriod.moves = undefined;
    }

    const firstPeriod = periods[0];
    return {
      baseTime: firstPeriod.baseTime,
      increment: firstPeriod.increment ?? 0,
      delay: firstPeriod.delay ?? 0,
      timingMethod,
      clockStart,
      periods,
    };
  }

  // Handle single period time control
  let parsed: TimeControl;

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
