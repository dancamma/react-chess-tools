import * as React from 'react';
import React__default from 'react';
import { ChessGame } from '@react-chess-tools/react-chess-game';

type Status = "not-started" | "in-progress" | "solved" | "failed";
type Hint = "none" | "piece" | "move";
type Puzzle = {
    fen: string;
    moves: string[];
    makeFirstMove?: boolean;
};

interface HintProps {
    asChild?: boolean;
    showOn?: Status[];
}

interface ResetProps {
    asChild?: boolean;
    puzzle?: Puzzle;
    onReset?: () => void;
    showOn?: Status[];
}

interface PuzzleBoardProps extends React__default.ComponentProps<typeof ChessGame.Board> {
}

interface RootProps {
    puzzle: Puzzle;
    onSolve?: (changePuzzle: (puzzle: Puzzle) => void) => void;
    onFail?: (changePuzzle: (puzzle: Puzzle) => void) => void;
}

declare const ChessPuzzle: {
    Root: React.FC<React.PropsWithChildren<RootProps>>;
    Board: React.FC<PuzzleBoardProps>;
    Reset: React.FC<React.PropsWithChildren<ResetProps>>;
    Hint: React.FC<React.PropsWithChildren<HintProps>>;
};

declare const useChessPuzzleContext: () => {
    status: Status;
    changePuzzle: (puzzle: Puzzle) => void;
    puzzle: Puzzle;
    hint: Hint;
    onHint: () => void;
    nextMove: string | null | undefined;
    isPlayerTurn: boolean;
};

export { ChessPuzzle, useChessPuzzleContext };
