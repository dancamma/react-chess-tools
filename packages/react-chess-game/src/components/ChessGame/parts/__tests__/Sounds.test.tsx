import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ChessGame } from "../..";
import { Sounds } from "../Sounds";

// Mock Audio constructor
const mockAudioInstances: HTMLAudioElement[] = [];
class MockAudio {
  src: string;
  play = jest.fn().mockResolvedValue(undefined);
  constructor(src: string) {
    this.src = src;
    mockAudioInstances.push(this as unknown as HTMLAudioElement);
  }
}

describe("ChessGame.Sounds", () => {
  beforeEach(() => {
    mockAudioInstances.length = 0;
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

    // Sounds should not render any DOM elements
    expect(container.querySelector("*")).toBeNull();
  });

  describe("sound override merging", () => {
    let originalAudio: typeof window.Audio;

    beforeAll(() => {
      originalAudio = window.Audio;
      (window as unknown as Record<string, unknown>).Audio = MockAudio;
    });

    afterAll(() => {
      window.Audio = originalAudio;
    });

    it("should properly merge custom sounds with default sounds", () => {
      const customMoveSound = "customMoveBase64";
      render(
        <ChessGame.Root>
          <ChessGame.Sounds sounds={{ move: customMoveSound }} />
        </ChessGame.Root>,
      );

      // Find the audio instance for the move sound
      const moveAudio = mockAudioInstances.find(
        (audio) => audio.src === `data:audio/wav;base64,${customMoveSound}`,
      );

      // Should have created an audio element with the custom sound
      expect(moveAudio).toBeDefined();
    });

    it("should include default sounds not overridden", () => {
      render(
        <ChessGame.Root>
          <ChessGame.Sounds />
        </ChessGame.Root>,
      );

      // All default sounds should be created
      expect(mockAudioInstances.length).toBe(4); // move, capture, gameOver, check
    });
  });
});
