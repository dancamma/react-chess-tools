import React from "react";

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
  ...props
}: {
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className="px-3.5 py-1.5 text-size-sm font-medium font-sans border rounded border-border bg-surface text-text"
    {...props}
  >
    {children}
  </button>
);

export const PrimaryBtn = ({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className="px-3.5 py-1.5 text-size-sm font-medium font-sans border rounded bg-accent border-accent text-white"
    {...props}
  >
    {children}
  </button>
);

export const SuccessBtn = ({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className="py-2.5 px-5 text-size-sm font-semibold cursor-pointer border-none rounded-md bg-btn-green text-white shadow-md"
    {...props}
  >
    {children}
  </button>
);

export const HintBtn = ({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className="py-2 px-4 text-size-sm font-medium cursor-pointer border border-dashed border-text-muted rounded-md bg-transparent text-text-muted"
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
