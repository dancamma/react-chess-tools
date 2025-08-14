import React from "react";
import { themes } from "../../packages/react-chess-game/src/theme";
import { PlaygroundColors } from "../lib/themeTypes";

interface ThemePresetGridProps {
  activeTheme: keyof typeof themes;
  onThemeSelect: (themeName: keyof typeof themes) => void;
  colors: PlaygroundColors;
  isMobile: boolean;
}

export const ThemePresetGrid: React.FC<ThemePresetGridProps> = ({
  activeTheme,
  onThemeSelect,
  colors,
  isMobile,
}) => {
  const modernStyles = React.useMemo(
    () => ({
      card: {
        background: colors.surface,
        backdropFilter: "blur(20px)",
        border: `1px solid ${colors.border}`,
        borderRadius: "20px",
        padding: "16px",
        boxShadow: `0 20px 40px ${colors.shadow}`,
        transition: "all 0.3s ease",
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

      themePresets: {
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
        gap: "12px",
      } as React.CSSProperties,

      themePreset: (isActive: boolean) =>
        ({
          padding: "16px",
          borderRadius: "16px",
          border: `2px solid ${isActive ? colors.primary : colors.border}`,
          background: isActive
            ? `linear-gradient(135deg, ${colors.primary}20, ${colors.primary}10)`
            : colors.surface,
          cursor: "pointer",
          transition: "all 0.3s ease",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }) as React.CSSProperties,

      presetPreview: (themeName: string) => {
        const presetTheme = themes[themeName as keyof typeof themes];
        return {
          width: "100%",
          height: "60px",
          borderRadius: "8px",
          marginBottom: "8px",
          background: `linear-gradient(45deg, ${presetTheme.colors.lightSquare} 50%, ${presetTheme.colors.darkSquare} 50%)`,
          border: `2px solid ${presetTheme.colors.boardBorder || "#333"}`,
        } as React.CSSProperties;
      },
    }),
    [colors, isMobile],
  );

  return (
    <div style={modernStyles.card}>
      <h3 style={modernStyles.sectionTitle}>✨ Theme Presets</h3>
      <div
        style={modernStyles.themePresets}
        role="radiogroup"
        aria-label="Theme presets"
      >
        {Object.keys(themes).map((themeName) => (
          <button
            key={themeName}
            style={{
              ...modernStyles.themePreset(activeTheme === themeName),
              border: "none",
              outline: "none",
            }}
            onClick={() => onThemeSelect(themeName as keyof typeof themes)}
            onMouseEnter={(e) => {
              if (activeTheme !== themeName) {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = `0 12px 24px ${colors.shadow}`;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = `2px solid ${colors.primary}`;
              e.currentTarget.style.outlineOffset = "2px";
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = "none";
            }}
            role="radio"
            aria-checked={activeTheme === themeName}
            aria-label={`Select ${themeName} theme`}
            title={`Apply ${themeName} theme preset`}
          >
            <div
              style={modernStyles.presetPreview(themeName)}
              aria-hidden="true"
            />
            <div
              style={{
                fontSize: "12px",
                fontWeight: 500,
                textTransform: "capitalize",
                color: colors.text,
              }}
            >
              {themeName}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
