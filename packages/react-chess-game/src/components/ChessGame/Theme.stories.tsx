import type { Meta } from "@storybook/react-vite";
import React, { useState, useCallback } from "react";
import { ChessGame } from "./index";
import { defaultGameTheme, themes } from "../../theme";
import type { ChessGameTheme } from "../../theme/types";
import { ColorInput, copyToClipboard, FEN_POSITIONS } from "@story-helpers";

const meta: Meta<typeof ChessGame.Root> = {
  title: "Packages/react-chess-game/Theming/Playground",
  component: ChessGame.Root,
  tags: ["theme"],
  decorators: [
    (Story) => (
      <div className="max-w-story-xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type ThemeProperty =
  | { category: "board"; key: "lightSquare" | "darkSquare"; format: "object" }
  | {
      category: "state";
      key: "lastMove" | "check" | "activeSquare" | "dropSquare";
      format: "string";
    }
  | { category: "indicators"; key: "move" | "capture"; format: "string" };

const THEME_PROPERTIES: ThemeProperty[] = [
  { category: "board", key: "lightSquare", format: "object" },
  { category: "board", key: "darkSquare", format: "object" },
  { category: "state", key: "lastMove", format: "string" },
  { category: "state", key: "check", format: "string" },
  { category: "state", key: "activeSquare", format: "string" },
  { category: "state", key: "dropSquare", format: "string" },
  { category: "indicators", key: "move", format: "string" },
  { category: "indicators", key: "capture", format: "string" },
];

// Helper to safely extract background color from theme square
const getBackgroundColor = (value: string | React.CSSProperties): string => {
  if (typeof value === "string") {
    return value;
  }
  return (value?.backgroundColor as string) || "#f0d9b5";
};

// Helper to safely extract string color from theme value
const getStringColor = (value: string | React.CSSProperties): string => {
  if (typeof value === "string") {
    return value;
  }
  return (value?.backgroundColor as string) || "";
};

// Preset display names for consistent labeling
const PRESET_NAMES: Record<string, string> = {
  default: "Default",
  lichess: "Lichess",
  chessCom: "Chess.com",
};

export const Playground = () => {
  const [theme, setTheme] = useState<ChessGameTheme>(defaultGameTheme);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  // Type-safe theme update function
  const updateTheme = useCallback((property: ThemeProperty, value: string) => {
    setTheme((prev) => {
      const newTheme = JSON.parse(JSON.stringify(prev)) as ChessGameTheme;
      const formattedValue =
        property.format === "object" ? { backgroundColor: value } : value;
      // Use type assertion through unknown for dynamic access
      const category = newTheme[property.category] as unknown as Record<
        string,
        unknown
      >;
      category[property.key] = formattedValue;
      return newTheme;
    });
  }, []);

  const themeCode = `const myTheme: ChessGameTheme = ${JSON.stringify(theme, null, 2)};`;

  const copyTheme = async () => {
    const success = await copyToClipboard(themeCode);
    if (success) {
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 3000);
    }
  };

  const loadPreset = (preset: ChessGameTheme) => {
    setTheme(preset);
  };

  // Get color value for a theme property
  const getColorValue = (property: ThemeProperty): string => {
    const category = theme[property.category] as unknown as Record<
      string,
      unknown
    >;
    const value = category[property.key];
    if (property.format === "object") {
      return getBackgroundColor(value as string | React.CSSProperties);
    }
    return getStringColor(value as string | React.CSSProperties);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top row: Preview + Controls */}
      <div className="flex gap-6 items-start">
        {/* Preview */}
        <div className="flex flex-col gap-2">
          <h3 className="text-size-sm font-semibold text-text">Preview</h3>
          <ChessGame.Root fen={FEN_POSITIONS.scholarMate} theme={theme}>
            <ChessGame.Board />
          </ChessGame.Root>
          <p className="text-size-xs text-text-muted">
            Click a piece to see move indicators
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 flex-1">
          <h3 className="text-size-sm font-semibold text-text">Colors</h3>

          <div className="p-3 bg-surface-alt rounded border border-border">
            <h4 className="text-size-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
              Load Preset
            </h4>
            <div className="flex gap-2">
              {Object.entries(themes).map(([key, preset]) => (
                <button
                  key={key}
                  className="px-2 py-1 text-size-xs rounded bg-surface border border-border hover:bg-surface-alt"
                  onClick={() => loadPreset(preset)}
                >
                  {PRESET_NAMES[key] || key}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-surface-alt rounded border border-border">
            <h4 className="text-size-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
              Board Squares
            </h4>
            <div className="space-y-2">
              {THEME_PROPERTIES.filter((p) => p.category === "board").map(
                (property) => (
                  <ColorInput
                    key={`${property.category}-${property.key}`}
                    label={property.key.replace(/([A-Z])/g, " $1").trim()}
                    value={getColorValue(property)}
                    onChange={(v) => updateTheme(property, v)}
                  />
                ),
              )}
            </div>
          </div>

          <div className="p-3 bg-surface-alt rounded border border-border">
            <h4 className="text-size-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
              State Highlights
            </h4>
            <div className="space-y-2">
              {THEME_PROPERTIES.filter((p) => p.category === "state").map(
                (property) => (
                  <ColorInput
                    key={`${property.category}-${property.key}`}
                    label={property.key.replace(/([A-Z])/g, " $1").trim()}
                    value={getColorValue(property)}
                    onChange={(v) => updateTheme(property, v)}
                  />
                ),
              )}
            </div>
          </div>

          <div className="p-3 bg-surface-alt rounded border border-border">
            <h4 className="text-size-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
              Move Indicators
            </h4>
            <div className="space-y-2">
              {THEME_PROPERTIES.filter((p) => p.category === "indicators").map(
                (property) => (
                  <ColorInput
                    key={`${property.category}-${property.key}`}
                    label={property.key.replace(/([A-Z])/g, " $1").trim()}
                    value={getColorValue(property)}
                    onChange={(v) => updateTheme(property, v)}
                  />
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Generated Code */}
      <div className="flex flex-col gap-2">
        <h3 className="text-size-sm font-semibold text-text">Generated Code</h3>
        <div className="relative">
          <pre className="text-size-xs font-mono bg-surface-alt p-4 rounded border border-border overflow-auto text-text">
            {themeCode}
          </pre>
          <button
            onClick={copyTheme}
            className={`absolute top-3 right-3 px-2 py-1 text-size-xs rounded ${
              copyError
                ? "bg-danger text-white"
                : copied
                  ? "bg-success text-white"
                  : "bg-accent text-white hover:opacity-90"
            }`}
            aria-label="Copy theme code"
          >
            {copyError ? "Failed" : copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
};
