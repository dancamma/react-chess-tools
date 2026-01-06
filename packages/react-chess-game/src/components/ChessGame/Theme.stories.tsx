import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { ChessGame } from "./index";
import { defaultGameTheme, themes } from "../../theme";
import type { ChessGameTheme, PartialChessGameTheme } from "../../theme/types";

const meta = {
  title: "react-chess-game/Theme/Playground",
  component: ChessGame.Root,
  tags: ["theme"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "900px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChessGame.Root>;

export default meta;

// Color picker component
const ColorInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => {
  // Extract hex from rgba for color picker
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

// Background color picker (for board squares)
const BgColorInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => {
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
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

export const Playground = () => {
  const [theme, setTheme] = useState<ChessGameTheme>(defaultGameTheme);
  const [copied, setCopied] = useState(false);

  const updateTheme = (path: string[], value: string) => {
    setTheme((prev) => {
      const newTheme = JSON.parse(JSON.stringify(prev));
      let current: Record<string, unknown> = newTheme;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]] as Record<string, unknown>;
      }
      if (path[path.length - 2] === "board") {
        current[path[path.length - 1]] = { backgroundColor: value };
      } else {
        current[path[path.length - 1]] = value;
      }
      return newTheme;
    });
  };

  const copyTheme = () => {
    const themeCode = `const myTheme: PartialChessGameTheme = ${JSON.stringify(theme, null, 2)};`;
    navigator.clipboard.writeText(themeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadPreset = (preset: ChessGameTheme) => {
    setTheme(preset);
  };

  return (
    <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
      <div style={{ flex: "1", minWidth: "300px" }}>
        <h3 style={{ marginBottom: "16px" }}>Theme Editor</h3>

        <div style={{ marginBottom: "16px" }}>
          <strong>Load Preset:</strong>
          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <button onClick={() => loadPreset(themes.default)}>Default</button>
            <button onClick={() => loadPreset(themes.lichess)}>Lichess</button>
            <button onClick={() => loadPreset(themes.chessCom)}>
              Chess.com
            </button>
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <strong>Board Colors</strong>
          <div style={{ marginTop: "8px" }}>
            <BgColorInput
              label="Light Square"
              value={
                (theme.board.lightSquare as { backgroundColor: string })
                  .backgroundColor
              }
              onChange={(v) => updateTheme(["board", "lightSquare"], v)}
            />
            <BgColorInput
              label="Dark Square"
              value={
                (theme.board.darkSquare as { backgroundColor: string })
                  .backgroundColor
              }
              onChange={(v) => updateTheme(["board", "darkSquare"], v)}
            />
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <strong>State Colors</strong>
          <div style={{ marginTop: "8px" }}>
            <ColorInput
              label="Last Move"
              value={theme.state.lastMove}
              onChange={(v) => updateTheme(["state", "lastMove"], v)}
            />
            <ColorInput
              label="Active Square"
              value={theme.state.activeSquare}
              onChange={(v) => updateTheme(["state", "activeSquare"], v)}
            />
            <ColorInput
              label="Check"
              value={theme.state.check}
              onChange={(v) => updateTheme(["state", "check"], v)}
            />
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <strong>Indicator Colors</strong>
          <div style={{ marginTop: "8px" }}>
            <ColorInput
              label="Move Dot"
              value={theme.indicators.move}
              onChange={(v) => updateTheme(["indicators", "move"], v)}
            />
            <ColorInput
              label="Capture Ring"
              value={theme.indicators.capture}
              onChange={(v) => updateTheme(["indicators", "capture"], v)}
            />
          </div>
        </div>

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
      </div>

      <div style={{ flex: "1", minWidth: "350px" }}>
        <h3 style={{ marginBottom: "16px" }}>Preview</h3>
        <div style={{ maxWidth: "400px" }}>
          <ChessGame.Root
            fen="r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4"
            theme={theme}
          >
            <ChessGame.Board />
          </ChessGame.Root>
        </div>
        <p style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
          Click on a piece to see move indicators. The position shows a check.
        </p>
      </div>
    </div>
  );
};
