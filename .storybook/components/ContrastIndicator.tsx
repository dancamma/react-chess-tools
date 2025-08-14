import React from "react";
import { PlaygroundColors } from "../lib/themeTypes";
import { ContrastResult, getContrastMessage } from "../lib/colorUtils";

/**
 * Contrast Indicator Component
 * Shows WCAG compliance status for color combinations
 */
interface ContrastIndicatorProps {
  label: string;
  result: ContrastResult;
  colors: PlaygroundColors;
}

export const ContrastIndicator: React.FC<ContrastIndicatorProps> = ({
  label,
  result,
  colors,
}) => {
  const getStatusColor = (rating: ContrastResult["rating"]) => {
    switch (rating) {
      case "excellent":
        return "#059669"; // green-600
      case "good":
        return "#16a34a"; // green-500
      case "fair":
        return "#ca8a04"; // yellow-600
      case "poor":
        return "#dc2626"; // red-600
    }
  };

  const getStatusIcon = (rating: ContrastResult["rating"]) => {
    switch (rating) {
      case "excellent":
        return "✅";
      case "good":
        return "✅";
      case "fair":
        return "⚠️";
      case "poor":
        return "❌";
    }
  };

  const statusColor = getStatusColor(result.rating);
  const statusIcon = getStatusIcon(result.rating);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 12px",
        background: `${statusColor}15`,
        border: `1px solid ${statusColor}30`,
        borderRadius: "8px",
        marginBottom: "8px",
        fontSize: "13px",
      }}
    >
      <span style={{ fontWeight: 500, color: colors.text }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ color: statusColor, fontWeight: "bold" }}>
          {result.ratio}:1
        </span>
        <span style={{ fontSize: "14px" }} title={getContrastMessage(result)}>
          {statusIcon}
        </span>
      </div>
    </div>
  );
};
