import React from "react";
import {
  ChessGame,
  themes,
  mergeThemes,
  type ChessTheme,
} from "../../packages/react-chess-game/src";
import { parseRgba, rgbToHex, rgbaStringFromHexAlpha } from "../lib/colorUtils";

type ColorField = keyof ChessTheme["colors"];

export const ThemePlayground: React.FC = () => {
  const [baseTheme, setBaseTheme] = React.useState<string>("classic");
  const [draft, setDraft] = React.useState<Partial<ChessTheme>>({});
  const [showSpecificPieces, setShowSpecificPieces] = React.useState(false);

  const theme = React.useMemo<ChessTheme>(() => {
    const base = themes[baseTheme] ?? themes.classic;
    return mergeThemes(base, draft);
  }, [baseTheme, draft]);

  const handleBoardColorChange = React.useCallback(
    (field: Exclude<ColorField, "highlight">) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setDraft((prev) => ({
          ...prev,
          colors: { ...(prev.colors ?? {}), [field]: value },
        }));
      },
    [],
  );

  const handleNotationToggle = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      setDraft((prev) => ({
        ...prev,
        notation: { ...(prev.notation ?? {}), show: checked },
      }));
    },
    [],
  );

  const handleNotationColor = React.useCallback(
    (field: keyof NonNullable<ChessTheme["notation"]>) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setDraft((prev) => ({
          ...prev,
          notation: { ...(prev.notation ?? {}), [field]: value },
        }));
      },
    [],
  );

  // Highlight helpers
  const highlightKeys = [
    "lastMove",
    "check",
    "validMove",
    "validCapture",
  ] as const;

  const highlightParsed = React.useMemo(() => {
    const current = theme.colors.highlight;
    return highlightKeys.reduce(
      (acc, key) => {
        const parsed =
          parseRgba(current[key]) || ({ r: 0, g: 0, b: 0, a: 1 } as const);
        const hex = rgbToHex(parsed.r, parsed.g, parsed.b);
        acc[key] = { hex, alpha: parsed.a };
        return acc;
      },
      {} as Record<
        (typeof highlightKeys)[number],
        { hex: string; alpha: number }
      >,
    );
  }, [
    theme.colors.highlight.lastMove,
    theme.colors.highlight.check,
    theme.colors.highlight.validMove,
    theme.colors.highlight.validCapture,
  ]);

  const setHighlightHex = React.useCallback(
    (key: (typeof highlightKeys)[number]) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextHex = e.target.value;
        const alpha = highlightParsed[key].alpha ?? 1;
        setDraft((prev) => ({
          ...prev,
          colors: {
            ...(prev.colors ?? {}),
            highlight: {
              ...(prev.colors?.highlight ?? {}),
              [key]: rgbaStringFromHexAlpha(nextHex, alpha),
            },
          },
        }));
      },
    [highlightParsed],
  );

  const setHighlightAlpha = React.useCallback(
    (key: (typeof highlightKeys)[number]) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const alpha = Number(e.target.value);
        const hex = highlightParsed[key].hex ?? "#000000";
        setDraft((prev) => ({
          ...prev,
          colors: {
            ...(prev.colors ?? {}),
            highlight: {
              ...(prev.colors?.highlight ?? {}),
              [key]: rgbaStringFromHexAlpha(hex, alpha),
            },
          },
        }));
      },
    [highlightParsed],
  );

  // Piece helpers
  type PieceSide = "light" | "dark";
  type PieceField = "fill" | "stroke" | "background";
  const pieceKeys = [
    "wK",
    "wQ",
    "wR",
    "wB",
    "wN",
    "wP",
    "bK",
    "bQ",
    "bR",
    "bB",
    "bN",
    "bP",
  ] as const;

  const onPieceSideChange = React.useCallback(
    (side: PieceSide, field: PieceField) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setDraft((prev) => ({
          ...prev,
          pieces: {
            ...(prev.pieces ?? {}),
            [side]: { ...(prev.pieces?.[side] ?? {}), [field]: value },
          },
        }));
      },
    [],
  );

  const clearPieceSideField = React.useCallback(
    (side: PieceSide, field: PieceField) => {
      setDraft((prev) => {
        const nextPieces = { ...(prev.pieces ?? {}) } as NonNullable<
          ChessTheme["pieces"]
        >;
        const sideObj = {
          ...(nextPieces[side] as Record<string, string> | undefined),
        };
        if (sideObj && field in sideObj) {
          delete sideObj[field];
        }
        if (Object.keys(sideObj || {}).length) {
          (nextPieces as any)[side] = sideObj as any;
        } else {
          delete (nextPieces as any)[side];
        }
        return {
          ...prev,
          pieces: Object.keys(nextPieces).length
            ? (nextPieces as any)
            : undefined,
        };
      });
    },
    [],
  );

  const onSpecificPieceChange = React.useCallback(
    (key: (typeof pieceKeys)[number], field: PieceField) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setDraft((prev) => ({
          ...prev,
          pieces: {
            ...(prev.pieces ?? {}),
            specific: {
              ...(prev.pieces?.specific ?? {}),
              [key]: {
                ...(prev.pieces?.specific?.[key] ?? {}),
                [field]: value,
              },
            },
          },
        }));
      },
    [],
  );

  const clearSpecificPiece = React.useCallback(
    (key: (typeof pieceKeys)[number]) => {
      setDraft((prev) => {
        const nextPieces = { ...(prev.pieces ?? {}) } as NonNullable<
          ChessTheme["pieces"]
        >;
        const nextSpecific = { ...(nextPieces.specific ?? {}) } as Record<
          string,
          any
        >;
        delete nextSpecific[key];
        if (Object.keys(nextSpecific).length) {
          (nextPieces as any).specific = nextSpecific;
        } else {
          delete (nextPieces as any).specific;
        }
        return {
          ...prev,
          pieces: Object.keys(nextPieces).length
            ? (nextPieces as any)
            : undefined,
        };
      });
    },
    [],
  );

  const resetDraft = React.useCallback(() => setDraft({}), []);

  const container: React.CSSProperties = React.useMemo(
    () => ({
      display: "grid",
      gridTemplateColumns: "360px 1fr",
      gap: 24,
      padding: 24,
      maxWidth: 1200,
      margin: "0 auto",
      fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    }),
    [],
  );

  const card: React.CSSProperties = React.useMemo(
    () => ({
      background: "#fff",
      border: "1px solid rgba(0,0,0,.08)",
      borderRadius: 12,
      padding: 16,
      boxShadow: "0 6px 20px rgba(0,0,0,.06)",
    }),
    [],
  );

  const label: React.CSSProperties = React.useMemo(
    () => ({
      fontSize: 13,
      fontWeight: 600,
      color: "#0f172a",
      marginBottom: 6,
    }),
    [],
  );

  const row: React.CSSProperties = React.useMemo(
    () => ({
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 12,
      width: "100%",
      minWidth: 0, // allow children (like range inputs) to shrink within grid
    }),
    [],
  );

  const inputColor: React.CSSProperties = React.useMemo(
    () => ({
      width: 48,
      height: 32,
      minWidth: 48,
      borderRadius: 8,
      border: "1px solid #e2e8f0",
      flexShrink: 0, // prevent the color swatch from collapsing next to the range slider
    }),
    [],
  );

  return (
    <div style={container}>
      <div style={card}>
        <h3 style={{ margin: 0, marginBottom: 12 }}>Theme Playground</h3>

        <div style={{ ...row, marginTop: 4 }}>
          <div style={{ ...label, margin: 0, minWidth: 100 }}>Preset</div>
          <select
            value={baseTheme}
            onChange={(e) => setBaseTheme(e.target.value)}
            style={{
              padding: "6px 8px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              flex: 1,
            }}
          >
            {Object.keys(themes).map((name) => (
              <option key={name} value={name}>
                {themes[name].name || name}
              </option>
            ))}
          </select>
          <button
            onClick={resetDraft}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              cursor: "pointer",
            }}
          >
            Reset edits
          </button>
        </div>

        <hr
          style={{
            border: 0,
            borderTop: "1px solid #e2e8f0",
            margin: "12px 0",
          }}
        />

        <div style={{ marginBottom: 8, color: "#0f172a", fontWeight: 600 }}>
          Board Colors
        </div>
        <div style={row}>
          <div style={{ ...label, minWidth: 120 }}>Light square</div>
          <input
            type="color"
            value={theme.colors.lightSquare}
            onChange={handleBoardColorChange("lightSquare")}
            style={inputColor}
          />
        </div>
        <div style={row}>
          <div style={{ ...label, minWidth: 120 }}>Dark square</div>
          <input
            type="color"
            value={theme.colors.darkSquare}
            onChange={handleBoardColorChange("darkSquare")}
            style={inputColor}
          />
        </div>
        <div style={row}>
          <div style={{ ...label, minWidth: 120 }}>Border</div>
          <input
            type="color"
            value={theme.colors.boardBorder || "#000000"}
            onChange={handleBoardColorChange("boardBorder")}
            style={inputColor}
          />
        </div>
        <div style={row}>
          <div style={{ ...label, minWidth: 120 }}>Background</div>
          <input
            type="color"
            value={theme.colors.boardBackground || "#ffffff"}
            onChange={handleBoardColorChange("boardBackground")}
            style={inputColor}
          />
        </div>

        <hr
          style={{
            border: 0,
            borderTop: "1px solid #e2e8f0",
            margin: "12px 0",
          }}
        />

        <div style={{ marginBottom: 8, color: "#0f172a", fontWeight: 600 }}>
          Notation
        </div>
        <div style={row}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={theme.notation?.show ?? true}
              onChange={handleNotationToggle}
            />
            Show notation
          </label>
        </div>
        <div style={row}>
          <div style={{ ...label, minWidth: 120 }}>Light square text</div>
          <input
            type="color"
            value={theme.notation?.lightSquareColor || theme.colors.lightSquare}
            onChange={handleNotationColor("lightSquareColor")}
            style={inputColor}
          />
        </div>
        <div style={row}>
          <div style={{ ...label, minWidth: 120 }}>Dark square text</div>
          <input
            type="color"
            value={theme.notation?.darkSquareColor || theme.colors.darkSquare}
            onChange={handleNotationColor("darkSquareColor")}
            style={inputColor}
          />
        </div>

        <hr
          style={{
            border: 0,
            borderTop: "1px solid #e2e8f0",
            margin: "12px 0",
          }}
        />

        <div style={{ marginBottom: 8, color: "#0f172a", fontWeight: 600 }}>
          Highlights
        </div>
        {highlightKeys.map((key) => (
          <div key={key} style={{ marginBottom: 10 }}>
            <div style={row}>
              <div
                style={{ ...label, minWidth: 120, textTransform: "capitalize" }}
              >
                {key.replace(/([A-Z])/g, " $1")}
              </div>
              <input
                type="color"
                value={highlightParsed[key].hex}
                onChange={setHighlightHex(key)}
                style={inputColor}
              />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={highlightParsed[key].alpha}
                onChange={setHighlightAlpha(key)}
                aria-label={`${key} alpha`}
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: 12, minWidth: 36, textAlign: "right" }}>
                {Math.round(highlightParsed[key].alpha * 100)}%
              </span>
            </div>
          </div>
        ))}

        <hr
          style={{
            border: 0,
            borderTop: "1px solid #e2e8f0",
            margin: "12px 0",
          }}
        />

        <div style={{ marginBottom: 8, color: "#0f172a", fontWeight: 600 }}>
          Pieces
        </div>
        {/* Single-column layout to avoid clipping in narrow sidebar */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
          {(["light", "dark"] as const).map((side) => (
            <div
              key={side}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                padding: 12,
              }}
            >
              <div
                style={{
                  ...label,
                  marginBottom: 8,
                  textTransform: "capitalize",
                }}
              >
                {side} pieces
              </div>
              {(["fill", "stroke", "background"] as const).map((field) => {
                const defaults: Record<PieceField, string> = {
                  fill: side === "light" ? "#ffffff" : "#000000",
                  stroke: side === "light" ? "#000000" : "#ffffff",
                  background: "#ffffff",
                };
                const value =
                  draft.pieces?.[side]?.[field] ??
                  (theme.pieces as any)?.[side]?.[field] ??
                  defaults[field];
                return (
                  <div key={field} style={row}>
                    <div
                      style={{
                        ...label,
                        minWidth: 110,
                        textTransform: "capitalize",
                      }}
                    >
                      {field}
                    </div>
                    <input
                      type="color"
                      value={value}
                      onChange={onPieceSideChange(side, field)}
                      style={inputColor}
                    />
                    <button
                      type="button"
                      onClick={() => clearPieceSideField(side, field)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc",
                        cursor: "pointer",
                      }}
                    >
                      Clear
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={showSpecificPieces}
              onChange={(e) => setShowSpecificPieces(e.target.checked)}
            />
            Advanced: per-piece overrides
          </label>
        </div>

        {showSpecificPieces && (
          // Single-column advanced grid for better fit
          <div
            style={{
              marginTop: 12,
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 12,
            }}
          >
            {pieceKeys.map((key) => (
              <div
                key={key}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <div style={{ ...label, marginBottom: 8 }}>{key}</div>
                {(["fill", "stroke", "background"] as const).map((field) => {
                  const defaults: Record<PieceField, string> = {
                    fill: key[0] === "w" ? "#ffffff" : "#000000",
                    stroke: key[0] === "w" ? "#000000" : "#ffffff",
                    background: "#ffffff",
                  };
                  const value =
                    draft.pieces?.specific?.[key]?.[field] ??
                    (theme.pieces as any)?.specific?.[key]?.[field] ??
                    defaults[field];
                  return (
                    <div key={field} style={row}>
                      <div
                        style={{
                          ...label,
                          minWidth: 110,
                          textTransform: "capitalize",
                        }}
                      >
                        {field}
                      </div>
                      <input
                        type="color"
                        value={value}
                        onChange={onSpecificPieceChange(key, field)}
                        style={inputColor}
                      />
                    </div>
                  );
                })}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => clearSpecificPiece(key)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: 6,
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                      cursor: "pointer",
                    }}
                  >
                    Clear overrides
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          ...card,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: 520, maxWidth: "100%" }}>
          <ChessGame.Root theme={theme}>
            <ChessGame.Board />
          </ChessGame.Root>
        </div>
      </div>
    </div>
  );
};
