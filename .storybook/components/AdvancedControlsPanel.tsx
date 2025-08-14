import React from "react";
import { ChessTheme } from "../../packages/react-chess-game/src/theme";
import { PlaygroundColors } from "../lib/themeTypes";

interface AdvancedControlsPanelProps {
  theme: ChessTheme;
  onNotationChange: <K extends keyof NonNullable<ChessTheme["notation"]>>(
    field: K,
  ) => (value: NonNullable<ChessTheme["notation"]>[K]) => void;
  colors: PlaygroundColors;
  isVisible: boolean;
}

export const AdvancedControlsPanel: React.FC<AdvancedControlsPanelProps> = ({
  theme,
  onNotationChange,
  colors,
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
        width: "60px",
        height: "40px",
        borderRadius: "12px",
        border: `2px solid ${colors.border}`,
        background: "transparent",
        cursor: "pointer",
        transition: "all 0.2s ease",
      } as React.CSSProperties,
    }),
    [colors],
  );

  if (!isVisible) return null;

  return (
    <div
      style={modernStyles.controlGroup}
      role="tabpanel"
      id="panel-advanced"
      aria-labelledby="tab-advanced"
    >
      <h4 style={modernStyles.sectionTitle}>Notation</h4>
      <div style={modernStyles.controlRow}>
        <label htmlFor="show-notation-checkbox" style={modernStyles.label}>
          Show Notation
        </label>
        <input
          id="show-notation-checkbox"
          type="checkbox"
          checked={theme.notation?.show ?? true}
          onChange={(e) => onNotationChange("show")(e.target.checked)}
          style={{ transform: "scale(1.2)" }}
          aria-label="Show or hide square notation on the board"
          aria-describedby="notation-description"
        />
      </div>
      <div
        id="notation-description"
        style={{
          fontSize: "12px",
          color: colors.textSecondary,
          marginBottom: "12px",
          fontStyle: "italic",
        }}
      >
        Square notation displays coordinates like a1, b2, etc.
      </div>
      <div style={modernStyles.controlRow}>
        <label htmlFor="dark-square-text-color" style={modernStyles.label}>
          Dark Square Text
        </label>
        <input
          id="dark-square-text-color"
          style={modernStyles.colorInput}
          type="color"
          value={theme.notation?.darkSquareColor || theme.colors.darkSquare}
          onChange={(e) => onNotationChange("darkSquareColor")(e.target.value)}
          aria-label="Text color for notation on dark squares"
          title={`Dark square notation color: ${theme.notation?.darkSquareColor || theme.colors.darkSquare}`}
        />
      </div>
      <div style={modernStyles.controlRow}>
        <label htmlFor="light-square-text-color" style={modernStyles.label}>
          Light Square Text
        </label>
        <input
          id="light-square-text-color"
          style={modernStyles.colorInput}
          type="color"
          value={theme.notation?.lightSquareColor || theme.colors.lightSquare}
          onChange={(e) => onNotationChange("lightSquareColor")(e.target.value)}
          aria-label="Text color for notation on light squares"
          title={`Light square notation color: ${theme.notation?.lightSquareColor || theme.colors.lightSquare}`}
        />
      </div>
    </div>
  );
};
