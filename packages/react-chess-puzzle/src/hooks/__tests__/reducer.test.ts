import { Chess, Move } from "chess.js";
import { reducer, initializePuzzle, State, Action } from "../reducer";
import { Puzzle } from "../../utils";
import { ChessPuzzleContextType } from "../useChessPuzzle";

describe("reducer", () => {
  // Mock puzzle data
  const mockPuzzle: Puzzle = {
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"],
    makeFirstMove: false,
  };

  const mockPuzzleWithFirstMove: Puzzle = {
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"],
    makeFirstMove: true,
  };

  // Initial state
  const initialState: State = {
    puzzle: mockPuzzle,
    currentMoveIndex: 0,
    status: "not-started",
    nextMove: "e4",
    hint: "none",
    cpuMove: null,
    needCpuMove: false,
    isPlayerTurn: true,
  };

  describe("initializePuzzle", () => {
    it("should initialize a puzzle correctly", () => {
      const state = initializePuzzle({ puzzle: mockPuzzle });

      expect(state).toEqual({
        puzzle: mockPuzzle,
        currentMoveIndex: 0,
        status: "not-started",
        nextMove: "e4",
        hint: "none",
        cpuMove: null,
        needCpuMove: false,
        isPlayerTurn: true,
      });
    });

    it("should set needCpuMove to true if makeFirstMove is true", () => {
      const state = initializePuzzle({ puzzle: mockPuzzleWithFirstMove });

      expect(state.needCpuMove).toBe(true);
      expect(state.isPlayerTurn).toBe(false);
    });
  });

  describe("INITIALIZE action", () => {
    it("should initialize with a new puzzle", () => {
      const action: Action = {
        type: "INITIALIZE",
        payload: {
          puzzle: mockPuzzle,
        },
      };

      const newState = reducer(initialState, action);

      expect(newState).toEqual(initialState);
    });
  });

  describe("RESET action", () => {
    it("should reset the puzzle to initial state", () => {
      const modifiedState: State = {
        ...initialState,
        currentMoveIndex: 2,
        status: "in-progress",
        hint: "piece",
      };

      const action: Action = {
        type: "RESET",
      };

      const newState = reducer(modifiedState, action);

      expect(newState).toEqual(initialState);
    });
  });

  describe("TOGGLE_HINT action", () => {
    it("should change hint from none to piece", () => {
      const action: Action = {
        type: "TOGGLE_HINT",
      };

      const newState = reducer(initialState, action);

      expect(newState.hint).toBe("piece");
    });

    it("should change hint from piece to move", () => {
      const stateWithPieceHint: State = {
        ...initialState,
        hint: "piece",
      };

      const action: Action = {
        type: "TOGGLE_HINT",
      };

      const newState = reducer(stateWithPieceHint, action);

      expect(newState.hint).toBe("move");
    });
  });

  describe("CPU_MOVE action", () => {
    it("should process CPU move and update state", () => {
      const state: State = {
        ...initialState,
        isPlayerTurn: false,
        needCpuMove: true,
      };

      const action: Action = {
        type: "CPU_MOVE",
      };

      const newState = reducer(state, action);

      expect(newState.currentMoveIndex).toBe(1);
      expect(newState.cpuMove).toBe("e4");
      expect(newState.nextMove).toBe("e5");
      expect(newState.needCpuMove).toBe(false);
      expect(newState.isPlayerTurn).toBe(true);
      expect(newState.status).toBe("in-progress");
    });

    it("should not change state if it's player's turn", () => {
      const action: Action = {
        type: "CPU_MOVE",
      };

      const newState = reducer(initialState, action);

      expect(newState).toBe(initialState);
    });

    it("should not change state if puzzle is solved or failed", () => {
      const solvedState: State = {
        ...initialState,
        isPlayerTurn: false,
        status: "solved",
      };

      const action: Action = {
        type: "CPU_MOVE",
      };

      const newState = reducer(solvedState, action);

      expect(newState).toBe(solvedState);
    });

    it("should set nextMove to null when reaching last move", () => {
      const state: State = {
        ...initialState,
        isPlayerTurn: false,
        needCpuMove: true,
        currentMoveIndex: 4, // Last move index
      };

      const action: Action = {
        type: "CPU_MOVE",
      };

      const newState = reducer(state, action);

      expect(newState.nextMove).toBe(null);
    });
  });

  describe("PLAYER_MOVE action", () => {
    const game = new Chess(mockPuzzle.fen);
    const mockContext = {} as ChessPuzzleContextType; // Mock puzzle context

    it("should handle correct player move", () => {
      const move = { san: "e4", lan: "e2e4" } as Move;

      const action: Action = {
        type: "PLAYER_MOVE",
        payload: {
          move,
          puzzleContext: mockContext,
          game,
        },
      };

      const newState = reducer(initialState, action);

      expect(newState.currentMoveIndex).toBe(1);
      expect(newState.nextMove).toBe("e5");
      expect(newState.hint).toBe("none");
      expect(newState.needCpuMove).toBe(true);
      expect(newState.isPlayerTurn).toBe(false);
      expect(newState.status).toBe("in-progress");
    });

    it("should handle incorrect player move", () => {
      const move = { san: "d4", lan: "d2d4" } as Move;

      const action: Action = {
        type: "PLAYER_MOVE",
        payload: {
          move,
          puzzleContext: mockContext,
          game,
        },
      };

      const newState = reducer(initialState, action);

      expect(newState.status).toBe("failed");
      expect(newState.nextMove).toBe(null);
      expect(newState.hint).toBe("none");
      expect(newState.isPlayerTurn).toBe(false);
    });

    it("should handle solving the puzzle", () => {
      const move = { san: "Bb5", lan: "f1b5" } as Move;

      const lastMoveState: State = {
        ...initialState,
        currentMoveIndex: 4,
        nextMove: "Bb5",
      };

      const action: Action = {
        type: "PLAYER_MOVE",
        payload: {
          move,
          puzzleContext: mockContext,
          game,
        },
      };

      const newState = reducer(lastMoveState, action);

      expect(newState.status).toBe("solved");
      expect(newState.nextMove).toBe(null);
      expect(newState.hint).toBe("none");
      expect(newState.isPlayerTurn).toBe(false);
    });

    it("should handle null move", () => {
      const action: Action = {
        type: "PLAYER_MOVE",
        payload: {
          move: null,
          puzzleContext: mockContext,
          game,
        },
      };

      const newState = reducer(initialState, action);

      expect(newState.status).toBe("failed");
    });
  });
});
