import { renderHook } from "@testing-library/react";
import { type Move, type PieceSymbol } from "chess.js";
import { useBoardSounds } from "./useBoardSounds";
import { useChessGameContext } from "./useChessGameContext";
import { type Sound } from "../assets/sounds";

// Mock the context hook
jest.mock("./useChessGameContext");
const mockedUseChessGameContext = useChessGameContext as jest.MockedFunction<
  typeof useChessGameContext
>;

// Helper to create mock audio elements
const createMockSounds = (): Record<Sound, HTMLAudioElement> => ({
  move: { play: jest.fn() } as unknown as HTMLAudioElement,
  capture: { play: jest.fn() } as unknown as HTMLAudioElement,
  gameOver: { play: jest.fn() } as unknown as HTMLAudioElement,
  check: { play: jest.fn() } as unknown as HTMLAudioElement,
});

describe("useBoardSounds", () => {
  let mockSounds: Record<Sound, HTMLAudioElement>;
  let mockContextValue: {
    info: {
      lastMove?: Partial<Move> | null;
      isCheckmate?: boolean;
    };
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    mockSounds = createMockSounds();
    mockContextValue = {
      info: {
        lastMove: null,
        isCheckmate: false,
      },
    };
    mockedUseChessGameContext.mockReturnValue(
      mockContextValue as unknown as ReturnType<typeof useChessGameContext>,
    );
  });

  it("should not play any sound initially", () => {
    renderHook(() => useBoardSounds(mockSounds));
    expect(mockSounds.move.play).not.toHaveBeenCalled();
    expect(mockSounds.capture.play).not.toHaveBeenCalled();
    expect(mockSounds.gameOver.play).not.toHaveBeenCalled();
  });

  it("should play move sound when lastMove is present", () => {
    mockContextValue.info.lastMove = {
      from: "e2",
      to: "e4",
      piece: "P" as PieceSymbol,
    } as unknown as Partial<Move>;
    const { rerender } = renderHook(() => useBoardSounds(mockSounds));

    mockedUseChessGameContext.mockReturnValue(
      mockContextValue as unknown as ReturnType<typeof useChessGameContext>,
    );
    rerender();

    expect(mockSounds.move.play).toHaveBeenCalledTimes(1);
    expect(mockSounds.capture.play).not.toHaveBeenCalled();
    expect(mockSounds.gameOver.play).not.toHaveBeenCalled();
  });

  it("should play capture sound when lastMove includes a capture", () => {
    mockContextValue.info.lastMove = {
      from: "e4",
      to: "d5",
      piece: "P" as PieceSymbol,
      captured: "p" as PieceSymbol,
    } as unknown as Partial<Move>;
    mockedUseChessGameContext.mockReturnValue(
      mockContextValue as unknown as ReturnType<typeof useChessGameContext>,
    );

    const { rerender } = renderHook(() => useBoardSounds(mockSounds));
    rerender();

    expect(mockSounds.capture.play).toHaveBeenCalledTimes(1);
    expect(mockSounds.move.play).not.toHaveBeenCalled();
    expect(mockSounds.gameOver.play).not.toHaveBeenCalled();
  });

  it("should play gameOver sound when isCheckmate is true", () => {
    mockContextValue.info.isCheckmate = true;
    mockContextValue.info.lastMove = {
      from: "f3",
      to: "g5",
      piece: "Q" as PieceSymbol,
    } as unknown as Partial<Move>;
    mockedUseChessGameContext.mockReturnValue(
      mockContextValue as unknown as ReturnType<typeof useChessGameContext>,
    );

    const { rerender } = renderHook(() => useBoardSounds(mockSounds));
    rerender();

    expect(mockSounds.gameOver.play).toHaveBeenCalledTimes(1);
    expect(mockSounds.move.play).not.toHaveBeenCalled();
    expect(mockSounds.capture.play).not.toHaveBeenCalled();
  });

  it("should play gameOver sound even if last move was a capture", () => {
    mockContextValue.info.isCheckmate = true;
    mockContextValue.info.lastMove = {
      from: "f3",
      to: "g7",
      piece: "Q" as PieceSymbol,
      captured: "p" as PieceSymbol,
    } as unknown as Partial<Move>;
    mockedUseChessGameContext.mockReturnValue(
      mockContextValue as unknown as ReturnType<typeof useChessGameContext>,
    );

    const { rerender } = renderHook(() => useBoardSounds(mockSounds));
    rerender();

    expect(mockSounds.gameOver.play).toHaveBeenCalledTimes(1);
    expect(mockSounds.capture.play).not.toHaveBeenCalled();
    expect(mockSounds.move.play).not.toHaveBeenCalled();
  });

  it("should not play sound if lastMove becomes null", () => {
    mockContextValue.info.lastMove = {
      from: "e2",
      to: "e4",
      piece: "P" as PieceSymbol,
    } as unknown as Partial<Move>;
    mockedUseChessGameContext.mockReturnValue(
      mockContextValue as unknown as ReturnType<typeof useChessGameContext>,
    );
    const { rerender } = renderHook(() => useBoardSounds(mockSounds));
    rerender();
    expect(mockSounds.move.play).toHaveBeenCalledTimes(1);

    mockContextValue.info.lastMove = null;
    mockedUseChessGameContext.mockReturnValue(
      mockContextValue as unknown as ReturnType<typeof useChessGameContext>,
    );
    rerender();

    expect(mockSounds.move.play).toHaveBeenCalledTimes(1);
    expect(mockSounds.capture.play).not.toHaveBeenCalled();
    expect(mockSounds.gameOver.play).not.toHaveBeenCalled();
  });

  it("should use updated sounds when they change", () => {
    // Setup initial sounds and render hook
    mockContextValue.info.lastMove = {
      from: "e2",
      to: "e4",
      piece: "P" as PieceSymbol,
    } as unknown as Partial<Move>;
    mockedUseChessGameContext.mockReturnValue(
      mockContextValue as unknown as ReturnType<typeof useChessGameContext>,
    );

    const { rerender } = renderHook((props) => useBoardSounds(props), {
      initialProps: mockSounds,
    });

    // Verify initial sound played
    expect(mockSounds.move.play).toHaveBeenCalledTimes(1);

    // Create new set of mock sounds
    const newMockSounds = createMockSounds();

    // Re-render with new sounds and trigger a move
    rerender(newMockSounds);

    // Update lastMove to trigger sound effect with new sounds
    mockContextValue.info.lastMove = {
      from: "e7",
      to: "e5",
      piece: "P" as PieceSymbol,
    } as unknown as Partial<Move>;
    mockedUseChessGameContext.mockReturnValue(
      mockContextValue as unknown as ReturnType<typeof useChessGameContext>,
    );

    rerender(newMockSounds);

    // Original sounds should not be called again
    expect(mockSounds.move.play).toHaveBeenCalledTimes(1);

    // New sounds should be called
    expect(newMockSounds.move.play).toHaveBeenCalledTimes(1);
    expect(newMockSounds.capture.play).not.toHaveBeenCalled();
    expect(newMockSounds.gameOver.play).not.toHaveBeenCalled();
  });
});
