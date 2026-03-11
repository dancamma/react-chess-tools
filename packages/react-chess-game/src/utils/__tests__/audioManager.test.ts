import { readdirSync } from "node:fs";
import path from "node:path";

import { defaultSoundSources } from "../../assets/sounds";
import { AUDIO_EVENT_NAMES } from "../../types/audio";
import { createAudioManager, resolveAudioSources } from "../audioManager";

const packageRoot = path.resolve(__dirname, "../../..");

const mockAudioInstances: MockAudio[] = [];

class MockAudio {
  currentTime = 0;
  preload = "";
  pause = jest.fn();
  play = jest.fn().mockResolvedValue(undefined);
  load = jest.fn();
  removeAttribute = jest.fn((attributeName: string) => {
    if (attributeName === "src") {
      this.src = "";
    }
  });

  constructor(public src: string) {
    mockAudioInstances.push(this);
  }
}

describe("audioManager", () => {
  let originalAudio: typeof window.Audio;

  beforeAll(() => {
    originalAudio = window.Audio;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockAudioInstances.length = 0;
    (window as unknown as Record<string, unknown>).Audio = MockAudio;
  });

  afterAll(() => {
    window.Audio = originalAudio;
  });

  it("should expose built-in .ogg sources for every supported event", () => {
    expect(Object.keys(defaultSoundSources)).toEqual([...AUDIO_EVENT_NAMES]);
    expect(
      Object.values(defaultSoundSources).every((src) => src.endsWith(".ogg")),
    ).toBe(true);
  });

  it("should resolve overrides without affecting other default sources", () => {
    const overriddenSources = resolveAudioSources({
      move: "https://example.com/custom-move.ogg",
    });

    expect(overriddenSources.move).toBe("https://example.com/custom-move.ogg");
    expect(overriddenSources.capture).toBe(defaultSoundSources.capture);
    expect(overriddenSources.checkmate).toBe(defaultSoundSources.checkmate);
  });

  it("should initialize one audio element per supported event", () => {
    createAudioManager(resolveAudioSources());

    expect(mockAudioInstances).toHaveLength(AUDIO_EVENT_NAMES.length);
    expect(
      mockAudioInstances.every((audio) => audio.src.endsWith(".ogg")),
    ).toBe(true);
  });

  it("should ignore playback failures", () => {
    const audioManager = createAudioManager(resolveAudioSources());

    mockAudioInstances[0]?.play.mockRejectedValueOnce(new Error("blocked"));

    expect(() => audioManager.play("move")).not.toThrow();
  });

  it("should return a noop manager when Audio is unavailable", () => {
    (window as unknown as Record<string, unknown>).Audio = undefined;

    const audioManager = createAudioManager(resolveAudioSources());

    expect(() => audioManager.play("move")).not.toThrow();
    expect(() => audioManager.destroy()).not.toThrow();
  });

  it("should include built-in audio assets in the package source", () => {
    const sourceAudioFiles = readdirSync(
      path.join(packageRoot, "src", "assets", "audio"),
    ).filter((entry) => entry.endsWith(".ogg"));

    // We use shared audio files for similar events (e.g., move/check/checkmate/castle/promotion all use move.ogg)
    // Expected files: capture.ogg, error.ogg, move.ogg, notify.ogg, timeout.ogg
    const expectedFiles = [
      "capture.ogg",
      "error.ogg",
      "move.ogg",
      "notify.ogg",
      "timeout.ogg",
    ];
    expect(sourceAudioFiles.sort()).toEqual(expectedFiles.sort());
  });
});
