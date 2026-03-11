import { renderHook } from "@testing-library/react";

import { type ResolvedAudioSources, AUDIO_EVENT_NAMES } from "../types/audio";
import { type ChessGameEvent } from "../types/gameEvents";
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
    gameEvent: ChessGameEvent | null;
  } = {
    gameEvent: null,
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
    mockContextValue.gameEvent = null;
  });

  it("should not play any sound without a game event", () => {
    renderHook(() => useBoardSounds(sources));

    expect(mockedCreateAudioManager).toHaveBeenCalledWith(sources);
    expect(mockPlay).not.toHaveBeenCalled();
  });

  it.each([
    [
      "regular moves",
      {
        id: 1,
        type: "move-made",
        fen: "fen",
        isCheck: false,
        isCheckmate: false,
        isDraw: false,
        move: { san: "e4", flags: "b" },
      },
      "move",
    ],
    [
      "captures",
      {
        id: 1,
        type: "move-made",
        fen: "fen",
        isCheck: false,
        isCheckmate: false,
        isDraw: false,
        move: { san: "exd5", captured: "p", flags: "c" },
      },
      "capture",
    ],
    [
      "checks",
      {
        id: 1,
        type: "move-made",
        fen: "fen",
        isCheck: true,
        isCheckmate: false,
        isDraw: false,
        move: { san: "Qe7+", flags: "n" },
      },
      "check",
    ],
    [
      "checkmates",
      {
        id: 1,
        type: "move-made",
        fen: "fen",
        isCheck: true,
        isCheckmate: true,
        isDraw: false,
        move: { san: "Qh4#", flags: "n" },
      },
      "checkmate",
    ],
    [
      "draws",
      {
        id: 1,
        type: "move-made",
        fen: "fen",
        isCheck: false,
        isCheckmate: false,
        isDraw: true,
        move: { san: "Qb6", flags: "n" },
      },
      "draw",
    ],
    [
      "castles",
      {
        id: 1,
        type: "move-made",
        fen: "fen",
        isCheck: false,
        isCheckmate: false,
        isDraw: false,
        move: { san: "O-O", flags: "k" },
      },
      "castle",
    ],
    [
      "promotions",
      {
        id: 1,
        type: "move-made",
        fen: "fen",
        isCheck: false,
        isCheckmate: false,
        isDraw: false,
        move: { san: "a8=Q", promotion: "q", flags: "np" },
      },
      "promotion",
    ],
    [
      "illegal moves",
      {
        id: 1,
        type: "illegal-move",
        attemptedMove: "e5",
      },
      "illegalMove",
    ],
    [
      "clock timeouts",
      {
        id: 1,
        type: "clock-timeout",
        player: "white",
      },
      "timeout",
    ],
  ])(
    "should play the expected sound for %s",
    (_, gameEvent, audioEventName) => {
      const { rerender } = renderHook(() => useBoardSounds(sources));

      mockContextValue.gameEvent = gameEvent as ChessGameEvent;
      mockedUseChessGameContext.mockReturnValue(
        mockContextValue as unknown as ReturnType<typeof useChessGameContext>,
      );

      rerender();

      expect(mockPlay).toHaveBeenCalledWith(audioEventName);
    },
  );

  it("should play repeated events when the id changes", () => {
    const { rerender } = renderHook(() => useBoardSounds(sources));

    mockContextValue.gameEvent = {
      id: 1,
      type: "move-made",
      fen: "fen-1",
      isCheck: false,
      isCheckmate: false,
      isDraw: false,
      move: { san: "e4", flags: "b" } as never,
    };
    mockedUseChessGameContext.mockReturnValue(
      mockContextValue as unknown as ReturnType<typeof useChessGameContext>,
    );
    rerender();

    mockContextValue.gameEvent = {
      id: 2,
      type: "move-made",
      fen: "fen-2",
      isCheck: false,
      isCheckmate: false,
      isDraw: false,
      move: { san: "e5", flags: "b" } as never,
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
