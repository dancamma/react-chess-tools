import { useEffect } from "react";
import { defaultKeyboardEvents } from "../components/ChessGame/parts/KeyboardEvents";
import { useChessGameContext } from "./useChessGameContext";
import { KeyboardEvents } from "../components/ChessGame/parts/KeyboardEvents";

export const useKeyboardEvents = (events?: KeyboardEvents) => {
  const gameContext = useChessGameContext();
  if (!gameContext) {
    throw new Error("ChessGameContext not found");
  }
  const keyboardEvents = { ...defaultKeyboardEvents, ...events };
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const handler = keyboardEvents[event.key];
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
