import { useMemo } from "react";
import { defaultSounds, type Sound } from "../../../assets/sounds";
import { useBoardSounds } from "../../../hooks/useBoardSounds";

export type SoundsProps = Partial<Record<Sound, string>>;

export const Sounds: React.FC<SoundsProps> = (sounds) => {
  const customSoundsAudios = useMemo(() => {
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
