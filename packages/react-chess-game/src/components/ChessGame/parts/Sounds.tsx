import { useMemo } from "react";
import { defaultSounds, type Sound } from "../../../assets/sounds";
import { useBoardSounds } from "../../../hooks/useBoardSounds";

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
