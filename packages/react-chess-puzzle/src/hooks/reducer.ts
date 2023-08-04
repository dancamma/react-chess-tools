import { Chess, Move } from "chess.js";
import { useChessGame } from "@react-chess-tools/react-chess-game";
import { getOrientation, type Puzzle, type Hint, type Status } from "../utils";

export type State = {
  puzzle: Puzzle;
  currentMoveIndex: number;
  status: Status;
  nextMove?: string | null;
  hint: Hint;
  needCpuMove: boolean;
  isPlayerTurn: boolean;
};

export type Action =
  | {
      type: "INITIALIZE";
      payload: {
        puzzle: Puzzle;
        setPosition: ReturnType<typeof useChessGame>["methods"]["setPosition"];
      };
    }
  | {
      type: "RESET";
      payload: {
        setPosition: ReturnType<typeof useChessGame>["methods"]["setPosition"];
      };
    }
  | { type: "TOGGLE_HINT" }
  | {
      type: "CPU_MOVE";
      payload: {
        makeMove?: ReturnType<typeof useChessGame>["methods"]["makeMove"];
      };
    }
  | {
      type: "PLAYER_MOVE";
      payload: {
        move?: Move | null;
        onSolve?: (changePuzzle: (puzzle: Puzzle) => void) => void;
        onFail?: (changePuzzle: (puzzle: Puzzle) => void) => void;
        changePuzzle: (puzzle: Puzzle) => void;
        game: Chess;
      };
    };

export const initializePuzzle = ({
  puzzle,
  setPosition,
}: {
  puzzle: Puzzle;
  setPosition: ReturnType<typeof useChessGame>["methods"]["setPosition"];
}): State => {
  setPosition(puzzle.fen, getOrientation(puzzle));
  return {
    puzzle,
    currentMoveIndex: 0,
    status: "not-started",
    nextMove: puzzle.moves[0],
    hint: "none",
    needCpuMove: !!puzzle.makeFirstMove,
    isPlayerTurn: !puzzle.makeFirstMove,
  };
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "INITIALIZE":
      return {
        ...state,
        ...initializePuzzle(action.payload),
      };
    case "RESET":
      return {
        ...state,
        ...initializePuzzle({
          puzzle: state.puzzle,
          setPosition: action.payload.setPosition,
        }),
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

      if (state.nextMove) {
        action.payload.makeMove?.(state.nextMove);
      }

      return {
        ...state,
        currentMoveIndex: state.currentMoveIndex + 1,
        nextMove:
          state.currentMoveIndex < state.puzzle.moves.length - 1
            ? state.puzzle.moves[state.currentMoveIndex + 1]
            : null,
        needCpuMove: false,
        isPlayerTurn: true,
        status: "in-progress",
      };

    case "PLAYER_MOVE": {
      const { move, onSolve, onFail, changePuzzle } = action.payload;

      const isMoveRight = [move?.san, move?.lan].includes(
        state?.nextMove || "",
      );
      const isPuzzleSolved =
        state.currentMoveIndex === state.puzzle.moves.length - 1;

      if (!isMoveRight) {
        if (onFail) {
          onFail(changePuzzle);
        }
        return {
          ...state,
          status: "failed",
          nextMove: null,
          hint: "none",
          isPlayerTurn: false,
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
          isPlayerTurn: false,
        };
      }

      return {
        ...state,
        hint: "none",
        currentMoveIndex: state.currentMoveIndex + 1,
        nextMove: state.puzzle.moves[state.currentMoveIndex + 1],
        status: "in-progress",
        needCpuMove: true,
        isPlayerTurn: false,
      };
    }

    default:
      return state;
  }
};
