import React from "react";
import {
  ChessGame,
  type ChessGameTheme,
} from "@react-chess-tools/react-chess-game";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Input } from "../components/ui/input";

// ============================================================================
// Button Components
// ============================================================================

export const PrimaryBtn = ({
  children,
  className,
  ...props
}: {
  children?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <Button variant="default" className={className} {...props}>
    {children}
  </Button>
);

export const SecondaryBtn = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <Button variant="outline" className={className} {...props}>
    {children}
  </Button>
);

export const HintBtn = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <Button variant="outline" className={className} {...props}>
    {children}
  </Button>
);

// ============================================================================
// Badge Components
// ============================================================================

export const Kbd = ({ children }: { children: React.ReactNode }) => (
  <Badge
    variant="keyboard"
    className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-[5px] rounded-[3px] text-size-xs leading-none"
  >
    {children}
  </Badge>
);

// ============================================================================
// Alert Components
// ============================================================================

export const InfoBox = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <Alert variant="info" className={`text-center leading-relaxed ${className}`}>
    <AlertDescription className="text-xs">{children}</AlertDescription>
  </Alert>
);

// ============================================================================
// Card Components
// ============================================================================

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
  <Card className="flex flex-col items-center">
    <CardHeader className="text-center">
      <CardTitle className="text-size-md mb-1">{title}</CardTitle>
      <CardDescription className="text-size-xs">{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <BoardWrapper>
        <ChessGame.Root theme={theme} fen={fen}>
          <ChessGame.Board />
        </ChessGame.Root>
      </BoardWrapper>
    </CardContent>
  </Card>
);

// ============================================================================
// Input Components
// ============================================================================

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
    if (!color) return false;
    const hexPattern = /^#([0-9A-Fa-f]{3,4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
    const rgbPattern =
      /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*(0|1|0?\.\d+))?\s*\)$/;
    if (hexPattern.test(color) || rgbPattern.test(color)) return true;
    if (typeof CSS !== "undefined" && CSS.supports) {
      return CSS.supports("color", color);
    }
    return false;
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
    if (!hex || !hex.startsWith("#") || !/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      return `rgba(0, 0, 0, ${alpha})`;
    }
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const extractAlpha = (rgba: string): number => {
    const match = rgba.match(/rgba?\([^)]+,\s*([\d.]+)\s*\)/);
    return match ? parseFloat(match[1]) : 1;
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-size-xs text-text-secondary min-w-[100px]">
        {label}
      </label>
      <input
        type="color"
        value={rgbaToHex(value)}
        onChange={(e) =>
          handleChange(hexToRgba(e.target.value, extractAlpha(value)))
        }
        className="w-8 h-8 rounded border border-border cursor-pointer"
      />
      <Input
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className={`flex-1 font-mono text-size-xs ${
          error ? "border-destructive" : ""
        }`}
        placeholder={placeholder}
      />
    </div>
  );
};

// ============================================================================
// Layout Components
// ============================================================================

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

// ============================================================================
// Clock Components
// ============================================================================

const clockVariants = {
  white: "bg-surface border-text text-text",
  black: "bg-dark border-dark text-dark-text",
} as const;

const clockSizes = {
  lg: "py-2.5 px-5 text-2xl min-w-[100px]",
  sm: "py-1.5 px-3.5 text-base",
} as const;

export const ClockDisplay = ({
  children,
  variant = "white",
  size = "lg",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof clockVariants;
  size?: keyof typeof clockSizes;
  className?: string;
}) => (
  <div
    className={`font-semibold font-mono text-center border-2 rounded-sm ${clockSizes[size]} ${clockVariants[variant]} ${className || ""}`}
  >
    {children}
  </div>
);

export const PlayPauseButton = ({
  children,
}: {
  children: React.ReactNode;
}) => <Button size="sm">{children}</Button>;

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

// ============================================================================
// FEN Positions
// ============================================================================

export const FEN_POSITIONS = {
  starting: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  italian: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
  sicilian: "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
  withMove: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2",
  scholarMate:
    "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
  whiteWinning: "3rkb1r/p2nqppp/5n2/1B2p1B1/4P3/1Q6/PPP2PPP/2KR3R w k - 0 1",
  blackWinning:
    "rnbqkbnr/1ppp1ppp/p5Q1/4p3/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 0 1",
  mateIn3: "r1b1kb1r/pppp1ppp/5q2/4n3/3KP3/2N3PN/PPP4P/R1BQ1B1R b kq - 0 1",
} as const;

// Position with a move played (for showing lastMove highlight)
export const POSITION_WITH_MOVE = FEN_POSITIONS.withMove;

// ============================================================================
// Utility Functions
// ============================================================================

// Shared clipboard utility with fallback for non-HTTPS contexts
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

// Stockfish worker path (centralized for maintainability)
export const STOCKFISH_WORKER_PATH = "/stockfish.js";
