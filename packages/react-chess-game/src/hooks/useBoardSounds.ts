import { type Move } from "chess.js";
import { useEffect, useRef } from "react";
import { useChessGameContext } from "./useChessGameContext";
import { type Sound } from "../assets/sounds";

const playSound = async (audioElement: HTMLAudioElement) => {
  try {
    await audioElement.play();
  } catch (error) {
    console.warn("Failed to play sound:", (error as Error).message);
  }
};

const getMoveSignature = (move: Partial<Move> | null | undefined) => {
  if (!move?.from || !move?.to) {
    return null;
  }

  return [
    move.color ?? "",
    move.piece ?? "",
    move.from,
    move.to,
    move.captured ?? "",
    move.promotion ?? "",
    move.san ?? "",
  ].join(":");
};

export const useBoardSounds = (sounds: Record<Sound, HTMLAudioElement>) => {
  const {
    info: { lastMove, isCheckmate, isCheck },
  } = useChessGameContext();

  // Use ref to store sounds to avoid triggering effect on every render
  const soundsRef = useRef(sounds);
  soundsRef.current = sounds;
  const previousMoveSignatureRef = useRef<string | null>(null);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    const currentSounds = soundsRef.current;
    const currentMoveSignature = getMoveSignature(lastMove);

    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      previousMoveSignatureRef.current = currentMoveSignature;
      return;
    }

    if (!currentMoveSignature) {
      previousMoveSignatureRef.current = null;
      return;
    }

    if (currentMoveSignature === previousMoveSignatureRef.current) {
      return;
    }

    previousMoveSignatureRef.current = currentMoveSignature;

    if (Object.keys(currentSounds).length === 0) {
      return;
    }

    if (isCheckmate && currentSounds.gameOver) {
      playSound(currentSounds.gameOver);
      return;
    }

    if (lastMove?.captured && currentSounds.capture) {
      playSound(currentSounds.capture);
      return;
    }

    if (isCheck && currentSounds.check) {
      playSound(currentSounds.check);
      return;
    }

    if (lastMove && currentSounds.move) {
      playSound(currentSounds.move);
    }
  }, [lastMove, isCheck, isCheckmate]);
};
