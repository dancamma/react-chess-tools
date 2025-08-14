import React from "react";
import { ChessTheme } from "../../packages/react-chess-game/src/theme";
import { PlaygroundColors } from "../lib/themeTypes";

interface PieceControlsPanelProps {
  theme: ChessTheme;
  onPieceChange: (
    side: "light" | "dark",
    field: "fill" | "stroke",
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  colors: PlaygroundColors;
  isVisible: boolean;
}

export const PieceControlsPanel: React.FC<PieceControlsPanelProps> = ({
  theme,
  onPieceChange,
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
      id="panel-pieces"
      aria-labelledby="tab-pieces"
    >
      <h4 style={modernStyles.sectionTitle}>Piece Colors</h4>
      <div style={modernStyles.controlRow}>
        <label htmlFor="white-piece-fill" style={modernStyles.label}>
          White Fill
        </label>
        <input
          id="white-piece-fill"
          style={modernStyles.colorInput}
          type="color"
          value={theme.pieces?.light?.fill || "#ffffff"}
          onChange={onPieceChange("light", "fill")}
          aria-label="White pieces fill color"
          title={`White pieces fill color: ${theme.pieces?.light?.fill || "#ffffff"}`}
        />
      </div>
      <div style={modernStyles.controlRow}>
        <label htmlFor="white-piece-stroke" style={modernStyles.label}>
          White Stroke
        </label>
        <input
          id="white-piece-stroke"
          style={modernStyles.colorInput}
          type="color"
          value={theme.pieces?.light?.stroke || "#000000"}
          onChange={onPieceChange("light", "stroke")}
          aria-label="White pieces stroke color"
          title={`White pieces stroke color: ${theme.pieces?.light?.stroke || "#000000"}`}
        />
      </div>
      <div style={modernStyles.controlRow}>
        <label htmlFor="black-piece-fill" style={modernStyles.label}>
          Black Fill
        </label>
        <input
          id="black-piece-fill"
          style={modernStyles.colorInput}
          type="color"
          value={theme.pieces?.dark?.fill || "#000000"}
          onChange={onPieceChange("dark", "fill")}
          aria-label="Black pieces fill color"
          title={`Black pieces fill color: ${theme.pieces?.dark?.fill || "#000000"}`}
        />
      </div>
      <div style={modernStyles.controlRow}>
        <label htmlFor="black-piece-stroke" style={modernStyles.label}>
          Black Stroke
        </label>
        <input
          id="black-piece-stroke"
          style={modernStyles.colorInput}
          type="color"
          value={theme.pieces?.dark?.stroke || "#000000"}
          onChange={onPieceChange("dark", "stroke")}
          aria-label="Black pieces stroke color"
          title={`Black pieces stroke color: ${theme.pieces?.dark?.stroke || "#000000"}`}
        />
      </div>
    </div>
  );
};
