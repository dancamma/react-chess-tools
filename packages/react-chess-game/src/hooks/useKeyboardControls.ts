import { useEffect } from "react";
import {
  defaultKeyboardControls,
  KeyboardControls,
} from "../components/ChessGame/parts/KeyboardControls";
import { useChessGameContext } from "./useChessGameContext";

export const useKeyboardControls = (controls?: KeyboardControls) => {
  const gameContext = useChessGameContext();
  if (!gameContext) {
    throw new Error("ChessGameContext not found");
  }
  const keyboardControls = { ...defaultKeyboardControls, ...controls };
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const handler = keyboardControls[event.key];
      if (handler) {
        event.preventDefault();
        handler(gameContext);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameContext]);
  return null;
};
