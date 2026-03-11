import { useMemo } from "react";

import { useBoardSounds } from "../../../hooks/useBoardSounds";
import { type AudioOverrides, AUDIO_EVENT_NAMES } from "../../../types/audio";
import { resolveAudioSources } from "../../../utils/audioManager";

/**
 * Props for the Sounds component
 *
 * Note: This is a logic-only component that returns null and does not render
 * any DOM elements. It sets up board sounds via the useBoardSounds hook.
 * Therefore, it does not accept HTML attributes like className, style, etc.
 */
export type SoundsProps = {
  sounds?: AudioOverrides;
};

export const Sounds: React.FC<SoundsProps> = ({ sounds }) => {
  const resolvedSources = useMemo(
    () => resolveAudioSources(sounds),
    AUDIO_EVENT_NAMES.map((eventName) => sounds?.[eventName]),
  );

  useBoardSounds(resolvedSources);
  return null;
};

Sounds.displayName = "ChessGame.Sounds";
