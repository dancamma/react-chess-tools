import { Slot, Slottable } from "@radix-ui/react-slot";
import type { Color } from "chess.js";
import React, {
  forwardRef,
  memo,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useStockfish } from "../../../hooks/useStockfish";
import type { PrincipalVariation } from "../../../types";
import { formatEvaluation } from "../../../utils/evaluation";

function getMovePrefix(
  index: number,
  startingColor: Color,
  startingFullmove: number,
): string {
  const isBlackStarting = startingColor === "b";
  const isWhiteMove = isBlackStarting ? index % 2 === 1 : index % 2 === 0;

  if (isWhiteMove) {
    const moveNumber = isBlackStarting
      ? startingFullmove + 1 + Math.floor(index / 2)
      : startingFullmove + Math.floor(index / 2);
    return `${moveNumber}.`;
  }

  if (isBlackStarting && index === 0) {
    return `${startingFullmove}...`;
  }

  return "";
}

export interface EngineLinesProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  maxLines?: number;
  onLineClick?: (rank: number, pv: PrincipalVariation) => void;
  asChild?: boolean;
  children?: ReactNode;
}

const EngineLinesImpl = forwardRef<HTMLDivElement, EngineLinesProps>(
  (
    { maxLines, onLineClick, asChild = false, className, children, ...rest },
    ref,
  ) => {
    const { info, fen } = useStockfish();
    const Component = asChild ? Slot : "div";

    const lines = info.principalVariations.slice(0, maxLines ?? Infinity);
    const isInteractive = Boolean(onLineClick);

    const fenParts = fen.split(" ");
    const startingColor = (fenParts[1] ?? "w") as Color;
    const startingFullmove = Math.max(1, parseInt(fenParts[5] ?? "1", 10));

    return (
      <Component ref={ref} className={className} {...rest}>
        {lines.map((pv) => {
          const evalText = formatEvaluation(pv.evaluation);

          return (
            <div
              key={pv.rank}
              data-pv-rank={pv.rank}
              data-eval={evalText}
              data-depth={info.depth}
              data-uci-moves={pv.moves.map((m) => m.uci).join(" ")}
              onClick={
                isInteractive ? () => onLineClick!(pv.rank, pv) : undefined
              }
              onKeyDown={(e) => {
                if (
                  isInteractive &&
                  !e.defaultPrevented &&
                  (e.key === "Enter" || e.key === " ")
                ) {
                  e.preventDefault();
                  onLineClick!(pv.rank, pv);
                }
              }}
              role={isInteractive ? "button" : undefined}
              tabIndex={isInteractive ? 0 : undefined}
            >
              <span data-eval-text>{evalText}</span>
              <span data-moves>
                {pv.moves.map((move, i) => (
                  <React.Fragment key={`${move.uci}-${i}`}>
                    {i > 0 ? " " : null}
                    <span data-move data-uci={move.uci}>
                      {getMovePrefix(i, startingColor, startingFullmove)}
                      {move.san}
                    </span>
                  </React.Fragment>
                ))}
              </span>
            </div>
          );
        })}
        <Slottable>{children}</Slottable>
      </Component>
    );
  },
);

export const EngineLines = memo(EngineLinesImpl);

EngineLines.displayName = "ChessStockfish.EngineLines";
