import React from "react";

import {
  ChessStockfish,
  useStockfish,
} from "@react-chess-tools/react-chess-stockfish";
import { STOCKFISH_WORKER_PATH } from "./index";

// CSS styles for Stockfish components - kept inline to ensure styles are scoped to story components
export const EVAL_BAR_CSS = `
  [data-stockfish-orientation="vertical"],
  [data-stockfish-orientation="horizontal"] {
    --eval-light: #fff;
    --eval-dark: #403d39;
    position: relative;
    overflow: hidden;
    border-radius: 4px;
    user-select: none;
  }

  [data-stockfish-fill] {
    position: absolute;
    inset: 0;
    background: var(--eval-light);
    transition: transform 0.8s ease;
  }

  [data-stockfish-eval-text] {
    display: var(--evaluation-bar-score-display, block);
    font-size: 0.72rem;
    font-weight: 600;
    line-height: 1;
    position: absolute;
    text-align: center;
    white-space: nowrap;
    width: 100%;
    z-index: 2;
  }

  [data-stockfish-orientation="vertical"][data-stockfish-perspective="w"][data-stockfish-eval-value^="-"] [data-stockfish-eval-text] {
    color: var(--eval-light);
    top: 6px;
  }

  [data-stockfish-orientation="vertical"][data-stockfish-perspective="w"]:not([data-stockfish-eval-value^="-"]) [data-stockfish-eval-text] {
    bottom: 6px;
    color: var(--eval-dark);
  }

  [data-stockfish-orientation="vertical"][data-stockfish-perspective="b"][data-stockfish-eval-value^="-"] [data-stockfish-eval-text] {
    color: var(--eval-light);
    bottom: 6px;
  }

  [data-stockfish-orientation="vertical"][data-stockfish-perspective="b"]:not([data-stockfish-eval-value^="-"]) [data-stockfish-eval-text] {
    color: var(--eval-dark);
    top: 6px;
  }

  [data-stockfish-orientation="horizontal"] [data-stockfish-eval-text] {
    padding: 0 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    width: auto;
  }

  [data-stockfish-orientation="horizontal"][data-stockfish-perspective="w"][data-stockfish-eval-value^="-"] [data-stockfish-eval-text] {
    color: var(--eval-light);
    right: 0;
  }

  [data-stockfish-orientation="horizontal"][data-stockfish-perspective="w"]:not([data-stockfish-eval-value^="-"]) [data-stockfish-eval-text] {
    color: var(--eval-dark);
    left: 0;
  }

  [data-stockfish-orientation="horizontal"][data-stockfish-perspective="b"][data-stockfish-eval-value^="-"] [data-stockfish-eval-text] {
    color: var(--eval-light);
    left: 0;
  }

  [data-stockfish-orientation="horizontal"][data-stockfish-perspective="b"]:not([data-stockfish-eval-value^="-"]) [data-stockfish-eval-text] {
    color: var(--eval-dark);
    right: 0;
  }

  [data-stockfish-eval-type="none"] [data-stockfish-eval-text] {
    color: var(--eval-light);
    top: 50%;
    transform: translateY(-50%);
  }
`;

export const ENGINE_LINES_CSS = `
  [data-pv-rank] {
    align-items: baseline;
    background: #f7f7f7;
    border-bottom: 1px solid #d8d8d8;
    display: grid;
    font-family: "Noto Sans", "Inter", sans-serif;
    font-size: 15px;
    grid-template-columns: 64px minmax(0, 1fr);
    line-height: 1.35;
    padding: 6px 10px;
  }

  [data-eval-text] {
    color: #1f1f1f;
    font-variant-numeric: tabular-nums;
    font-weight: 700;
  }

  [data-moves] {
    color: #2e2e2e;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  [data-pv-rank="1"] {
    border-top: 1px solid #d8d8d8;
  }
`;

export const EVAL_BAR_CLASS =
  "relative overflow-hidden rounded bg-dark-bg border border-dark-border w-[30px] h-[220px]";

export const HORIZONTAL_BAR_CLASS =
  "relative overflow-hidden rounded bg-dark-bg border border-dark-border w-full h-[30px] max-w-board-preview";

type RootProps = Omit<
  React.ComponentProps<typeof ChessStockfish.Root>,
  "workerOptions"
>;

export function AnalysisRoot(props: RootProps) {
  return (
    <ChessStockfish.Root
      workerOptions={{ workerPath: STOCKFISH_WORKER_PATH }}
      {...props}
    />
  );
}

export function EngineStatus() {
  const { info, methods } = useStockfish();
  const bestMove = methods.getBestMove();

  const statusDisplay = () => {
    if (info.status === "initializing") {
      return <span className="text-warning">initializing...</span>;
    }
    if (info.status === "error") {
      return <span className="text-danger">error</span>;
    }
    if (info.isEngineThinking) {
      return <span className="text-success">thinking</span>;
    }
    return <span className="text-text-muted">ready</span>;
  };

  return (
    <div className="font-mono text-size-xs text-text-secondary flex flex-col gap-1">
      <div className="flex gap-3">
        <span>depth: {info.depth}</span>
        <span>status: {statusDisplay()}</span>
      </div>
      {info.status === "initializing" && (
        <span className="text-text-muted">Engine loading...</span>
      )}
      {bestMove && (
        <span>
          best: <span className="text-text font-semibold">{bestMove.san}</span>
        </span>
      )}
    </div>
  );
}

type EvaluationBarProps = React.ComponentProps<
  typeof ChessStockfish.EvaluationBar
>;

export const VerticalEvalBar = (props: EvaluationBarProps) => (
  <ChessStockfish.EvaluationBar orientation="vertical" {...props}>
    <style>{EVAL_BAR_CSS}</style>
  </ChessStockfish.EvaluationBar>
);

export const HorizontalEvalBar = (props: EvaluationBarProps) => (
  <ChessStockfish.EvaluationBar orientation="horizontal" {...props}>
    <style>{EVAL_BAR_CSS}</style>
  </ChessStockfish.EvaluationBar>
);

export const StyledEngineLines = (
  props: React.ComponentProps<typeof ChessStockfish.EngineLines>,
) => (
  <ChessStockfish.EngineLines {...props}>
    <style>{ENGINE_LINES_CSS}</style>
  </ChessStockfish.EngineLines>
);
