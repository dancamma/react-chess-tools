import { useEffect, useRef } from "react";

import { type AudioEventName, type ResolvedAudioSources } from "../types/audio";
import { type ChessGameEvent } from "../types/gameEvents";
import { createAudioManager, type AudioManager } from "../utils/audioManager";
import { useChessGameContext } from "./useChessGameContext";

const getAudioEventForGameEvent = (
  gameEvent: ChessGameEvent,
): AudioEventName => {
  if (gameEvent.type === "illegal-move") {
    return "illegalMove";
  }

  if (gameEvent.type === "clock-timeout") {
    return "timeout";
  }

  if (gameEvent.isCheckmate) {
    return "checkmate";
  }

  if (gameEvent.isDraw) {
    return "draw";
  }

  if (gameEvent.move.promotion) {
    return "promotion";
  }

  if (
    gameEvent.move.flags.includes("k") ||
    gameEvent.move.flags.includes("q")
  ) {
    return "castle";
  }

  if (gameEvent.move.captured) {
    return "capture";
  }

  if (gameEvent.isCheck) {
    return "check";
  }

  return "move";
};

export const useBoardSounds = (sources: ResolvedAudioSources) => {
  const { gameEvent } = useChessGameContext();
  const audioManagerRef = useRef<AudioManager | null>(null);

  useEffect(() => {
    const audioManager = createAudioManager(sources);
    audioManagerRef.current = audioManager;

    return () => {
      audioManager.destroy();

      if (audioManagerRef.current === audioManager) {
        audioManagerRef.current = null;
      }
    };
  }, [sources]);

  useEffect(() => {
    if (!gameEvent) {
      return;
    }

    audioManagerRef.current?.play(getAudioEventForGameEvent(gameEvent));
  }, [gameEvent]);
};
