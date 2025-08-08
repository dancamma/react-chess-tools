import React from "react";
import { Color } from "chess.js";
import { useChessGame } from "../../../hooks/useChessGame";
import { ChessGameContext } from "../../../hooks/useChessGameContext";

export interface RootProps {
  fen?: string;
  orientation?: Color;
}

export const Root: React.FC<React.PropsWithChildren<RootProps>> = ({
  fen,
  orientation,
  children,
}) => {
  const context = useChessGame({ fen, orientation });
  return (
    <ChessGameContext.Provider value={context}>
      {children}
    </ChessGameContext.Provider>
  );
};
