import React from "react";
import {
  themes,
  mergeThemes,
  ChessTheme,
} from "../../packages/react-chess-game/src/theme";
import {
  ThemeDraft,
  ThemePlaygroundTab,
  PlaygroundColors,
  buildThemeColors,
  buildThemePieces,
} from "../lib/themeTypes";
import { rgbToHex, parseRgba, rgbaStringFromHexAlpha } from "../lib/colorUtils";
import { ThemeErrorBoundary } from "./ThemeErrorBoundary";
import { ThemePresetGrid } from "./ThemePresetGrid";
import { TabNavigation } from "./TabNavigation";
import { BoardControlsPanel } from "./BoardControlsPanel";
import { HighlightControlsPanel } from "./HighlightControlsPanel";
import { PieceControlsPanel } from "./PieceControlsPanel";
import { AdvancedControlsPanel } from "./AdvancedControlsPanel";
import { ActionButtonsPanel } from "./ActionButtonsPanel";
import { BoardPreview } from "./BoardPreview";

/**
 * Internal Theme Playground Component
 * Core functionality without error boundary
 */
const ThemePlaygroundCore: React.FC = () => {
  const [base, setBase] = React.useState<keyof typeof themes>("classic");
  const [draft, setDraft] = React.useState<ThemeDraft>({});
  const [activeTab, setActiveTab] = React.useState<ThemePlaygroundTab>("board");
  const [isMobile, setIsMobile] = React.useState(false);
  const [copyFeedback, setCopyFeedback] = React.useState("");

  // Responsive design detection
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const baseTheme = themes[base];
  const theme = React.useMemo(() => {
    const custom: Partial<ChessTheme> = {};

    if (draft.colors) {
      custom.colors = buildThemeColors(baseTheme.colors, draft.colors);
    }

    if (draft.notation) {
      custom.notation = {
        show: draft.notation.show ?? baseTheme.notation?.show ?? true,
        darkSquareColor:
          draft.notation.darkSquareColor ??
          baseTheme.notation?.darkSquareColor ??
          baseTheme.colors.darkSquare,
        lightSquareColor:
          draft.notation.lightSquareColor ??
          baseTheme.notation?.lightSquareColor ??
          baseTheme.colors.lightSquare,
      };
    }

    if (draft.pieces) {
      custom.pieces = buildThemePieces(baseTheme.pieces, draft.pieces);
    }

    return mergeThemes(baseTheme, custom);
  }, [baseTheme, draft]);

  // Modern design system - memoized to prevent recreation on every render
  const currentColors: PlaygroundColors = React.useMemo(
    () => ({
      primary: "#3b82f6",
      primaryHover: "#2563eb",
      secondary: "#64748b",
      background: "#ffffff",
      surface: "rgba(255, 255, 255, 0.8)",
      border: "rgba(0, 0, 0, 0.1)",
      text: "#0f172a",
      textSecondary: "#64748b",
      shadow: "rgba(0, 0, 0, 0.1)",
    }),
    [],
  );

  const modernStyles = React.useMemo(
    () => ({
      container: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        color: currentColors.text,
        fontFamily: "system-ui, -apple-system, sans-serif",
        transition: "all 0.3s ease",
      } as React.CSSProperties,

      layout: {
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "500px 1fr",
        gap: isMobile ? "24px" : "32px",
        padding: isMobile ? "16px" : "16px 32px 32px 32px",
        maxWidth: "1600px",
        margin: "0 auto",
      } as React.CSSProperties,

      sidebar: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        position: isMobile ? "static" : "sticky",
        top: isMobile ? "auto" : "16px",
        alignSelf: "start",
        // Mobile-specific optimizations
        ...(isMobile && {
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
        }),
      } as React.CSSProperties,

      card: {
        background: currentColors.surface,
        backdropFilter: "blur(20px)",
        border: `1px solid ${currentColors.border}`,
        borderRadius: "20px",
        padding: "16px",
        boxShadow: `0 20px 40px ${currentColors.shadow}`,
        transition: "all 0.3s ease",
      } as React.CSSProperties,

      sectionTitle: {
        fontSize: "18px",
        fontWeight: 600,
        margin: "0 0 12px 0",
        color: currentColors.text,
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
          border: `2px solid ${isActive ? currentColors.primary : currentColors.border}`,
          background: isActive
            ? `linear-gradient(135deg, ${currentColors.primary}20, ${currentColors.primary}10)`
            : currentColors.surface,
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

      tabs: {
        display: "flex",
        borderRadius: "16px",
        background: currentColors.surface,
        padding: "4px",
        marginBottom: "12px",
        border: `1px solid ${currentColors.border}`,
      } as React.CSSProperties,

      tab: (isActive: boolean) =>
        ({
          flex: 1,
          padding: "12px 8px",
          borderRadius: "12px",
          border: "none",
          background: isActive ? currentColors.primary : "transparent",
          color: isActive ? "#ffffff" : currentColors.textSecondary,
          cursor: "pointer",
          transition: "all 0.2s ease",
          fontSize: "14px",
          fontWeight: 500,
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          minHeight: "44px",
        }) as React.CSSProperties,

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

      label: {
        fontSize: "14px",
        fontWeight: 500,
        color: currentColors.text,
        minWidth: "120px",
      } as React.CSSProperties,

      colorInput: {
        width: isMobile ? "50px" : "60px",
        height: isMobile ? "50px" : "40px",
        borderRadius: "12px",
        border: `2px solid ${currentColors.border}`,
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
        background: currentColors.border,
        outline: "none",
        appearance: "none",
        cursor: "pointer",
        // Enhanced touch targets for mobile
        ...(isMobile && {
          touchAction: "manipulation",
          minHeight: "44px",
        }),
      } as React.CSSProperties,

      actionButtons: {
        display: "flex",
        gap: "12px",
        marginTop: "12px",
      } as React.CSSProperties,

      button: (variant: "primary" | "secondary" = "secondary") =>
        ({
          flex: 1,
          padding: isMobile ? "16px 20px" : "12px 20px",
          borderRadius: "12px",
          border:
            variant === "primary"
              ? "none"
              : `1px solid ${currentColors.border}`,
          background:
            variant === "primary"
              ? currentColors.primary
              : currentColors.surface,
          color: variant === "primary" ? "#ffffff" : currentColors.text,
          cursor: "pointer",
          fontSize: isMobile ? "16px" : "14px",
          fontWeight: 500,
          transition: "all 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          backdropFilter: "blur(10px)",
          // Enhanced touch targets for mobile
          ...(isMobile && {
            minHeight: "48px",
            touchAction: "manipulation",
          }),
        }) as React.CSSProperties,

      chessboardContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
      } as React.CSSProperties,

      boardWrapper: {
        padding: isMobile ? "16px" : "32px",
        borderRadius: isMobile ? "16px" : "24px",
        background: currentColors.surface,
        backdropFilter: "blur(20px)",
        border: `1px solid ${currentColors.border}`,
        boxShadow: isMobile
          ? `0 10px 30px ${currentColors.shadow}`
          : `0 30px 60px ${currentColors.shadow}`,
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
        background: currentColors.surface,
        border: `1px solid ${currentColors.border}`,
        fontSize: "14px",
        fontFamily: "monospace",
        color: currentColors.textSecondary,
        maxWidth: "600px",
        overflow: "auto",
      } as React.CSSProperties,
    }),
    [isMobile, currentColors],
  );

  // Event handlers - memoized to prevent unnecessary re-renders
  const updateDraft = React.useCallback((newDraft: ThemeDraft) => {
    setDraft(newDraft);
  }, []);

  const setColor = React.useCallback(
    (field: keyof ChessTheme["colors"]) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        updateDraft({
          ...draft,
          colors: { ...(draft.colors || {}), [field]: value },
        });
      },
    [draft, updateDraft],
  );

  const setHighlightHex = React.useCallback(
    (field: keyof NonNullable<ChessTheme["colors"]>["highlight"]) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const hex = e.target.value;
        const current =
          draft.colors?.highlight?.[field] || theme.colors.highlight[field];
        const parsed = typeof current === "string" ? parseRgba(current) : null;
        const alpha = parsed?.a ?? 1;
        updateDraft({
          ...draft,
          colors: {
            ...(draft.colors || {}),
            highlight: {
              ...(draft.colors?.highlight || {}),
              [field]: rgbaStringFromHexAlpha(hex, alpha),
            },
          },
        });
      },
    [draft, theme, updateDraft],
  );

  const setHighlightAlpha = React.useCallback(
    (field: keyof NonNullable<ChessTheme["colors"]>["highlight"]) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const alpha = Number(e.target.value);
        const current =
          draft.colors?.highlight?.[field] || theme.colors.highlight[field];
        const parsed = typeof current === "string" ? parseRgba(current) : null;
        const hex = parsed ? rgbToHex(parsed.r, parsed.g, parsed.b) : "#000000";
        updateDraft({
          ...draft,
          colors: {
            ...(draft.colors || {}),
            highlight: {
              ...(draft.colors?.highlight || {}),
              [field]: rgbaStringFromHexAlpha(hex, alpha),
            },
          },
        });
      },
    [draft, theme, updateDraft],
  );

  const setNotation = React.useCallback(
    <K extends keyof NonNullable<ChessTheme["notation"]>>(field: K) =>
      (value: NonNullable<ChessTheme["notation"]>[K]) => {
        updateDraft({
          ...draft,
          notation: { ...(draft.notation || {}), [field]: value },
        });
      },
    [draft, updateDraft],
  );

  const setPiece = React.useCallback(
    (side: "light" | "dark", field: "fill" | "stroke") =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        updateDraft({
          ...draft,
          pieces: {
            ...(draft.pieces || {}),
            [side]: { ...(draft.pieces || {})[side], [field]: value },
          },
        });
      },
    [draft, updateDraft],
  );

  const exportTheme = React.useCallback(() => {
    const data = JSON.stringify(theme, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chess-theme-${theme.name.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [theme]);

  const copyThemeCode = React.useCallback(async () => {
    try {
      const code = `const customTheme: ChessTheme = ${JSON.stringify(theme, null, 2)};`;
      await navigator.clipboard.writeText(code);
      setCopyFeedback("✅ Copied to clipboard!");
      setTimeout(() => setCopyFeedback(""), 2000);
    } catch (error) {
      setCopyFeedback("❌ Failed to copy");
      setTimeout(() => setCopyFeedback(""), 2000);
    }
  }, [theme]);

  const resetTheme = React.useCallback(() => {
    updateDraft({});
    setBase("classic");
  }, [updateDraft]);

  return (
    <div style={modernStyles.container}>
      <div style={modernStyles.layout}>
        <div style={modernStyles.sidebar}>
          {/* Theme Presets */}
          <ThemePresetGrid
            activeTheme={base}
            onThemeSelect={setBase}
            colors={currentColors}
            isMobile={isMobile}
          />

          {/* Control Tabs */}
          <div style={modernStyles.card}>
            <TabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              colors={currentColors}
            />

            <BoardControlsPanel
              theme={theme}
              onColorChange={setColor}
              colors={currentColors}
              isVisible={activeTab === "board"}
            />

            <HighlightControlsPanel
              theme={theme}
              onHighlightHexChange={setHighlightHex}
              onHighlightAlphaChange={setHighlightAlpha}
              colors={currentColors}
              isMobile={isMobile}
              isVisible={activeTab === "highlights"}
            />

            <PieceControlsPanel
              theme={theme}
              onPieceChange={setPiece}
              colors={currentColors}
              isVisible={activeTab === "pieces"}
            />

            <AdvancedControlsPanel
              theme={theme}
              onNotationChange={setNotation}
              colors={currentColors}
              isVisible={activeTab === "advanced"}
            />
          </div>

          {/* Action Buttons */}
          <ActionButtonsPanel
            onReset={resetTheme}
            onExport={exportTheme}
            onCopy={copyThemeCode}
            copyFeedback={copyFeedback}
            colors={currentColors}
            isMobile={isMobile}
          />
        </div>

        {/* Chess Board Preview */}
        <BoardPreview
          theme={theme}
          colors={currentColors}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
};

/**
 * Theme Playground Component for Storybook
 * Provides an interactive interface for customizing chess game themes
 * Includes error boundary for graceful error handling
 */
export const ThemePlayground: React.FC = () => {
  return (
    <ThemeErrorBoundary>
      <ThemePlaygroundCore />
    </ThemeErrorBoundary>
  );
};
