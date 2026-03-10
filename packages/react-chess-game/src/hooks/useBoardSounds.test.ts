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
      isCheck?: boolean;
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
    expect(mockSounds.check.play).not.toHaveBeenCalled();
  });

  it("should not play sound when mounted with an existing checkmated position", () => {
    mockContextValue.info.lastMove = {
      from: "f3",
      to: "g5",
      piece: "Q" as PieceSymbol,
    } as unknown as Partial<Move>;
    mockContextValue.info.isCheck = true;
    mockContextValue.info.isCheckmate = true;

    renderHook(() => useBoardSounds(mockSounds));

    expect(mockSounds.move.play).not.toHaveBeenCalled();
    expect(mockSounds.capture.play).not.toHaveBeenCalled();
    expect(mockSounds.gameOver.play).not.toHaveBeenCalled();
    expect(mockSounds.check.play).not.toHaveBeenCalled();
  });

  it("should play move sound when lastMove changes", () => {
    const { rerender } = renderHook(() => useBoardSounds(mockSounds));

    mockContextValue.info.lastMove = {
      from: "e2",
      to: "e4",
      piece: "P" as PieceSymbol,
    } as unknown as Partial<Move>;

    mockedUseChessGameContext.mockReturnValue(
      mockContextValue as unknown as ReturnType<typeof useChessGameContext>,
    );
    rerender();

    expect(mockSounds.move.play).toHaveBeenCalledTimes(1);
    expect(mockSounds.capture.play).not.toHaveBeenCalled();
    expect(mockSounds.gameOver.play).not.toHaveBeenCalled();
  });

  it("should play capture sound when lastMove changes to a capture", () => {
    const { rerender } = renderHook(() => useBoardSounds(mockSounds));

    mockContextValue.info.lastMove = {
      from: "e4",
      to: "d5",
      piece: "P" as PieceSymbol,
      captured: "p" as PieceSymbol,
    } as unknown as Partial<Move>;
    mockedUseChessGameContext.mockReturnValue(
      mockContextValue as unknown as ReturnType<typeof useChessGameContext>,
    );

    rerender();

    expect(mockSounds.capture.play).toHaveBeenCalledTimes(1);
    expect(mockSounds.move.play).not.toHaveBeenCalled();
    expect(mockSounds.gameOver.play).not.toHaveBeenCalled();
  });

  it("should play gameOver sound when a new move ends in checkmate", () => {
    const { rerender } = renderHook(() => useBoardSounds(mockSounds));

    mockContextValue.info.isCheckmate = true;
    mockContextValue.info.lastMove = {
      from: "f3",
      to: "g5",
      piece: "Q" as PieceSymbol,
    } as unknown as Partial<Move>;
    mockedUseChessGameContext.mockReturnValue(
      mockContextValue as unknown as ReturnType<typeof useChessGameContext>,
    );

    rerender();

    expect(mockSounds.gameOver.play).toHaveBeenCalledTimes(1);
    expect(mockSounds.move.play).not.toHaveBeenCalled();
    expect(mockSounds.capture.play).not.toHaveBeenCalled();
  });

  it("should play gameOver sound even if the checkmating move was a capture", () => {
    const { rerender } = renderHook(() => useBoardSounds(mockSounds));

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

    rerender();

    expect(mockSounds.gameOver.play).toHaveBeenCalledTimes(1);
    expect(mockSounds.capture.play).not.toHaveBeenCalled();
    expect(mockSounds.move.play).not.toHaveBeenCalled();
  });

  it("should not play sound if lastMove becomes null", () => {
    const { rerender } = renderHook(() => useBoardSounds(mockSounds));

    mockContextValue.info.lastMove = {
      from: "e2",
      to: "e4",
      piece: "P" as PieceSymbol,
    } as unknown as Partial<Move>;
    mockedUseChessGameContext.mockReturnValue(
      mockContextValue as unknown as ReturnType<typeof useChessGameContext>,
    );

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

  it("should play check sound when a new move gives check", () => {
    const { rerender } = renderHook(() => useBoardSounds(mockSounds));

    mockContextValue.info.lastMove = {
      from: "f3",
      to: "g5",
      piece: "Q" as PieceSymbol,
    } as unknown as Partial<Move>;
    mockContextValue.info.isCheck = true;
    mockedUseChessGameContext.mockReturnValue(
      mockContextValue as unknown as ReturnType<typeof useChessGameContext>,
    );

    rerender();

    expect(mockSounds.check.play).toHaveBeenCalledTimes(1);
    expect(mockSounds.move.play).not.toHaveBeenCalled();
    expect(mockSounds.capture.play).not.toHaveBeenCalled();
    expect(mockSounds.gameOver.play).not.toHaveBeenCalled();
  });

  it("should play checkmate sound over check sound (checkmate takes precedence)", () => {
    const { rerender } = renderHook(() => useBoardSounds(mockSounds));

    mockContextValue.info.lastMove = {
      from: "f3",
      to: "g5",
      piece: "Q" as PieceSymbol,
    } as unknown as Partial<Move>;
    mockContextValue.info.isCheck = true;
    mockContextValue.info.isCheckmate = true;
    mockedUseChessGameContext.mockReturnValue(
      mockContextValue as unknown as ReturnType<typeof useChessGameContext>,
    );

    rerender();

    expect(mockSounds.gameOver.play).toHaveBeenCalledTimes(1);
    expect(mockSounds.check.play).not.toHaveBeenCalled();
    expect(mockSounds.move.play).not.toHaveBeenCalled();
    expect(mockSounds.capture.play).not.toHaveBeenCalled();
  });

  it("should not react to check state changes without a new lastMove", () => {
    const { rerender } = renderHook(() => useBoardSounds(mockSounds));

    mockContextValue.info.isCheck = true;
    mockedUseChessGameContext.mockReturnValue(
      mockContextValue as unknown as ReturnType<typeof useChessGameContext>,
    );
    rerender();

    expect(mockSounds.check.play).not.toHaveBeenCalled();
    expect(mockSounds.gameOver.play).not.toHaveBeenCalled();

    mockContextValue.info.isCheckmate = true;
    mockedUseChessGameContext.mockReturnValue(
      mockContextValue as unknown as ReturnType<typeof useChessGameContext>,
    );

    rerender();

    expect(mockSounds.check.play).not.toHaveBeenCalled();
    expect(mockSounds.gameOver.play).not.toHaveBeenCalled();
  });

  it("should play capture sound over check sound (capture takes precedence)", () => {
    const { rerender } = renderHook(() => useBoardSounds(mockSounds));

    mockContextValue.info.lastMove = {
      from: "e4",
      to: "d5",
      piece: "P" as PieceSymbol,
      captured: "p" as PieceSymbol,
    } as unknown as Partial<Move>;
    mockContextValue.info.isCheck = true;
    mockedUseChessGameContext.mockReturnValue(
      mockContextValue as unknown as ReturnType<typeof useChessGameContext>,
    );

    rerender();

    expect(mockSounds.capture.play).toHaveBeenCalledTimes(1);
    expect(mockSounds.check.play).not.toHaveBeenCalled();
    expect(mockSounds.move.play).not.toHaveBeenCalled();
    expect(mockSounds.gameOver.play).not.toHaveBeenCalled();
  });

  it("should use updated sounds when they change", () => {
    const { rerender } = renderHook((props) => useBoardSounds(props), {
      initialProps: mockSounds,
    });

    mockContextValue.info.lastMove = {
      from: "e2",
      to: "e4",
      piece: "P" as PieceSymbol,
    } as unknown as Partial<Move>;
    mockedUseChessGameContext.mockReturnValue(
      mockContextValue as unknown as ReturnType<typeof useChessGameContext>,
    );

    rerender(mockSounds);

    expect(mockSounds.move.play).toHaveBeenCalledTimes(1);

    const newMockSounds = createMockSounds();

    rerender(newMockSounds);

    expect(newMockSounds.move.play).not.toHaveBeenCalled();

    mockContextValue.info.lastMove = {
      from: "e7",
      to: "e5",
      piece: "P" as PieceSymbol,
    } as unknown as Partial<Move>;
    mockedUseChessGameContext.mockReturnValue(
      mockContextValue as unknown as ReturnType<typeof useChessGameContext>,
    );

    rerender(newMockSounds);

    expect(mockSounds.move.play).toHaveBeenCalledTimes(1);
    expect(newMockSounds.move.play).toHaveBeenCalledTimes(1);
    expect(newMockSounds.capture.play).not.toHaveBeenCalled();
    expect(newMockSounds.gameOver.play).not.toHaveBeenCalled();
  });
});
