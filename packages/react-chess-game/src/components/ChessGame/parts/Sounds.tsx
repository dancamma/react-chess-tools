import { useMemo } from "react";
import { defaultSounds, type Sound } from "../../../assets/sounds";
import { useBoardSounds } from "../../../hooks/useBoardSounds";

/**
 * Props for the Sounds component
 *
 * Note: This is a logic-only component that returns null and does not render
 * any DOM elements. It sets up board sounds via the useBoardSounds hook.
 * Therefore, it does not accept HTML attributes like className, style, etc.
 */
export type SoundsProps = {
  sounds?: Partial<Record<Sound, string>>;
};

export const Sounds: React.FC<SoundsProps> = ({ sounds }) => {
  const customSoundsAudios = useMemo(() => {
    if (typeof window === "undefined" || typeof Audio === "undefined") {
      return {} as Record<Sound, HTMLAudioElement>;
    }

    return Object.entries({ ...defaultSounds, sounds }).reduce(
      (acc, [name, base64]) => {
        acc[name as Sound] = new Audio(`data:audio/wav;base64,${base64}`);
        return acc;
      },
      {} as Record<Sound, HTMLAudioElement>,
    );
  }, [sounds]);
  useBoardSounds(customSoundsAudios);
  return null;
};

Sounds.displayName = "ChessGame.Sounds";
