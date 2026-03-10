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
import { useChessGameBoardContainerContext } from "../../../hooks/useChessGameBoardContainerContext";
import { useChessGameContext } from "../../../hooks/useChessGameContext";
import { useChessGameTheme } from "../../../theme/context";

export interface ChessGameProps extends React.HTMLAttributes<HTMLDivElement> {
  options?: ChessboardOptions;
}

export const Board = React.forwardRef<HTMLDivElement, ChessGameProps>(
  (
    {
      options = {},
      className,
      style: userStyle,
      onPointerDownCapture,
      tabIndex = 0,
      ...rest
    },
    ref,
  ) => {
    const gameContext = useChessGameContext();
    const { boardContainerRef, setBoardContainerElement } =
      useChessGameBoardContainerContext();
    const theme = useChessGameTheme();

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

    // Track square width for responsive updates
    const [squareWidth, setSquareWidth] = React.useState(80);

    const setBoardContainerRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        boardContainerRef.current = node;
        setBoardContainerElement(node);

        if (typeof ref === "function") {
          ref(node);
          return;
        }

        if (ref) {
          ref.current = node;
        }
      },
      [boardContainerRef, ref, setBoardContainerElement],
    );

    const handlePointerDownCapture = React.useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        onPointerDownCapture?.(event);

        if (!event.defaultPrevented) {
          boardContainerRef.current?.focus({ preventScroll: true });
        }
      },
      [boardContainerRef, onPointerDownCapture],
    );

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

    // Use ResizeObserver for responsive square width updates
    React.useEffect(() => {
      if (typeof window === "undefined" || !boardContainerRef.current) return;

      const updateSquareWidth = () => {
        const squareElement =
          boardContainerRef.current?.querySelector("[data-square]");
        if (squareElement) {
          setSquareWidth(squareElement.getBoundingClientRect().width);
        }
      };

      // Initial measurement
      updateSquareWidth();

      // Only use ResizeObserver if available (not in all test environments)
      if (typeof ResizeObserver !== "undefined" && boardContainerRef.current) {
        const observer = new ResizeObserver(updateSquareWidth);
        observer.observe(boardContainerRef.current);
        return () => observer.disconnect();
      }
    }, []);

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

    const baseOptions: ChessboardOptions = {
      squareStyles: getCustomSquareStyles(game, info, activeSquare, theme),
      boardOrientation: orientation === "b" ? "black" : "white",
      position: currentFen,
      showNotation: true,
      showAnimations: isLatestMove,
      lightSquareStyle: theme.board.lightSquare,
      darkSquareStyle: theme.board.darkSquare,
      canDragPiece: ({ piece }) => {
        if (isGameOver) return false;
        return piece.pieceType[0] === turn;
      },
      dropSquareStyle: theme.state.dropSquare,
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
    };

    const mergedOptions = deepMergeChessboardOptions(baseOptions, options);

    const mergedStyle = {
      ...userStyle,
      position: "relative" as const,
    };

    // Calculate promotion menu vertical position based on orientation
    const isBlackOrientation = orientation === "b";
    const promotionRank = promotionMove?.to?.[1];
    const isTopRank = isBlackOrientation
      ? promotionRank === "1"
      : promotionRank === "8";

    return (
      <div
        ref={setBoardContainerRef}
        className={className}
        style={mergedStyle}
        tabIndex={tabIndex}
        onPointerDownCapture={handlePointerDownCapture}
        {...rest}
      >
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
                top: isTopRank ? 0 : "auto",
                bottom: isTopRank ? "auto" : 0,
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
  },
);

Board.displayName = "ChessGame.Board";
