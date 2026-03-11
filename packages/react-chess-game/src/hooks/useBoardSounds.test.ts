import { renderHook } from "@testing-library/react";

import {
  type ChessGameAudioEvent,
  type ResolvedAudioSources,
  AUDIO_EVENT_NAMES,
} from "../types/audio";
import { createAudioManager } from "../utils/audioManager";
import { useBoardSounds } from "./useBoardSounds";
import { useChessGameContext } from "./useChessGameContext";

jest.mock("./useChessGameContext");
jest.mock("../utils/audioManager");

const mockedUseChessGameContext = useChessGameContext as jest.MockedFunction<
  typeof useChessGameContext
>;
const mockedCreateAudioManager = createAudioManager as jest.MockedFunction<
  typeof createAudioManager
>;

const sources = AUDIO_EVENT_NAMES.reduce((acc, eventName) => {
  acc[eventName] = `https://example.com/${eventName}.ogg`;
  return acc;
}, {} as ResolvedAudioSources);

describe("useBoardSounds", () => {
  const mockPlay = jest.fn();
  const mockDestroy = jest.fn();
  const mockContextValue: {
    audioEvent: ChessGameAudioEvent | null;
  } = {
    audioEvent: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseChessGameContext.mockReturnValue(
      mockContextValue as unknown as ReturnType<typeof useChessGameContext>,
    );
    mockedCreateAudioManager.mockReturnValue({
      play: mockPlay,
      destroy: mockDestroy,
    });
    mockContextValue.audioEvent = null;
  });

  it("should not play any sound without an audio event", () => {
    renderHook(() => useBoardSounds(sources));

    expect(mockedCreateAudioManager).toHaveBeenCalledWith(sources);
    expect(mockPlay).not.toHaveBeenCalled();
  });

  it.each(AUDIO_EVENT_NAMES)(
    "should play the expected sound for %s events",
    (eventName) => {
      const { rerender } = renderHook(() => useBoardSounds(sources));

      mockContextValue.audioEvent = {
        id: 1,
        type: eventName,
      };
      mockedUseChessGameContext.mockReturnValue(
        mockContextValue as unknown as ReturnType<typeof useChessGameContext>,
      );

      rerender();

      expect(mockPlay).toHaveBeenCalledWith(eventName);
    },
  );

  it("should play repeated events when the id changes", () => {
    const { rerender } = renderHook(() => useBoardSounds(sources));

    mockContextValue.audioEvent = {
      id: 1,
      type: "move",
    };
    mockedUseChessGameContext.mockReturnValue(
      mockContextValue as unknown as ReturnType<typeof useChessGameContext>,
    );
    rerender();

    mockContextValue.audioEvent = {
      id: 2,
      type: "move",
    };
    mockedUseChessGameContext.mockReturnValue(
      mockContextValue as unknown as ReturnType<typeof useChessGameContext>,
    );
    rerender();

    expect(mockPlay).toHaveBeenCalledTimes(2);
    expect(mockPlay).toHaveBeenNthCalledWith(1, "move");
    expect(mockPlay).toHaveBeenNthCalledWith(2, "move");
  });

  it("should destroy the audio manager on unmount", () => {
    const { unmount } = renderHook(() => useBoardSounds(sources));

    unmount();

    expect(mockDestroy).toHaveBeenCalledTimes(1);
  });
});
