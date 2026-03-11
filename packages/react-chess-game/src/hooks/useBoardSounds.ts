import { useEffect, useRef } from "react";

import { type ResolvedAudioSources } from "../types/audio";
import { createAudioManager, type AudioManager } from "../utils/audioManager";
import { useChessGameContext } from "./useChessGameContext";

export const useBoardSounds = (sources: ResolvedAudioSources) => {
  const { audioEvent } = useChessGameContext();
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
    if (!audioEvent) {
      return;
    }

    audioManagerRef.current?.play(audioEvent.type);
  }, [audioEvent]);
};
