import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { ChessGame } from "../..";
import { Sounds } from "../Sounds";

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

describe("ChessGame.Sounds", () => {
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

  it("should have correct displayName", () => {
    expect(Sounds.displayName).toBe("ChessGame.Sounds");
  });

  it("should render null (no DOM element)", () => {
    const { container } = render(
      <ChessGame.Root>
        <ChessGame.Sounds />
      </ChessGame.Root>,
    );

    expect(container.querySelector("*")).toBeNull();
  });

  it("should initialize the built-in sounds by default", () => {
    render(
      <ChessGame.Root>
        <ChessGame.Sounds />
      </ChessGame.Root>,
    );

    expect(mockAudioInstances).toHaveLength(9);
    expect(
      mockAudioInstances.every((audio) => audio.src.endsWith(".ogg")),
    ).toBe(true);
  });

  it("should apply custom overrides per event", () => {
    render(
      <ChessGame.Root>
        <ChessGame.Sounds
          sounds={{
            move: "https://example.com/custom-move.ogg",
          }}
        />
      </ChessGame.Root>,
    );

    expect(
      mockAudioInstances.some(
        (audio) => audio.src === "https://example.com/custom-move.ogg",
      ),
    ).toBe(true);
    expect(
      mockAudioInstances.some((audio) => audio.src === "audio-file-stub.ogg"),
    ).toBe(true);
  });

  it("should not create audio elements when ChessGame.Sounds is not mounted", () => {
    render(
      <ChessGame.Root>
        <div>silent game</div>
      </ChessGame.Root>,
    );

    expect(mockAudioInstances).toHaveLength(0);
  });

  it("should not fail when Audio is unavailable", () => {
    (window as unknown as Record<string, unknown>).Audio = undefined;

    expect(() =>
      render(
        <ChessGame.Root>
          <ChessGame.Sounds />
        </ChessGame.Root>,
      ),
    ).not.toThrow();
  });
});
