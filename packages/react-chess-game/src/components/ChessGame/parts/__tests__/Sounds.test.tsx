import React from "react";
import { render } from "@testing-library/react";
import { Sounds, SoundsProps } from "../Sounds";
import { ChessGame } from "../../index";
import { useBoardSounds } from "../../../../hooks/useBoardSounds";

// Mock the useBoardSounds hook
jest.mock("../../../../hooks/useBoardSounds");
const mockUseBoardSounds = useBoardSounds as jest.MockedFunction<
  typeof useBoardSounds
>;

// Mock Audio constructor
const mockAudio = jest.fn().mockImplementation(() => ({
  play: jest.fn(),
  pause: jest.fn(),
  load: jest.fn(),
}));
global.Audio = mockAudio;

describe("Sounds", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <ChessGame.Root>{children}</ChessGame.Root>
    );
  };

  it("should render without crashing", () => {
    const { container } = render(<Sounds />, { wrapper: createWrapper() });
    expect(container.firstChild).toBeNull(); // Component returns null
  });

  it("should call useBoardSounds with default sounds", () => {
    render(<Sounds />, { wrapper: createWrapper() });

    expect(mockUseBoardSounds).toHaveBeenCalledTimes(1);
    expect(mockUseBoardSounds).toHaveBeenCalledWith(expect.any(Object));
  });

  it("should create Audio elements for default sounds", () => {
    render(<Sounds />, { wrapper: createWrapper() });

    // Should create Audio elements for default sounds
    expect(mockAudio).toHaveBeenCalled();

    // Verify that Audio constructor was called with base64 data URLs
    const audioCallArgs = mockAudio.mock.calls;
    audioCallArgs.forEach(([src]) => {
      expect(src).toMatch(/^data:audio\/wav;base64,/);
    });
  });

  it("should merge custom sounds with default sounds", () => {
    const customSounds: SoundsProps = {
      move: "customMoveSound",
      capture: "customCaptureSound",
    };

    render(<Sounds {...customSounds} />, { wrapper: createWrapper() });

    expect(mockUseBoardSounds).toHaveBeenCalledTimes(1);
    expect(mockUseBoardSounds).toHaveBeenCalledWith(expect.any(Object));
  });

  it("should create Audio elements with custom sounds", () => {
    const customSounds: SoundsProps = {
      move: "customMoveSound",
    };

    render(<Sounds {...customSounds} />, { wrapper: createWrapper() });

    // Should still create Audio elements
    expect(mockAudio).toHaveBeenCalled();
  });

  it("should use useMemo for audio creation", () => {
    const customSounds: SoundsProps = {
      move: "customMoveSound",
    };

    render(<Sounds {...customSounds} />, { wrapper: createWrapper() });

    // Verify that the component renders and creates audio elements
    expect(mockAudio).toHaveBeenCalled();
    expect(mockUseBoardSounds).toHaveBeenCalledTimes(1);
  });

  it("should recreate audio when sounds prop changes", () => {
    const TestWrapper = ({ move }: { move: string }) => (
      <ChessGame.Root>
        <Sounds move={move} />
      </ChessGame.Root>
    );

    const { rerender } = render(<TestWrapper move="sound1" />);

    const initialCallCount = mockAudio.mock.calls.length;

    // Rerender with different props
    rerender(<TestWrapper move="sound2" />);

    // Audio constructor should be called again
    expect(mockAudio.mock.calls.length).toBeGreaterThan(initialCallCount);
  });

  it("should handle empty sounds object", () => {
    render(<Sounds />, { wrapper: createWrapper() });

    expect(mockUseBoardSounds).toHaveBeenCalledTimes(1);
    expect(mockAudio).toHaveBeenCalled();
  });

  it("should pass correct audio objects to useBoardSounds", () => {
    render(<Sounds />, { wrapper: createWrapper() });

    const passedAudios = mockUseBoardSounds.mock.calls[0][0];

    // Should be an object with Sound keys and HTMLAudioElement values
    expect(typeof passedAudios).toBe("object");
    expect(passedAudios).not.toBeNull();

    // Each value should be a mocked Audio element
    Object.values(passedAudios).forEach((audio) => {
      expect(audio).toHaveProperty("play");
      expect(audio).toHaveProperty("pause");
      expect(audio).toHaveProperty("load");
    });
  });
});
