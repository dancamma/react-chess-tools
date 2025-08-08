import React from "react";
import {
  Chessboard,
  ChessboardOptions,
  defaultPieces,
  chessColumnToColumnIndex,
} from "react-chessboard";
import { Move, Square } from "chess.js";
import { getCustomSquareStyles } from "../../../utils/board";
import { isLegalMove, requiresPromotion } from "../../../utils/chess";
import { useChessGameContext } from "../../../hooks/useChessGameContext";

export interface ChessGameProps {
  options?: ChessboardOptions;
}

export const Board: React.FC<ChessGameProps> = ({ options = {} }) => {
  const gameContext = useChessGameContext();

  if (!gameContext) {
    throw new Error("ChessGameContext not found");
  }

  const {
    game,
    currentFen,
    orientation,
    info,
    isLatestMove,
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

  const onPromotionPieceSelect = (piece: string): void => {
    if (promotionMove?.from && promotionMove?.to) {
      makeMove({
        from: promotionMove.from,
        to: promotionMove.to,
        promotion: piece.toLowerCase(),
      });
      setPromotionMove(null);
    }
  };

  const onSquareRightClick = () => {
    setActiveSquare(null);
    setPromotionMove(null);
  };

  // Calculate square width for precise positioning
  const squareWidth = React.useMemo(() => {
    const squareElement = document.querySelector(`[data-square]`);
    return squareElement?.getBoundingClientRect()?.width ?? 80;
  }, [promotionMove]);

  // Calculate promotion square position
  const promotionSquareLeft = React.useMemo(() => {
    if (!promotionMove?.to) return 0;
    const column = promotionMove.to.match(/^[a-h]/)?.[0] ?? "a";
    return (
      squareWidth *
      chessColumnToColumnIndex(
        column,
        8,
        orientation === "b" ? "black" : "white",
      )
    );
  }, [promotionMove, squareWidth, orientation]);

  return (
    <div style={{ position: "relative" }}>
      <Chessboard
        options={{
          squareStyles: {
            ...getCustomSquareStyles(game, info, activeSquare),
            ...options.squareStyles,
          },
          boardOrientation: orientation === "b" ? "black" : "white",
          position: currentFen,
          showNotation: true,
          showAnimations: isLatestMove,
          canDragPiece: ({ piece }) => {
            if (isGameOver) return false;
            return piece.pieceType[0] === turn;
          },
          dropSquareStyle: {
            backgroundColor: "rgba(255, 255, 0, 0.4)",
          },
          onPieceDrag: ({ piece, square }) => {
            if (piece.pieceType[0] === turn) {
              setActiveSquare(square as Square);
            }
          },
          onPieceDrop: ({ sourceSquare, targetSquare }) => {
            setActiveSquare(null);
            const moveData = {
              from: sourceSquare as Square,
              to: targetSquare as Square,
            };

            // Check if promotion is needed
            if (requiresPromotion(game, { ...moveData, promotion: "q" })) {
              setPromotionMove(moveData);
              return false; // Prevent the move until promotion is selected
            }

            return makeMove(moveData);
          },
          onSquareClick: ({ square }) => {
            if (square.match(/^[a-h][1-8]$/)) {
              onSquareClick(square as Square);
            }
          },
          onSquareRightClick: onSquareRightClick,
          allowDrawingArrows: true,
          animationDurationInMs: game.history().length === 0 ? 0 : 300,
          ...options,
        }}
      />
      {promotionMove && (
        <>
          {/* Backdrop overlay - click to cancel */}
          <div
            onClick={() => setPromotionMove(null)}
            onContextMenu={(e) => {
              e.preventDefault();
              setPromotionMove(null);
            }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              zIndex: 1000,
            }}
          />
          {/* Promotion piece selection */}
          <div
            style={{
              position: "absolute",
              top: promotionMove.to?.[1]?.includes("8") ? 0 : "auto",
              bottom: promotionMove.to?.[1].includes("1") ? 0 : "auto",
              left: promotionSquareLeft,
              backgroundColor: "white",
              width: squareWidth,
              zIndex: 1001,
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.5)",
            }}
          >
            {["q", "r", "n", "b"].map((piece) => (
              <button
                key={piece}
                onClick={() => onPromotionPieceSelect(piece)}
                onContextMenu={(e) => {
                  e.preventDefault();
                }}
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: "white",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f0f0f0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                {defaultPieces[
                  `${turn}${piece.toUpperCase()}` as keyof typeof defaultPieces
                ]()}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
