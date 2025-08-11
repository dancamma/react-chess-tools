import { useEffect } from "react";
import { useChessGameContext } from "./useChessGameContext";
import { type Sound } from "../assets/sounds";

const playSound = async (audioElement: HTMLAudioElement) => {
  try {
    await audioElement.play();
  } catch (error) {
    console.warn("Failed to play sound:", (error as Error).message);
  }
};

export const useBoardSounds = (sounds: Record<Sound, HTMLAudioElement>) => {
  const {
    info: { lastMove, isCheckmate },
  } = useChessGameContext();

  useEffect(() => {
    if (Object.keys(sounds).length === 0) {
      return;
    }

    if (isCheckmate && sounds.gameOver) {
      playSound(sounds.gameOver);
      return;
    }

    if (lastMove?.captured && sounds.capture) {
      playSound(sounds.capture);
      return;
    }

    if (lastMove && sounds.move) {
      playSound(sounds.move);
    }
  }, [lastMove, isCheckmate, sounds]);
};
