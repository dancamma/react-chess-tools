/**
 * Color utility functions for theme customization
 * Used primarily in Storybook components for theme playground functionality
 */

/**
 * Clamps a number between 0 and 1
 */
export const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * Converts a color component (0-255) to hexadecimal string
 */
export const componentToHex = (c: number): string => {
  const clamped = Math.max(0, Math.min(255, Math.round(c)));
  return clamped.toString(16).padStart(2, "0");
};

/**
 * Converts RGB values to hexadecimal color string
 */
export const rgbToHex = (r: number, g: number, b: number): string =>
  `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;

/**
 * RGB color interface
 */
export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

/**
 * RGBA color interface
 */
export interface RgbaColor extends RgbColor {
  a: number;
}

/**
 * Validates if a string is a valid hex color
 */
export const isValidHexColor = (hex: string): boolean => {
  if (typeof hex !== "string") return false;
  const cleaned = hex.replace(/^#/, "");
  return /^([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(cleaned);
};

/**
 * Converts hexadecimal color string to RGB values
 * Supports both 3-digit (#fff) and 6-digit (#ffffff) hex formats
 * Enhanced with validation and error handling
 */
export const hexToRgb = (hex: string): RgbColor | null => {
  try {
    if (!hex || typeof hex !== "string") {
      console.warn(
        "hexToRgb: Invalid input - expected string, got:",
        typeof hex,
      );
      return null;
    }

    if (!isValidHexColor(hex)) {
      console.warn("hexToRgb: Invalid hex color format:", hex);
      return null;
    }

    const v = hex.replace(/^#/, "");

    if (v.length === 3) {
      const r = parseInt(v[0] + v[0], 16);
      const g = parseInt(v[1] + v[1], 16);
      const b = parseInt(v[2] + v[2], 16);

      if (isNaN(r) || isNaN(g) || isNaN(b)) {
        console.warn("hexToRgb: Failed to parse hex color:", hex);
        return null;
      }

      return { r, g, b };
    }

    if (v.length === 6) {
      const r = parseInt(v.slice(0, 2), 16);
      const g = parseInt(v.slice(2, 4), 16);
      const b = parseInt(v.slice(4, 6), 16);

      if (isNaN(r) || isNaN(g) || isNaN(b)) {
        console.warn("hexToRgb: Failed to parse hex color:", hex);
        return null;
      }

      return { r, g, b };
    }

    return null;
  } catch (error) {
    console.error("hexToRgb: Unexpected error parsing hex color:", hex, error);
    return null;
  }
};

/**
 * Validates RGB color component (0-255 range)
 */
export const isValidRgbComponent = (value: number): boolean => {
  return !isNaN(value) && value >= 0 && value <= 255;
};

/**
 * Validates alpha component (0-1 range)
 */
export const isValidAlpha = (value: number): boolean => {
  return !isNaN(value) && value >= 0 && value <= 1;
};

/**
 * Parses CSS rgba() or rgb() color string to RGBA values
 * Enhanced with validation and error handling
 */
export const parseRgba = (val: string): RgbaColor | null => {
  try {
    if (!val || typeof val !== "string") {
      console.warn(
        "parseRgba: Invalid input - expected string, got:",
        typeof val,
      );
      return null;
    }

    const m = val.match(
      /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d*\.?\d+))?\s*\)/i,
    );

    if (!m) {
      console.warn("parseRgba: Failed to parse color string:", val);
      return null;
    }

    const r = Number(m[1]);
    const g = Number(m[2]);
    const b = Number(m[3]);
    const a = typeof m[4] !== "undefined" ? Number(m[4]) : 1;

    // Validate color components
    if (
      !isValidRgbComponent(r) ||
      !isValidRgbComponent(g) ||
      !isValidRgbComponent(b)
    ) {
      console.warn("parseRgba: Invalid RGB components (must be 0-255):", {
        r,
        g,
        b,
      });
      return null;
    }

    if (!isValidAlpha(a)) {
      console.warn("parseRgba: Invalid alpha component (must be 0-1):", a);
      return null;
    }

    return { r, g, b, a: clamp01(a) };
  } catch (error) {
    console.error(
      "parseRgba: Unexpected error parsing color string:",
      val,
      error,
    );
    return null;
  }
};

/**
 * Creates an RGBA color string from hex color and alpha value
 * Enhanced with validation and fallbacks
 */
export const rgbaStringFromHexAlpha = (hex: string, alpha: number): string => {
  try {
    const rgb = hexToRgb(hex);

    if (!rgb) {
      console.warn(
        "rgbaStringFromHexAlpha: Invalid hex color, using fallback black:",
        hex,
      );
      return `rgba(0, 0, 0, ${clamp01(alpha)})`;
    }

    if (!isValidAlpha(alpha)) {
      console.warn(
        "rgbaStringFromHexAlpha: Invalid alpha value, clamping:",
        alpha,
      );
    }

    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clamp01(alpha)})`;
  } catch (error) {
    console.error(
      "rgbaStringFromHexAlpha: Unexpected error, using fallback:",
      error,
    );
    return `rgba(0, 0, 0, ${clamp01(alpha)})`;
  }
};

/**
 * Safe color parsing with fallbacks
 * Attempts multiple parsing methods and provides fallback values
 */
export const safeParseColor = (
  colorString: string,
  fallback: RgbaColor = { r: 0, g: 0, b: 0, a: 1 },
): RgbaColor => {
  try {
    // Try parsing as RGBA first
    const rgba = parseRgba(colorString);
    if (rgba) return rgba;

    // Try parsing as hex
    const rgb = hexToRgb(colorString);
    if (rgb) return { ...rgb, a: 1 };

    // Use fallback
    console.warn(
      "safeParseColor: Could not parse color, using fallback:",
      colorString,
    );
    return fallback;
  } catch (error) {
    console.error("safeParseColor: Unexpected error, using fallback:", error);
    return fallback;
  }
};

/**
 * Calculate relative luminance of a color (WCAG formula)
 */
export const calculateLuminance = (color: RgbColor): number => {
  try {
    const { r, g, b } = color;

    // Normalize RGB values to 0-1
    const normalize = (value: number) => {
      const normalized = value / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    };

    const rLum = normalize(r);
    const gLum = normalize(g);
    const bLum = normalize(b);

    // Calculate relative luminance using WCAG formula
    return 0.2126 * rLum + 0.7152 * gLum + 0.0722 * bLum;
  } catch (error) {
    console.error("calculateLuminance: Error calculating luminance:", error);
    return 0.5; // Fallback to mid-range luminance
  }
};

/**
 * Calculate contrast ratio between two colors (WCAG formula)
 */
export const calculateContrastRatio = (
  color1: RgbColor,
  color2: RgbColor,
): number => {
  try {
    const lum1 = calculateLuminance(color1);
    const lum2 = calculateLuminance(color2);

    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
  } catch (error) {
    console.error("calculateContrastRatio: Error calculating contrast:", error);
    return 1; // Fallback to minimum contrast
  }
};

/**
 * WCAG contrast compliance levels
 */
export enum WcagLevel {
  AA = "AA",
  AAA = "AAA",
}

/**
 * WCAG contrast compliance result
 */
export interface ContrastResult {
  ratio: number;
  isCompliant: boolean;
  level: WcagLevel | null;
  rating: "poor" | "fair" | "good" | "excellent";
}

/**
 * Check WCAG contrast compliance for normal text
 */
export const checkContrastCompliance = (
  foreground: string,
  background: string,
  isLargeText: boolean = false,
): ContrastResult => {
  try {
    const fgColor = safeParseColor(foreground);
    const bgColor = safeParseColor(background);

    const ratio = calculateContrastRatio(fgColor, bgColor);

    // WCAG requirements
    const minRatioAA = isLargeText ? 3 : 4.5;
    const minRatioAAA = isLargeText ? 4.5 : 7;

    let level: WcagLevel | null = null;
    let rating: ContrastResult["rating"] = "poor";

    if (ratio >= minRatioAAA) {
      level = WcagLevel.AAA;
      rating = "excellent";
    } else if (ratio >= minRatioAA) {
      level = WcagLevel.AA;
      rating = "good";
    } else if (ratio >= 3) {
      rating = "fair";
    }

    return {
      ratio: Math.round(ratio * 100) / 100,
      isCompliant: ratio >= minRatioAA,
      level,
      rating,
    };
  } catch (error) {
    console.error("checkContrastCompliance: Error checking compliance:", error);
    return {
      ratio: 1,
      isCompliant: false,
      level: null,
      rating: "poor",
    };
  }
};

/**
 * Get contrast validation message
 */
export const getContrastMessage = (result: ContrastResult): string => {
  const { ratio, level, rating } = result;

  switch (rating) {
    case "excellent":
      return `Excellent contrast (${ratio}:1) - WCAG ${level} compliant`;
    case "good":
      return `Good contrast (${ratio}:1) - WCAG ${level} compliant`;
    case "fair":
      return `Fair contrast (${ratio}:1) - May not meet WCAG standards`;
    case "poor":
      return `Poor contrast (${ratio}:1) - Does not meet WCAG standards`;
    default:
      return `Contrast ratio: ${ratio}:1`;
  }
};
