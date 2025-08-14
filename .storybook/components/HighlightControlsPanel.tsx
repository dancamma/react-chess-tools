import React from "react";
import { ChessTheme } from "../../packages/react-chess-game/src/theme";
import { PlaygroundColors } from "../lib/themeTypes";
import { parseRgba, rgbToHex } from "../lib/colorUtils";

interface HighlightControlsPanelProps {
  theme: ChessTheme;
  onHighlightHexChange: (
    field: keyof NonNullable<ChessTheme["colors"]>["highlight"],
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onHighlightAlphaChange: (
    field: keyof NonNullable<ChessTheme["colors"]>["highlight"],
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  colors: PlaygroundColors;
  isMobile: boolean;
  isVisible: boolean;
}

export const HighlightControlsPanel: React.FC<HighlightControlsPanelProps> = ({
  theme,
  onHighlightHexChange,
  onHighlightAlphaChange,
  colors,
  isMobile,
  isVisible,
}) => {
  const modernStyles = React.useMemo(
    () => ({
      controlGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      } as React.CSSProperties,

      controlRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
      } as React.CSSProperties,

      sectionTitle: {
        fontSize: "18px",
        fontWeight: 600,
        margin: "0 0 12px 0",
        color: colors.text,
        display: "flex",
        alignItems: "center",
        gap: "8px",
      } as React.CSSProperties,

      label: {
        fontSize: "14px",
        fontWeight: 500,
        color: colors.text,
        minWidth: "120px",
      } as React.CSSProperties,

      colorInput: {
        width: isMobile ? "50px" : "60px",
        height: isMobile ? "50px" : "40px",
        borderRadius: "12px",
        border: `2px solid ${colors.border}`,
        background: "transparent",
        cursor: "pointer",
        transition: "all 0.2s ease",
        // Enhanced touch targets for mobile
        ...(isMobile && {
          minWidth: "44px",
          minHeight: "44px",
          touchAction: "manipulation",
        }),
      } as React.CSSProperties,

      rangeInput: {
        flex: 1,
        height: isMobile ? "12px" : "8px",
        borderRadius: "4px",
        background: colors.border,
        outline: "none",
        appearance: "none",
        cursor: "pointer",
        // Enhanced touch targets for mobile
        ...(isMobile && {
          touchAction: "manipulation",
          minHeight: "44px",
        }),
      } as React.CSSProperties,
    }),
    [colors, isMobile],
  );

  if (!isVisible) return null;

  return (
    <div
      style={modernStyles.controlGroup}
      role="tabpanel"
      id="panel-highlights"
      aria-labelledby="tab-highlights"
    >
      <h4 style={modernStyles.sectionTitle}>Highlight Effects</h4>
      {(["lastMove", "check", "validMove", "validCapture"] as const).map(
        (key) => {
          const current = theme.colors.highlight[key];
          // Memoize color parsing to avoid expensive calculations on every render
          const { parsed, hex } = React.useMemo(() => {
            const parsedColor = parseRgba(current) || {
              r: 0,
              g: 0,
              b: 0,
              a: 1,
            };
            const hexColor = rgbToHex(
              parsedColor.r,
              parsedColor.g,
              parsedColor.b,
            );
            return { parsed: parsedColor, hex: hexColor };
          }, [current]);
          return (
            <div key={key}>
              <div style={modernStyles.controlRow}>
                <label
                  htmlFor={`highlight-${key}-color`}
                  style={{
                    ...modernStyles.label,
                    textTransform: "capitalize",
                  }}
                >
                  {key.replace(/([A-Z])/g, " $1")}
                </label>
                <input
                  id={`highlight-${key}-color`}
                  style={modernStyles.colorInput}
                  type="color"
                  value={hex}
                  onChange={onHighlightHexChange(key)}
                  aria-label={`${key.replace(/([A-Z])/g, " $1")} highlight color`}
                  title={`${key.replace(/([A-Z])/g, " $1")} highlight color: ${hex}`}
                />
              </div>
              <div style={modernStyles.controlRow}>
                <label
                  htmlFor={`highlight-${key}-opacity`}
                  style={modernStyles.label}
                >
                  Opacity
                </label>
                <input
                  id={`highlight-${key}-opacity`}
                  style={modernStyles.rangeInput}
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={parsed.a}
                  onChange={onHighlightAlphaChange(key)}
                  aria-label={`${key.replace(/([A-Z])/g, " $1")} opacity level`}
                  aria-valuenow={Math.round(parsed.a * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuetext={`${Math.round(parsed.a * 100)}%`}
                  title={`${key.replace(/([A-Z])/g, " $1")} opacity: ${Math.round(parsed.a * 100)}%`}
                />
                <span
                  style={{
                    fontSize: "12px",
                    minWidth: "40px",
                    textAlign: "right",
                  }}
                  aria-hidden="true"
                >
                  {Math.round(parsed.a * 100)}%
                </span>
              </div>
            </div>
          );
        },
      )}
    </div>
  );
};
