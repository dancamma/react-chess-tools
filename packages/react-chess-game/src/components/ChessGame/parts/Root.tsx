import React from "react";
import { Color } from "chess.js";
import { useChessGame } from "../../../hooks/useChessGame";
import { ChessGameContext } from "../../../hooks/useChessGameContext";

export interface RootProps {
  fen?: string;
  orientation?: Color;
  animationDuration?: number;
}

export const Root: React.FC<React.PropsWithChildren<RootProps>> = ({
  fen,
  orientation,
  animationDuration,
  children,
}) => {
  const context = useChessGame({ fen, orientation, animationDuration });
  return (
    <ChessGameContext.Provider value={context}>
      {children}
    </ChessGameContext.Provider>
  );
};
