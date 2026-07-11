import { defaultSoundSources } from "../assets/sounds";
import {
  AUDIO_EVENT_NAMES,
  type AudioEventName,
  type AudioOverrides,
  type ResolvedAudioSources,
} from "../types/audio";

export interface AudioManager {
  play: (eventName: AudioEventName) => void;
  destroy: () => void;
}

const createNoopAudioManager = (): AudioManager => ({
  play: () => {},
  destroy: () => {},
});

const canUseAudioElement = () =>
  typeof window !== "undefined" && typeof Audio !== "undefined";

export const resolveAudioSources = (
  overrides?: AudioOverrides,
): ResolvedAudioSources => ({
  ...defaultSoundSources,
  ...overrides,
});

export const createAudioManager = (
  sources: ResolvedAudioSources,
): AudioManager => {
  if (!canUseAudioElement()) {
    return createNoopAudioManager();
  }

  const audioElements = Object.fromEntries(
    AUDIO_EVENT_NAMES.map((eventName) => {
      const audioElement = new Audio(sources[eventName]);
      audioElement.preload = "auto";

      return [eventName, audioElement];
    }),
  ) as Record<AudioEventName, HTMLAudioElement>;

  return {
    play: (eventName) => {
      const audioElement = audioElements[eventName];

      if (!audioElement) {
        return;
      }

      try {
        audioElement.currentTime = 0;
        void audioElement.play().catch(() => {});
      } catch {
        // Ignore playback failures such as autoplay restrictions.
      }
    },
    destroy: () => {
      Object.values(audioElements).forEach((audioElement) => {
        try {
          audioElement.pause();
          audioElement.removeAttribute("src");
          audioElement.load();
        } catch {
          // Ignore cleanup failures in partial browser/test environments.
        }
      });
    },
  };
};
