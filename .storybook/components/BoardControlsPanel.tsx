import React from "react";
import { ChessTheme } from "../../packages/react-chess-game/src/theme";
import { PlaygroundColors } from "../lib/themeTypes";
import { checkContrastCompliance } from "../lib/colorUtils";
import { ContrastIndicator } from "./ContrastIndicator";

interface BoardControlsPanelProps {
  theme: ChessTheme;
  onColorChange: (
    field: keyof ChessTheme["colors"],
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  colors: PlaygroundColors;
  isVisible: boolean;
}

export const BoardControlsPanel: React.FC<BoardControlsPanelProps> = ({
  theme,
  onColorChange,
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
      id="panel-board"
      aria-labelledby="tab-board"
    >
      <h4 style={modernStyles.sectionTitle}>Board Colors</h4>
      <div style={modernStyles.controlRow}>
        <label htmlFor="light-square-color" style={modernStyles.label}>
          Light Square
        </label>
        <input
          id="light-square-color"
          style={modernStyles.colorInput}
          type="color"
          value={theme.colors.lightSquare}
          onChange={onColorChange("lightSquare")}
          aria-label="Light square color"
          title={`Light square color: ${theme.colors.lightSquare}`}
        />
      </div>
      <div style={modernStyles.controlRow}>
        <label htmlFor="dark-square-color" style={modernStyles.label}>
          Dark Square
        </label>
        <input
          id="dark-square-color"
          style={modernStyles.colorInput}
          type="color"
          value={theme.colors.darkSquare}
          onChange={onColorChange("darkSquare")}
          aria-label="Dark square color"
          title={`Dark square color: ${theme.colors.darkSquare}`}
        />
      </div>
      <div style={modernStyles.controlRow}>
        <label htmlFor="board-border-color" style={modernStyles.label}>
          Border
        </label>
        <input
          id="board-border-color"
          style={modernStyles.colorInput}
          type="color"
          value={theme.colors.boardBorder || "#000000"}
          onChange={onColorChange("boardBorder")}
          aria-label="Board border color"
          title={`Board border color: ${theme.colors.boardBorder || "#000000"}`}
        />
      </div>
      <div style={modernStyles.controlRow}>
        <label htmlFor="board-background-color" style={modernStyles.label}>
          Background
        </label>
        <input
          id="board-background-color"
          style={modernStyles.colorInput}
          type="color"
          value={theme.colors.boardBackground || "#ffffff"}
          onChange={onColorChange("boardBackground")}
          aria-label="Board background color"
          title={`Board background color: ${theme.colors.boardBackground || "#ffffff"}`}
        />
      </div>

      {/* Contrast Validation Section */}
      <div
        style={{
          marginTop: "20px",
          paddingTop: "16px",
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <h4 style={modernStyles.sectionTitle}>🔍 Contrast Validation</h4>
        {React.useMemo(() => {
          const lightSquareContrast = checkContrastCompliance(
            theme.notation?.lightSquareColor || "#000000",
            theme.colors.lightSquare,
          );
          const darkSquareContrast = checkContrastCompliance(
            theme.notation?.darkSquareColor || "#ffffff",
            theme.colors.darkSquare,
          );

          return (
            <>
              <ContrastIndicator
                label="Light Square Notation"
                result={lightSquareContrast}
                colors={colors}
              />
              <ContrastIndicator
                label="Dark Square Notation"
                result={darkSquareContrast}
                colors={colors}
              />
            </>
          );
        }, [
          theme.colors.lightSquare,
          theme.colors.darkSquare,
          theme.notation,
          colors,
        ])}
      </div>
    </div>
  );
};
