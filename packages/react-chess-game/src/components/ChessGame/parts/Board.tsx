import React from "react";
import {
  Chessboard,
  ChessboardOptions,
  defaultPieces,
  chessColumnToColumnIndex,
} from "react-chessboard";
import { Move, Square } from "chess.js";
import {
  getCustomSquareStyles,
  deepMergeChessboardOptions,
} from "../../../utils/board";
import { isLegalMove, requiresPromotion } from "../../../utils/chess";
import { useChessGameContext } from "../../../hooks/useChessGameContext";
import { useTheme } from "../../../hooks/useTheme";
import { themeToChessboardOptions } from "../../../theme";

export interface ChessGameProps {
  options?: Partial<ChessboardOptions>;
}

export const Board: React.FC<ChessGameProps> = ({ options = {} }) => {
  const gameContext = useChessGameContext();
  const { theme } = useTheme();

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

  // Calculate square width for precise positioning - optimized with ResizeObserver
  const [squareWidth, setSquareWidth] = React.useState(80);

  React.useEffect(() => {
    if (typeof document === "undefined") return;

    const updateSquareWidth = () => {
      const squareElement = document.querySelector(`[data-square]`);
      if (squareElement) {
        const width = squareElement.getBoundingClientRect().width;
        setSquareWidth(width || 80);
      }
    };

    // Initial measurement
    updateSquareWidth();

    // Use ResizeObserver for efficient size tracking
    let resizeObserver: ResizeObserver | null = null;

    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        updateSquareWidth();
      });

      const boardElement =
        document.querySelector('[data-testid="board"]') ||
        document.querySelector(".react-chessboard");
      if (boardElement) {
        resizeObserver.observe(boardElement);
      }
    } else {
      // Fallback for browsers without ResizeObserver
      const handleResize = () => updateSquareWidth();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []); // Only run once on mount

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

  // Memoize animation duration to avoid calling game.history() on every render
  const animationDuration = React.useMemo(() => {
    return game.history().length === 0 ? 0 : 300;
  }, [game]);

  const mergedOptions = React.useMemo<Partial<ChessboardOptions>>(() => {
    const base: Partial<ChessboardOptions> = {
      ...themeToChessboardOptions(theme),
      squareStyles: getCustomSquareStyles(game, info, activeSquare),
      boardOrientation: orientation === "b" ? "black" : "white",
      position: currentFen,
      showAnimations: isLatestMove,
      canDragPiece: ({ piece }) => {
        if (isGameOver) return false;
        return piece.pieceType[0] === turn;
      },
      onPieceDrag: ({ piece, square }) => {
        if (piece.pieceType[0] === turn) {
          if (square) setActiveSquare(square as Square);
        }
      },
      onPieceDrop: ({ sourceSquare, targetSquare }) => {
        setActiveSquare(null);
        const moveData = {
          from: sourceSquare as Square,
          to: targetSquare as Square,
        };

        if (requiresPromotion(game, { ...moveData, promotion: "q" })) {
          setPromotionMove(moveData);
          return false;
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
      animationDurationInMs: animationDuration,
    };

    return deepMergeChessboardOptions(base, options);
  }, [
    theme,
    orientation,
    currentFen,
    isLatestMove,
    isGameOver,
    turn,
    animationDuration,
    game,
    info,
    activeSquare,
    options,
  ]);

  return (
    <div style={{ position: "relative" }}>
      <Chessboard options={mergedOptions} />
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
              backgroundColor: theme.colors.lightSquare,
              width: squareWidth,
              zIndex: 1001,
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.5)",
              border: `1px solid ${theme.colors.darkSquare}`,
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
                  backgroundColor: theme.colors.lightSquare,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    theme.colors.darkSquare;
                  e.currentTarget.style.opacity = "0.8";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    theme.colors.lightSquare;
                  e.currentTarget.style.opacity = "1";
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
