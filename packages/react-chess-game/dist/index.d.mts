import * as React from 'react';
import React__default from 'react';
import { Chessboard } from 'react-chessboard';
import * as chess_js from 'chess.js';
import { Color, Chess } from 'chess.js';

type Sound = "check" | "move" | "capture" | "gameOver";

interface ChessGameProps extends React__default.ComponentProps<typeof Chessboard> {
}

interface RootProps {
    fen?: string;
    orientation?: Color;
}

declare const ChessGame: {
    Root: React.FC<React.PropsWithChildren<RootProps>>;
    Board: React.FC<ChessGameProps>;
    Sounds: React.FC<Partial<Record<Sound, string>>>;
};

declare const useChessGameContext: () => {
    game: chess_js.Chess;
    orientation: chess_js.Color;
    info: {
        turn: chess_js.Color;
        isPlayerTurn: boolean;
        isOpponentTurn: boolean;
        moveNumber: number;
        lastMove: chess_js.Move | undefined;
        isCheck: boolean;
        isCheckmate: boolean;
        isDraw: boolean;
        isStalemate: boolean;
        isThreefoldRepetition: boolean;
        isInsufficientMaterial: boolean;
        isGameOver: boolean;
        isDrawn: boolean;
        hasPlayerWon: boolean;
        hasPlayerLost: boolean;
    };
    methods: {
        makeMove: (move: string | {
            from: string;
            to: string;
            promotion?: string | undefined;
        }) => boolean;
        setPosition: (fen: string, orientation: chess_js.Color) => void;
        flipBoard: () => void;
    };
};

type useChessGameProps = {
    fen?: string;
    orientation?: Color;
};
declare const useChessGame: ({ fen, orientation: initialOrientation, }?: useChessGameProps) => {
    game: Chess;
    orientation: Color;
    info: {
        turn: Color;
        isPlayerTurn: boolean;
        isOpponentTurn: boolean;
        moveNumber: number;
        lastMove: chess_js.Move | undefined;
        isCheck: boolean;
        isCheckmate: boolean;
        isDraw: boolean;
        isStalemate: boolean;
        isThreefoldRepetition: boolean;
        isInsufficientMaterial: boolean;
        isGameOver: boolean;
        isDrawn: boolean;
        hasPlayerWon: boolean;
        hasPlayerLost: boolean;
    };
    methods: {
        makeMove: (move: Parameters<Chess["move"]>[0]) => boolean;
        setPosition: (fen: string, orientation: Color) => void;
        flipBoard: () => void;
    };
};

export { ChessGame, useChessGame, useChessGameContext };
