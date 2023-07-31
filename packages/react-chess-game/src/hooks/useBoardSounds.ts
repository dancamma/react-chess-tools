import { useEffect } from "react";
import { useChessGameContext } from "./useChessGameContext";
import { type Sound } from "../assets/sounds";

export const useBoardSounds = (sounds: Record<Sound, HTMLAudioElement>) => {
  const {
    info: { lastMove, isCheckmate },
  } = useChessGameContext();
  useEffect(() => {
    if (isCheckmate) {
      sounds.gameOver.play();
      return;
    }
    if (lastMove?.captured) {
      sounds.capture.play();
      return;
    }
    if (lastMove) {
      sounds.move.play();
      return;
    }
  }, [lastMove]);
};
