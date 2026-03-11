export const AUDIO_EVENT_NAMES = [
  "move",
  "capture",
  "check",
  "checkmate",
  "draw",
  "timeout",
  "castle",
  "promotion",
  "illegalMove",
] as const;

export type AudioEventName = (typeof AUDIO_EVENT_NAMES)[number];

export type AudioOverrides = Partial<Record<AudioEventName, string>>;

export type ResolvedAudioSources = Record<AudioEventName, string>;
