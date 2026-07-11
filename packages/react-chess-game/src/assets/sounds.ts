import captureSound from "./audio/capture.ogg";
import silenceSound from "./audio/silence.ogg";
import moveSound from "./audio/move.ogg";
import notifySound from "./audio/notify.ogg";
import timeoutSound from "./audio/timeout.ogg";

import { type ResolvedAudioSources } from "../types/audio";

// Sound mappings based on lichess audio:
// - move, check, castle, promotion → Move.ogg (all are moves)
// - capture → Capture.ogg
// - checkmate, draw → GenericNotify.ogg (renamed to notify.ogg)
// - timeout → LowTime.ogg (renamed to timeout.ogg)
// - illegalMove → Silence.ogg from lichess (silent for invalid moves)
export const defaultSoundSources: ResolvedAudioSources = {
  move: moveSound,
  capture: captureSound,
  check: moveSound,
  checkmate: notifySound,
  draw: notifySound,
  timeout: timeoutSound,
  castle: moveSound,
  promotion: moveSound,
  illegalMove: silenceSound,
};
