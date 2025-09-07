import React from "react";
import { ChessGame } from "../../packages/react-chess-game/src/components/ChessGame";
import { ChessTheme } from "../../packages/react-chess-game/src/theme";
import { PlaygroundColors } from "../lib/themeTypes";

interface BoardPreviewProps {
  theme: ChessTheme;
  colors: PlaygroundColors;
  isMobile: boolean;
}

export const BoardPreview: React.FC<BoardPreviewProps> = ({
  theme,
  colors,
  isMobile,
}) => {
  const modernStyles = React.useMemo(
    () => ({
      chessboardContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
      } as React.CSSProperties,

      boardWrapper: {
        padding: isMobile ? "16px" : "32px",
        borderRadius: isMobile ? "16px" : "24px",
        background: colors.surface,
        backdropFilter: "blur(20px)",
        border: `1px solid ${colors.border}`,
        boxShadow: isMobile
          ? `0 10px 30px ${colors.shadow}`
          : `0 30px 60px ${colors.shadow}`,
        transition: "all 0.3s ease",
        // Mobile-specific optimizations
        ...(isMobile && {
          width: "100%",
          maxWidth: "400px",
          margin: "0 auto",
        }),
      } as React.CSSProperties,

      themeInfo: {
        padding: "20px",
        borderRadius: "16px",
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        fontSize: isMobile ? "12px" : "14px",
        fontFamily: "monospace",
        color: colors.textSecondary,
        maxWidth: "600px",
        overflow: "auto",
        textAlign: "center",
      } as React.CSSProperties,
    }),
    [colors, isMobile],
  );

  return (
    <div
      style={modernStyles.chessboardContainer}
      role="region"
      aria-labelledby="board-preview-heading"
    >
      <h2
        id="board-preview-heading"
        style={{
          fontSize: "18px",
          fontWeight: 600,
          margin: "0 0 16px 0",
          color: colors.text,
          textAlign: "center",
        }}
        aria-level={2}
      >
        🎨 Theme Preview
      </h2>
      <div
        style={modernStyles.boardWrapper}
        role="img"
        aria-label={`Chess board preview using ${theme.name} theme with current customizations`}
      >
        <ChessGame.Root theme={theme}>
          <ChessGame.Board />
        </ChessGame.Root>
      </div>
    </div>
  );
};
