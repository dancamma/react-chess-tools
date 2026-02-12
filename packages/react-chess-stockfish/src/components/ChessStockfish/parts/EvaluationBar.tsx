/**
 * ChessStockfish.EvaluationBar - Unstyled evaluation bar component.
 *
 * Renders an evaluation bar that visually represents the Stockfish engine's
 * assessment of the current position. The fill grows from bottom (vertical)
 * or left (horizontal) for white advantage by default.
 *
 * Use the `perspective` prop to flip the bar's visual fill direction
 * (for board orientation) without changing evaluation semantics.
 *
 * No colors or styles are applied — consumers style via data attributes.
 *
 * @example
 * ```tsx
 * <ChessStockfish.EvaluationBar
 *   orientation="vertical"
 *   perspective="w"
 *   showEvaluation
 * />
 * ```
 */

import { Slot, Slottable } from "@radix-ui/react-slot";
import type { Color } from "chess.js";
import React, {
  forwardRef,
  memo,
  type ForwardRefRenderFunction,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useStockfish } from "../../../hooks/useStockfish";
import { formatEvaluation } from "../../../utils/evaluation";

/**
 * Props for the EvaluationBar component.
 */
export interface EvaluationBarProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** Orientation of the bar: "vertical" (default) or "horizontal" */
  orientation?: "vertical" | "horizontal";
  /**
   * Which side is at the bottom/left of the board view.
   *
   * This changes only visual fill direction (bottom/left vs top/right),
   * not the evaluation value mapping.
   */
  perspective?: Color;
  /** Whether to show the evaluation text (e.g., "+1.2") */
  showEvaluation?: boolean;
  /** When true, renders as child instead of div (Radix Slot pattern) */
  asChild?: boolean;
  /** Optional children to render inside the bar */
  children?: ReactNode;
}

/**
 * Inner component implementation for EvaluationBar.
 */
const EvaluationBarImpl: ForwardRefRenderFunction<
  HTMLDivElement,
  EvaluationBarProps
> = (
  {
    orientation = "vertical",
    perspective = "w",
    showEvaluation = false,
    className,
    asChild = false,
    children,
    ...restProps
  },
  ref,
) => {
  const { info } = useStockfish();

  // Use the pre-normalized evaluation from the engine (-1..1 range).
  // Semantics are always white-centric:
  // -1 (black winning) -> 0%, 0 (equal) -> 50%, 1 (white winning) -> 100%.
  const normalized = info.normalizedEvaluation;
  const safeNormalized = Number.isFinite(normalized) ? normalized : 0;
  const fillPercentage = Math.max(
    0,
    Math.min(100, Math.round((safeNormalized + 1) * 50)),
  );

  const fillOrigin =
    orientation === "vertical"
      ? perspective === "b"
        ? "top"
        : "bottom"
      : perspective === "b"
        ? "right"
        : "left";

  // Format evaluation for display (e.g., "+1.2", "#3", "–")
  const evalText = formatEvaluation(info.evaluation);

  // Data attributes to apply
  const dataAttrs = {
    "data-stockfish-orientation": orientation,
    "data-stockfish-perspective": perspective,
    "data-stockfish-eval": evalText,
    "data-stockfish-eval-type": info.evaluation?.type ?? "none",
    "data-stockfish-eval-value": info.evaluation?.value,
    "data-stockfish-fill-percentage": fillPercentage,
    "data-stockfish-fill-origin": fillOrigin,
  };

  const fillScale = fillPercentage / 100;
  const fillTransform =
    orientation === "vertical"
      ? `scaleY(${fillScale})`
      : `scaleX(${fillScale})`;

  // Internal content (fill and eval text)
  const internalContent = (
    <>
      <div
        data-stockfish-fill
        style={{
          transform: fillTransform,
          transformOrigin: fillOrigin,
        }}
      />
      {showEvaluation && <span data-stockfish-eval-text>{evalText}</span>}
    </>
  );

  const Component = asChild ? Slot : "div";

  return (
    <Component ref={ref} {...dataAttrs} className={className} {...restProps}>
      {internalContent}
      <Slottable>{children}</Slottable>
    </Component>
  );
};

/**
 * EvaluationBar component - unstyled evaluation bar for Stockfish analysis.
 *
 * Displays a visual representation of the engine's evaluation as a filled bar.
 * The fill grows from the bottom (vertical) or left (horizontal) for white advantage.
 *
 * Use `perspective="b"` to flip the bar's fill origin so white advantage
 * fills from the top (vertical) or right (horizontal) - matching a flipped board.
 * Evaluation values remain white-centric for both perspectives.
 *
 * Data attributes are provided for styling:
 * - `data-stockfish-orientation` - "vertical" or "horizontal"
 * - `data-stockfish-perspective` - "w" or "b"
 * - `data-stockfish-eval` - Formatted evaluation text ("+1.2", "#3", "–")
 * - `data-stockfish-eval-type` - "cp", "mate", or "none"
 * - `data-stockfish-eval-value` - Raw numeric value (omitted when no evaluation)
 * - `data-stockfish-fill-percentage` - Fill percentage (0-100)
 * - `data-stockfish-fill-origin` - "bottom" | "top" | "left" | "right"
 * - `data-stockfish-fill` - Inner div with actual fill styles
 * - `data-stockfish-eval-text` - Evaluation text span (when showEvaluation is true)
 *
 * @example
 * ```tsx
 * // Vertical bar with evaluation text
 * <ChessStockfish.EvaluationBar
 *   orientation="vertical"
 *   perspective="w"
 *   showEvaluation
 *   className="eval-bar"
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Flipped for black's perspective
 * <ChessStockfish.EvaluationBar
 *   orientation="vertical"
 *   perspective="b"
 *   showEvaluation
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Horizontal bar without text
 * <ChessStockfish.EvaluationBar orientation="horizontal" />
 * ```
 *
 * @example
 * ```tsx
 * // Using asChild pattern
 * <ChessStockfish.EvaluationBar
 *   asChild
 *   showEvaluation
 * >
 *   <section className="my-custom-bar" />
 * </ChessStockfish.EvaluationBar>
 * ```
 */
export const EvaluationBar = memo(
  forwardRef<HTMLDivElement, EvaluationBarProps>(EvaluationBarImpl),
);

EvaluationBar.displayName = "ChessStockfish.EvaluationBar";
