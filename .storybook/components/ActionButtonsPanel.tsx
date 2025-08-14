import React from "react";
import { PlaygroundColors } from "../lib/themeTypes";

interface ActionButtonsPanelProps {
  onUndo: () => void;
  onReset: () => void;
  onExport: () => void;
  onCopy: () => Promise<void>;
  copyFeedback: string;
  canUndo: boolean;
  colors: PlaygroundColors;
  isMobile: boolean;
}

export const ActionButtonsPanel: React.FC<ActionButtonsPanelProps> = ({
  onUndo,
  onReset,
  onExport,
  onCopy,
  copyFeedback,
  canUndo,
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
          border: variant === "primary" ? "none" : `1px solid ${colors.border}`,
          background: variant === "primary" ? colors.primary : colors.surface,
          color: variant === "primary" ? "#ffffff" : colors.text,
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
    }),
    [colors, isMobile],
  );

  return (
    <div style={modernStyles.card}>
      <div style={modernStyles.actionButtons}>
        <button
          style={modernStyles.button("secondary")}
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo last change (Ctrl+Z)"
          aria-label={`Undo last change. ${canUndo ? "Changes available to undo" : "No changes to undo"}`}
          aria-disabled={!canUndo}
        >
          ↶ Undo
        </button>
      </div>
      <div style={modernStyles.actionButtons}>
        <button
          style={modernStyles.button("secondary")}
          onClick={onReset}
          title="Reset to default theme"
          aria-label="Reset theme to default classic theme, clearing all customizations"
        >
          🔄 Reset
        </button>
        <button
          style={modernStyles.button("primary")}
          onClick={onExport}
          title="Download theme as JSON file"
          aria-label="Export current theme configuration as downloadable JSON file"
        >
          📥 Export
        </button>
      </div>
      <div style={modernStyles.actionButtons}>
        <button
          style={modernStyles.button("primary")}
          onClick={onCopy}
          title="Copy TypeScript code to clipboard"
          aria-label="Copy theme configuration as TypeScript code to clipboard"
          aria-live="polite"
          aria-atomic="true"
        >
          {copyFeedback || "📋 Copy Code"}
        </button>
      </div>
    </div>
  );
};
