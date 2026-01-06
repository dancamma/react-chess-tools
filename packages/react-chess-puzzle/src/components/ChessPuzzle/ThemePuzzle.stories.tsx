import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import { ChessPuzzle } from "./index";
import { defaultPuzzleTheme } from "../../theme/defaults";
import type { ChessPuzzleTheme } from "../../theme/types";

const meta = {
  title: "react-chess-puzzle/Theme/Playground",
  component: ChessPuzzle.Root,
  tags: ["theme", "puzzle"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "900px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChessPuzzle.Root>;

export default meta;

const samplePuzzle = {
  fen: "4kb1r/p2r1ppp/4qn2/1B2p1B1/4P3/1Q6/PPP2PPP/2KR4 w k - 0 1",
  moves: ["Bxd7+", "Nxd7", "Qb8+", "Nxb8", "Rd8#"],
  makeFirstMove: false,
};

// Color picker component
const ColorInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => {
  const rgbaToHex = (rgba: string): string => {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const r = parseInt(match[1]).toString(16).padStart(2, "0");
      const g = parseInt(match[2]).toString(16).padStart(2, "0");
      const b = parseInt(match[3]).toString(16).padStart(2, "0");
      return `#${r}${g}${b}`;
    }
    return value.startsWith("#") ? value : "#000000";
  };

  const hexToRgba = (hex: string, alpha: number = 0.5): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "8px",
      }}
    >
      <input
        type="color"
        value={rgbaToHex(value)}
        onChange={(e) => onChange(hexToRgba(e.target.value))}
        style={{ width: "40px", height: "30px", cursor: "pointer" }}
      />
      <span style={{ fontSize: "12px", minWidth: "100px" }}>{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ fontSize: "11px", width: "180px", padding: "4px" }}
      />
    </div>
  );
};

export const PuzzlePlayground = () => {
  const [theme, setTheme] = useState<ChessPuzzleTheme>(defaultPuzzleTheme);
  const [copied, setCopied] = useState(false);
  const [puzzleKey, setPuzzleKey] = useState(0);

  const updatePuzzleColor = (
    key: keyof ChessPuzzleTheme["puzzle"],
    value: string,
  ) => {
    setTheme((prev) => ({
      ...prev,
      puzzle: {
        ...prev.puzzle,
        [key]: value,
      },
    }));
  };

  const copyTheme = () => {
    const themeCode = `const myPuzzleTheme: PartialChessPuzzleTheme = {
  puzzle: ${JSON.stringify(theme.puzzle, null, 4)}
};`;
    navigator.clipboard.writeText(themeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetPuzzle = () => {
    setPuzzleKey((k) => k + 1);
  };

  return (
    <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
      <div style={{ flex: "1", minWidth: "300px" }}>
        <h3 style={{ marginBottom: "16px" }}>Puzzle Theme Editor</h3>

        <div style={{ marginBottom: "16px" }}>
          <strong>Puzzle Colors</strong>
          <div style={{ marginTop: "8px" }}>
            <ColorInput
              label="Success"
              value={theme.puzzle.success}
              onChange={(v) => updatePuzzleColor("success", v)}
            />
            <ColorInput
              label="Failure"
              value={theme.puzzle.failure}
              onChange={(v) => updatePuzzleColor("failure", v)}
            />
            <ColorInput
              label="Hint"
              value={theme.puzzle.hint}
              onChange={(v) => updatePuzzleColor("hint", v)}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <button
            onClick={copyTheme}
            style={{
              padding: "8px 16px",
              backgroundColor: copied ? "#4caf50" : "#2196f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {copied ? "Copied!" : "Copy Theme Code"}
          </button>
          <button
            onClick={resetPuzzle}
            style={{
              padding: "8px 16px",
              backgroundColor: "#666",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Reset Puzzle
          </button>
        </div>

        <div style={{ fontSize: "12px", color: "#666" }}>
          <p>
            <strong>How to test colors:</strong>
          </p>
          <ul style={{ paddingLeft: "16px" }}>
            <li>Click "Hint" to see the hint color</li>
            <li>Make a correct move to see success color</li>
            <li>Make a wrong move to see failure color</li>
            <li>Click "Reset" to try again</li>
          </ul>
        </div>
      </div>

      <div style={{ flex: "1", minWidth: "350px" }}>
        <h3 style={{ marginBottom: "16px" }}>Preview</h3>
        <div style={{ maxWidth: "400px" }}>
          <ChessPuzzle.Root key={puzzleKey} puzzle={samplePuzzle} theme={theme}>
            <ChessPuzzle.Board />
            <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
              <ChessPuzzle.Hint asChild>
                <button style={{ padding: "6px 12px" }}>Hint</button>
              </ChessPuzzle.Hint>
              <ChessPuzzle.Reset asChild>
                <button style={{ padding: "6px 12px" }}>Reset</button>
              </ChessPuzzle.Reset>
            </div>
          </ChessPuzzle.Root>
        </div>
        <p style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
          Solution: Bxd7+, Nxd7, Qb8+, Nxb8, Rd8#
        </p>
      </div>
    </div>
  );
};

export const PuzzleThemeExamples = () => {
  const customThemes = {
    default: defaultPuzzleTheme,
    neon: {
      ...defaultPuzzleTheme,
      puzzle: {
        success: "rgba(0, 255, 127, 0.6)",
        failure: "rgba(255, 0, 127, 0.6)",
        hint: "rgba(0, 191, 255, 0.6)",
      },
    },
    pastel: {
      ...defaultPuzzleTheme,
      puzzle: {
        success: "rgba(152, 251, 152, 0.6)",
        failure: "rgba(255, 182, 193, 0.6)",
        hint: "rgba(173, 216, 230, 0.6)",
      },
    },
  };

  return (
    <div>
      <h2 style={{ marginBottom: "24px" }}>Puzzle Theme Examples</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        {Object.entries(customThemes).map(([name, theme]) => (
          <div key={name}>
            <h4 style={{ marginBottom: "8px", textTransform: "capitalize" }}>
              {name}
            </h4>
            <ChessPuzzle.Root puzzle={samplePuzzle} theme={theme}>
              <ChessPuzzle.Board />
              <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
                <ChessPuzzle.Hint asChild>
                  <button style={{ padding: "4px 8px", fontSize: "12px" }}>
                    Hint
                  </button>
                </ChessPuzzle.Hint>
                <ChessPuzzle.Reset asChild>
                  <button style={{ padding: "4px 8px", fontSize: "12px" }}>
                    Reset
                  </button>
                </ChessPuzzle.Reset>
              </div>
            </ChessPuzzle.Root>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PartialPuzzleTheme = () => {
  // Only override puzzle colors, inherit game colors from default
  const partialTheme = {
    puzzle: {
      hint: "rgba(255, 215, 0, 0.6)", // Gold
    },
  };

  return (
    <div style={{ maxWidth: "500px" }}>
      <h3>Partial Puzzle Theme</h3>
      <p style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>
        Only override the hint color to gold. Success and failure use defaults.
      </p>
      <ChessPuzzle.Root puzzle={samplePuzzle} theme={partialTheme}>
        <ChessPuzzle.Board />
        <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
          <ChessPuzzle.Hint asChild>
            <button style={{ padding: "6px 12px" }}>Show Gold Hint</button>
          </ChessPuzzle.Hint>
          <ChessPuzzle.Reset asChild>
            <button style={{ padding: "6px 12px" }}>Reset</button>
          </ChessPuzzle.Reset>
        </div>
      </ChessPuzzle.Root>
      <details style={{ marginTop: "16px" }}>
        <summary style={{ cursor: "pointer", fontSize: "14px" }}>
          View theme code
        </summary>
        <pre
          style={{
            fontSize: "11px",
            background: "#f5f5f5",
            padding: "12px",
            overflow: "auto",
          }}
        >
          {JSON.stringify(partialTheme, null, 2)}
        </pre>
      </details>
    </div>
  );
};
