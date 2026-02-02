import type { TimeFormat } from "../types";

/**
 * Threshold for auto-format switching (in seconds)
 * Below this, show seconds with decimal; above, show mm:ss
 */
const AUTO_FORMAT_THRESHOLD = 20;

/**
 * Format milliseconds into a display string
 * @param milliseconds - Time in milliseconds
 * @param format - Format type
 * @returns Formatted time string
 */
export function formatClockTime(
  milliseconds: number,
  format: TimeFormat = "auto",
): string {
  // Clamp to zero (no negative times)
  const clampedMs = Math.max(0, milliseconds);

  // Auto format: switch to ss.d when time is low
  if (format === "auto") {
    // Use milliseconds for comparison to avoid rounding issues
    format = clampedMs < AUTO_FORMAT_THRESHOLD * 1000 ? "ss.d" : "mm:ss";
  }

  const totalSeconds = Math.ceil(clampedMs / 1000);

  switch (format) {
    case "ss.d": {
      // Show seconds with one decimal place
      const secondsWithDecimal = clampedMs / 1000;
      return secondsWithDecimal.toFixed(1);
    }

    case "mm:ss": {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }

    case "hh:mm:ss": {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }

    default:
      return String(totalSeconds);
  }
}
