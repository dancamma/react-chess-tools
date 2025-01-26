// src/components/ChessPuzzle/parts/Root.tsx
import React3 from "react";

// src/utils/index.ts
import { Chess } from "chess.js";
import React from "react";
import _ from "lodash";
var FAIL_COLOR = "rgba(201, 52, 48, 0.5)";
var SUCCESS_COLOR = "rgba(172, 206, 89, 0.5)";
var HINT_COLOR = "rgba(27, 172, 166, 0.5)";
var getOrientation = (puzzle) => {
  const fen = puzzle.fen;
  const game = new Chess(fen);
  if (puzzle.makeFirstMove) {
    game.move(puzzle.moves[0]);
  }
  return game.turn();
};
var isClickableElement = (element) => React.isValidElement(element);
var getCustomSquareStyles = (status, hint, isPlayerTurn, game, nextMove) => {
  const customSquareStyles = {};
  const lastMove = _.last(game.history({ verbose: true }));
  if (status === "failed" && lastMove) {
    customSquareStyles[lastMove.from] = {
      backgroundColor: FAIL_COLOR
    };
    customSquareStyles[lastMove.to] = {
      backgroundColor: FAIL_COLOR
    };
  }
  if (lastMove && (status === "solved" || status !== "failed" && !isPlayerTurn)) {
    customSquareStyles[lastMove.from] = {
      backgroundColor: SUCCESS_COLOR
    };
    customSquareStyles[lastMove.to] = {
      backgroundColor: SUCCESS_COLOR
    };
  }
  if (hint === "piece") {
    if (nextMove) {
      customSquareStyles[nextMove.from] = {
        backgroundColor: HINT_COLOR
      };
    }
  }
  if (hint === "move") {
    if (nextMove) {
      customSquareStyles[nextMove.from] = {
        backgroundColor: HINT_COLOR
      };
      customSquareStyles[nextMove.to] = {
        backgroundColor: HINT_COLOR
      };
    }
  }
  return customSquareStyles;
};
var stringToMove = (game, move) => {
  const copy = new Chess(game.fen());
  if (move === null || move === void 0) {
    return null;
  }
  try {
    return copy.move(move);
  } catch (e) {
    return null;
  }
};

// src/hooks/useChessPuzzle.ts
import { useEffect, useReducer } from "react";

// src/hooks/reducer.ts
var initializePuzzle = ({ puzzle }) => {
  return {
    puzzle,
    currentMoveIndex: 0,
    status: "not-started",
    nextMove: puzzle.moves[0],
    hint: "none",
    cpuMove: null,
    needCpuMove: !!puzzle.makeFirstMove,
    isPlayerTurn: !puzzle.makeFirstMove
  };
};
var reducer = (state, action) => {
  switch (action.type) {
    case "INITIALIZE":
      return {
        ...state,
        ...initializePuzzle(action.payload)
      };
    case "RESET":
      return {
        ...state,
        ...initializePuzzle({
          puzzle: state.puzzle
        })
      };
    case "TOGGLE_HINT":
      if (state.hint === "none") {
        return { ...state, hint: "piece" };
      }
      return { ...state, hint: "move" };
    case "CPU_MOVE":
      if (state.isPlayerTurn) {
        return state;
      }
      if (["solved", "failed"].includes(state.status)) {
        return state;
      }
      return {
        ...state,
        currentMoveIndex: state.currentMoveIndex + 1,
        cpuMove: state.puzzle.moves[state.currentMoveIndex],
        nextMove: state.currentMoveIndex < state.puzzle.moves.length - 1 ? state.puzzle.moves[state.currentMoveIndex + 1] : null,
        needCpuMove: false,
        isPlayerTurn: true,
        status: "in-progress"
      };
    case "PLAYER_MOVE": {
      const { move, onSolve, onFail, changePuzzle } = action.payload;
      const isMoveRight = [move == null ? void 0 : move.san, move == null ? void 0 : move.lan].includes(
        (state == null ? void 0 : state.nextMove) || ""
      );
      const isPuzzleSolved = state.currentMoveIndex === state.puzzle.moves.length - 1;
      if (!isMoveRight) {
        if (onFail) {
          onFail(changePuzzle);
        }
        return {
          ...state,
          status: "failed",
          nextMove: null,
          hint: "none",
          isPlayerTurn: false
        };
      }
      if (isPuzzleSolved) {
        if (onSolve) {
          onSolve(changePuzzle);
        }
        return {
          ...state,
          status: "solved",
          nextMove: null,
          hint: "none",
          isPlayerTurn: false
        };
      }
      return {
        ...state,
        hint: "none",
        currentMoveIndex: state.currentMoveIndex + 1,
        nextMove: state.puzzle.moves[state.currentMoveIndex + 1],
        status: "in-progress",
        needCpuMove: true,
        isPlayerTurn: false
      };
    }
    default:
      return state;
  }
};

// src/hooks/useChessPuzzle.ts
import { useChessGameContext } from "@react-chess-tools/react-chess-game";
var useChessPuzzle = (puzzle, onSolve, onFail) => {
  var _a;
  const gameContext = useChessGameContext();
  const [state, dispatch] = useReducer(reducer, { puzzle }, initializePuzzle);
  const {
    game,
    methods: { makeMove, setPosition }
  } = gameContext;
  useEffect(() => {
    if (gameContext && game.fen() !== puzzle.fen) {
      setPosition(puzzle.fen, getOrientation(puzzle));
    }
  }, []);
  const changePuzzle = (puzzle2) => {
    dispatch({ type: "INITIALIZE", payload: { puzzle: puzzle2 } });
    setPosition(puzzle2.fen, getOrientation(puzzle2));
  };
  useEffect(() => {
    if (gameContext && game.fen() === puzzle.fen && state.needCpuMove) {
      setTimeout(
        () => dispatch({
          type: "CPU_MOVE"
        }),
        0
      );
    }
  }, [gameContext, state.needCpuMove]);
  useEffect(() => {
    if (state.cpuMove) {
      makeMove(state.cpuMove);
    }
  }, [state.cpuMove]);
  useEffect(() => {
    var _a2, _b, _c;
    if (((_a2 = game == null ? void 0 : game.history()) == null ? void 0 : _a2.length) <= 0 + (puzzle.makeFirstMove ? 1 : 0)) {
      return;
    }
    if (game.history().length % 2 === (puzzle.makeFirstMove ? 0 : 1)) {
      dispatch({
        type: "PLAYER_MOVE",
        payload: {
          move: ((_c = (_b = gameContext == null ? void 0 : gameContext.game) == null ? void 0 : _b.history({ verbose: true })) == null ? void 0 : _c.pop()) ?? null,
          onSolve,
          onFail,
          changePuzzle,
          game
        }
      });
      dispatch({
        type: "CPU_MOVE"
      });
    }
  }, [(_a = game == null ? void 0 : game.history()) == null ? void 0 : _a.length]);
  if (!gameContext) {
    throw new Error("useChessPuzzle must be used within a ChessGameContext");
  }
  const onHint = () => {
    dispatch({ type: "TOGGLE_HINT" });
  };
  return {
    status: state.status,
    changePuzzle,
    puzzle,
    hint: state.hint,
    onHint,
    nextMove: state.nextMove,
    isPlayerTurn: state.isPlayerTurn
  };
};

// src/components/ChessPuzzle/parts/Root.tsx
import { ChessGame } from "@react-chess-tools/react-chess-game";

// src/hooks/useChessPuzzleContext.ts
import React2 from "react";
var ChessPuzzleContext = React2.createContext(null);
var useChessPuzzleContext = () => {
  const context = React2.useContext(ChessPuzzleContext);
  if (!context) {
    throw new Error(
      "useChessGameContext must be used within a ChessGameProvider"
    );
  }
  return context;
};

// src/components/ChessPuzzle/parts/Root.tsx
var PuzzleRoot = ({
  puzzle,
  onSolve,
  onFail,
  children
}) => {
  const context = useChessPuzzle(puzzle, onSolve, onFail);
  return /* @__PURE__ */ React3.createElement(ChessPuzzleContext.Provider, { value: context }, children);
};
var Root = ({
  puzzle,
  onSolve,
  onFail,
  children
}) => {
  return /* @__PURE__ */ React3.createElement(ChessGame.Root, { fen: puzzle.fen, orientation: getOrientation(puzzle) }, /* @__PURE__ */ React3.createElement(PuzzleRoot, { puzzle, onSolve, onFail }, children));
};

// src/components/ChessPuzzle/parts/PuzzleBoard.tsx
import React4 from "react";
import {
  ChessGame as ChessGame2,
  useChessGameContext as useChessGameContext2
} from "@react-chess-tools/react-chess-game";
var PuzzleBoard = ({ ...rest }) => {
  const puzzleContext = useChessPuzzleContext();
  const gameContext = useChessGameContext2();
  if (!puzzleContext) {
    throw new Error("PuzzleContext not found");
  }
  if (!gameContext) {
    throw new Error("ChessGameContext not found");
  }
  const { game } = gameContext;
  const { status, hint, isPlayerTurn, nextMove } = puzzleContext;
  return /* @__PURE__ */ React4.createElement(
    ChessGame2.Board,
    {
      customSquareStyles: getCustomSquareStyles(
        status,
        hint,
        isPlayerTurn,
        game,
        stringToMove(game, nextMove)
      ),
      ...rest
    }
  );
};

// src/components/ChessPuzzle/parts/Reset.tsx
import React5 from "react";
var defaultShowOn = ["failed", "solved"];
var Reset = ({
  children,
  asChild,
  puzzle,
  onReset,
  showOn = defaultShowOn
}) => {
  const puzzleContext = useChessPuzzleContext();
  if (!puzzleContext) {
    throw new Error("PuzzleContext not found");
  }
  const { changePuzzle, status } = puzzleContext;
  const handleClick = () => {
    changePuzzle(puzzle || puzzleContext.puzzle);
    onReset == null ? void 0 : onReset();
  };
  if (!showOn.includes(status)) {
    return null;
  }
  if (asChild) {
    const child = React5.Children.only(children);
    if (isClickableElement(child)) {
      return React5.cloneElement(child, {
        onClick: handleClick
      });
    } else {
      throw new Error("Change child must be a clickable element");
    }
  }
  return /* @__PURE__ */ React5.createElement("button", { type: "button", onClick: handleClick }, children);
};

// src/components/ChessPuzzle/parts/Hint.tsx
import React6 from "react";
var defaultShowOn2 = ["not-started", "in-progress"];
var Hint = ({
  children,
  asChild,
  showOn = defaultShowOn2
}) => {
  const puzzleContext = useChessPuzzleContext();
  if (!puzzleContext) {
    throw new Error("PuzzleContext not found");
  }
  const { onHint, status } = puzzleContext;
  const handleClick = () => {
    onHint();
  };
  if (!showOn.includes(status)) {
    return null;
  }
  if (asChild) {
    const child = React6.Children.only(children);
    if (isClickableElement(child)) {
      return React6.cloneElement(child, {
        onClick: handleClick
      });
    } else {
      throw new Error("Change child must be a clickable element");
    }
  }
  return /* @__PURE__ */ React6.createElement("button", { type: "button", onClick: handleClick }, children);
};

// src/components/ChessPuzzle/index.ts
var ChessPuzzle = {
  Root,
  Board: PuzzleBoard,
  Reset,
  Hint
};
export {
  ChessPuzzle,
  useChessPuzzleContext
};
//# sourceMappingURL=index.mjs.map