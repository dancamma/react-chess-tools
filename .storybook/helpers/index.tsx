import React from "react";
import {
  ChessGame,
  type ChessGameTheme,
} from "@react-chess-tools/react-chess-game";

// Stockfish worker path (centralized for maintainability)
export const STOCKFISH_WORKER_PATH = "/stockfish.js";

export const CLOCK_WHITE_CLASS =
  "py-2.5 px-5 text-2xl font-semibold font-mono rounded-sm text-center min-w-[100px] bg-surface border-2 border-text text-text";

export const CLOCK_BLACK_CLASS =
  "py-2.5 px-5 text-2xl font-semibold font-mono rounded-sm text-center min-w-[100px] bg-dark border-2 border-dark text-dark-text";

export const CLOCK_DISPLAY_CLASS =
  "py-1.5 px-3.5 text-base font-semibold font-mono rounded bg-surface border-2 border-text text-text";

export const PLAY_PAUSE_BTN_CLASS =
  "px-3.5 py-1.5 text-size-sm font-medium font-sans border rounded bg-accent border-accent text-white";

export const PLAY_PAUSE_DISABLED_CLASS = "opacity-50 cursor-not-allowed";

export const ClockDisplayLabel = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <span className="text-size-xs font-semibold text-text-muted uppercase tracking-wide">
    {children}
  </span>
);

export const ClockDisplayWrapper = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col items-center gap-1">
    <ClockDisplayLabel>{label}</ClockDisplayLabel>
    {children}
  </div>
);

export const ClockPairContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => <div className="flex gap-3 justify-center items-center">{children}</div>;

export const StoryHeader = ({
  title,
  subtitle,
  fen,
}: {
  title: string;
  subtitle: string;
  fen?: string;
}) => (
  <div className="text-center">
    <h3 className="text-size-md font-semibold text-text mb-1 tracking-tight">
      {title}
    </h3>
    <p className="text-size-sm text-text-secondary m-0 leading-snug">
      {subtitle}
    </p>
    {fen && (
      <div className="font-mono text-size-xs text-text-muted bg-surface-alt p-1.5 px-2 rounded break-all leading-snug">
        {fen}
      </div>
    )}
  </div>
);

export const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-[5px] bg-kbd-bg border border-kbd-border rounded-[3px] font-mono text-size-xs font-semibold text-text leading-none">
    {children}
  </kbd>
);

export const StoryContainer = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`flex flex-col items-center gap-4 p-6 font-sans max-w-story-lg mx-auto ${className}`}
  >
    {children}
  </div>
);

export const BoardWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-md overflow-hidden shadow-board">{children}</div>
);

export const SecondaryBtn = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={`px-3.5 py-1.5 text-size-sm font-medium font-sans border rounded border-border bg-surface text-text${className ? ` ${className}` : ""}`}
    {...props}
  >
    {children}
  </button>
);

export const PrimaryBtn = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={`px-3.5 py-1.5 text-size-sm font-medium font-sans border rounded bg-accent border-accent text-white${className ? ` ${className}` : ""}`}
    {...props}
  >
    {children}
  </button>
);

export const SuccessBtn = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={`py-2.5 px-5 text-size-sm font-semibold cursor-pointer border-none rounded-md bg-btn-green text-white shadow-md${className ? ` ${className}` : ""}`}
    {...props}
  >
    {children}
  </button>
);

export const HintBtn = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={`py-2 px-4 text-size-sm font-medium cursor-pointer border border-dashed border-text-muted rounded-md bg-transparent text-text-muted${className ? ` ${className}` : ""}`}
    {...props}
  >
    {children}
  </button>
);

export const InfoBox = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`p-2.5 px-3.5 bg-info border border-info-border rounded-sm text-xs text-info-text text-center leading-relaxed ${className}`}
  >
    {children}
  </div>
);

// Shared color input component for theme playgrounds
export const ColorInput = ({
  label,
  value,
  onChange,
  placeholder = "#ffffff or rgba(...)",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => {
  const [error, setError] = React.useState(false);

  const validateColor = (color: string): boolean => {
    if (!color) return false; // Empty string is not valid
    const hexPattern = /^#([0-9A-Fa-f]{3}){1,2}$/;
    const rgbPattern =
      /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*(0|1|0?\.\d+))?\s*\)$/;
    return hexPattern.test(color) || rgbPattern.test(color);
  };

  const handleChange = (newValue: string) => {
    const isValid = validateColor(newValue);
    // Show error for invalid colors that look like they're trying to be valid
    setError(!isValid && newValue.length > 2);
    if (isValid) {
      onChange(newValue);
    }
  };

  // Extract hex from rgba for color picker
  const rgbaToHex = (rgba: string): string => {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const r = parseInt(match[1]).toString(16).padStart(2, "0");
      const g = parseInt(match[2]).toString(16).padStart(2, "0");
      const b = parseInt(match[3]).toString(16).padStart(2, "0");
      return `#${r}${g}${b}`;
    }
    return rgba.startsWith("#") ? rgba : "#000000";
  };

  const hexToRgba = (hex: string, alpha: number = 0.5): string => {
    // Validate hex format before parsing
    if (!hex || !hex.startsWith("#") || !/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      return `rgba(0, 0, 0, ${alpha})`; // Fallback to black for invalid input
    }
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-size-xs text-text-secondary min-w-[100px]">
        {label}
      </label>
      <input
        type="color"
        value={rgbaToHex(value)}
        onChange={(e) => handleChange(hexToRgba(e.target.value))}
        className="w-8 h-8 rounded border border-border cursor-pointer"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className={`flex-1 px-2 py-1 text-size-xs font-mono border rounded bg-surface text-text ${
          error ? "border-danger" : "border-border"
        }`}
        placeholder={placeholder}
      />
    </div>
  );
};

// Shared ThemeCard component for theme galleries
export const ThemeCard = ({
  title,
  description,
  theme,
  fen = POSITION_WITH_MOVE,
}: {
  title: string;
  description: string;
  theme: ChessGameTheme;
  fen?: string;
}) => (
  <div className="flex flex-col items-center gap-3 p-4 bg-surface rounded-lg border border-border">
    <div className="text-center">
      <h3 className="text-size-md font-semibold text-text mb-1">{title}</h3>
      <p className="text-size-xs text-text-muted m-0">{description}</p>
    </div>
    <BoardWrapper>
      <ChessGame.Root theme={theme} fen={fen}>
        <ChessGame.Board />
      </ChessGame.Root>
    </BoardWrapper>
  </div>
);

// Common FEN positions for reuse across stories
export const FEN_POSITIONS = {
  starting: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  italian: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
  sicilian: "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
  withMove: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2",
  scholarMate:
    "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
} as const;

// Position with a move played (for showing lastMove highlight)
export const POSITION_WITH_MOVE = FEN_POSITIONS.withMove;

// Shared clipboard utility with fallback for non-HTTPS contexts
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for non-HTTPS or unsupported browsers
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);
      return success;
    } catch {
      return false;
    }
  }
};

// Re-export stockfish helpers for convenience
export {
  EngineStatus,
  AnalysisRoot,
  VerticalEvalBar,
  HorizontalEvalBar,
  StyledEngineLines,
  EVAL_BAR_CLASS,
  HORIZONTAL_BAR_CLASS,
} from "./stockfish";
