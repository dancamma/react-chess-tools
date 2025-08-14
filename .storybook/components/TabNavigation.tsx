import React from "react";
import { ThemePlaygroundTab, PlaygroundColors } from "../lib/themeTypes";

interface TabNavigationProps {
  activeTab: ThemePlaygroundTab;
  onTabChange: (tab: ThemePlaygroundTab) => void;
  colors: PlaygroundColors;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  colors,
}) => {
  const tabs = [
    { key: "board" as const, label: "Board", icon: "🏁" },
    { key: "highlights" as const, label: "Highlights", icon: "✨" },
    { key: "pieces" as const, label: "Pieces", icon: "♗" },
    { key: "advanced" as const, label: "Advanced", icon: "⚙️" },
  ];

  const modernStyles = React.useMemo(
    () => ({
      tabs: {
        display: "flex",
        borderRadius: "16px",
        background: colors.surface,
        padding: "4px",
        marginBottom: "12px",
        border: `1px solid ${colors.border}`,
      } as React.CSSProperties,

      tab: (isActive: boolean) =>
        ({
          flex: 1,
          padding: "12px 8px",
          borderRadius: "12px",
          border: "none",
          background: isActive ? colors.primary : "transparent",
          color: isActive ? "#ffffff" : colors.textSecondary,
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
    }),
    [colors],
  );

  return (
    <div
      style={modernStyles.tabs}
      role="tablist"
      aria-label="Theme customization categories"
    >
      {tabs.map(({ key, label, icon }) => (
        <button
          key={key}
          style={modernStyles.tab(activeTab === key)}
          onClick={() => onTabChange(key)}
          role="tab"
          aria-selected={activeTab === key}
          aria-controls={`panel-${key}`}
          id={`tab-${key}`}
          aria-label={`${label} customization controls`}
        >
          <span aria-hidden="true">{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
};
