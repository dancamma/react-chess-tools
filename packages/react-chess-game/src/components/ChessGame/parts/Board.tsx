import React from "react";
import { Chessboard } from "react-chessboard";
import { Move, Square } from "chess.js";
import { PromotionPieceOption } from "react-chessboard/dist/chessboard/types";
import { getCustomSquareStyles } from "../../../utils/board";
import { isLegalMove, requiresPromotion } from "../../../utils/chess";
import { useChessGameContext } from "../../../hooks/useChessGameContext";

export interface ChessGameProps
  extends React.ComponentProps<typeof Chessboard> {}

export const Board: React.FC<ChessGameProps> = ({
  customSquareStyles,
  ...rest
}) => {
  const gameContext = useChessGameContext();

  if (!gameContext) {
    throw new Error("ChessGameContext not found");
  }

  const {
    game,
    currentFen,
    orientation,
    info,
    methods: { makeMove },
  } = gameContext;

  const { turn, isGameOver } = info;

  const [activeSquare, setActiveSquare] = React.useState<Square | null>(null);

  const [promotionMove, setPromotionMove] =
    React.useState<Partial<Move> | null>(null);

  const onSquareClick = (square: Square) => {
    if (isGameOver) {
      return;
    }

    if (activeSquare === null) {
      const squadreInfo = game.get(square);
      if (squadreInfo && squadreInfo.color === turn) {
        return setActiveSquare(square);
      }
      return;
    }

    if (
      !isLegalMove(game, {
        from: activeSquare,
        to: square,
        promotion: "q",
      })
    ) {
      return setActiveSquare(null);
    }

    if (
      requiresPromotion(game, {
        from: activeSquare,
        to: square,
        promotion: "q",
      })
    ) {
      return setPromotionMove({
        from: activeSquare,
        to: square,
      });
    }

    setActiveSquare(null);
    makeMove({
      from: activeSquare,
      to: square,
    });
  };

  const onPromotionPieceSelect = (piece?: PromotionPieceOption): boolean => {
    if (promotionMove?.from && promotionMove?.to && piece) {
      setPromotionMove(null);
      return makeMove({
        from: promotionMove.from,
        to: promotionMove.to,
        promotion: piece?.[1]?.toLowerCase() || "q",
      });
    }
    return true;
  };

  return (
    <Chessboard
      customSquareStyles={{
        ...getCustomSquareStyles(game, info, activeSquare),
        ...customSquareStyles,
      }}
      boardOrientation={orientation === "b" ? "black" : "white"}
      position={currentFen}
      showPromotionDialog={!!promotionMove}
      onPromotionPieceSelect={
        promotionMove ? onPromotionPieceSelect : undefined
      }
      onPieceDragBegin={(_, square) => {
        setActiveSquare(square);
      }}
      onPieceDragEnd={() => {
        setActiveSquare(null);
      }}
      onPieceDrop={(sourceSquare, targetSquare, piece) =>
        makeMove({
          from: sourceSquare,
          to: targetSquare,
          promotion: piece?.[1].toLowerCase() || "q",
        })
      }
      onSquareClick={onSquareClick}
      areArrowsAllowed={true}
      animationDuration={game.history().length === 0 ? 0 : 300}
      {...rest}
    />
  );
};
