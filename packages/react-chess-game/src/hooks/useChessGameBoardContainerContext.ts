import React from "react";

export type ChessGameBoardContainerContextType = {
  boardContainerRef: React.RefObject<HTMLDivElement | null>;
  boardContainerElement: HTMLDivElement | null;
  setBoardContainerElement: (node: HTMLDivElement | null) => void;
};

export const ChessGameBoardContainerContext =
  React.createContext<ChessGameBoardContainerContextType | null>(null);

export const useChessGameBoardContainerContext = () => {
  const context = React.useContext(ChessGameBoardContainerContext);
  if (!context) {
    throw new Error(
      "useChessGameBoardContainerContext must be used within a ChessGame.Root component.",
    );
  }
  return context;
};
