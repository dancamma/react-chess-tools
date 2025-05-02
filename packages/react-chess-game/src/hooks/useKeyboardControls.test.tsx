import { renderHook, act } from "@testing-library/react";
import { useKeyboardControls } from "./useKeyboardControls";
import {
  useChessGameContext,
  ChessGameContextType,
} from "./useChessGameContext";
import { defaultKeyboardControls } from "../components/ChessGame/parts/KeyboardControls";
import { Chess, Color } from "chess.js";

// Mock the context hook
jest.mock("./useChessGameContext");
const mockUseChessGameContext = useChessGameContext as jest.MockedFunction<
  typeof useChessGameContext
>;

describe("useKeyboardControls", () => {
  let mockGameContext: jest.Mocked<ChessGameContextType>;
  let addEventListenerSpy: jest.SpyInstance;
  let removeEventListenerSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset mocks and spies
    jest.clearAllMocks();
    mockGameContext = {
      game: {
        /* Add minimal Chess mock properties/methods if needed */
      } as jest.Mocked<Chess>,
      currentFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      currentPosition: "",
      orientation: "w" as Color,
      currentMoveIndex: -1,
      isLatestMove: true,
      info: {
        /* Add minimal GameInfo mock properties/methods if needed */
      } as jest.Mocked<ChessGameContextType["info"]>,
      methods: {
        undo: jest.fn(),
        redo: jest.fn(),
        makeMove: jest.fn(),
        setPosition: jest.fn(),
        flipBoard: jest.fn(),
        goToMove: jest.fn(),
        goToStart: jest.fn(),
        goToEnd: jest.fn(),
        goToPreviousMove: jest.fn(),
        goToNextMove: jest.fn(),
      },
    } as unknown as jest.Mocked<ChessGameContextType>;

    mockUseChessGameContext.mockReturnValue(mockGameContext);

    addEventListenerSpy = jest.spyOn(window, "addEventListener");
    removeEventListenerSpy = jest.spyOn(window, "removeEventListener");
  });

  afterEach(() => {
    // Restore original implementations
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it("should add keydown event listener on mount and remove on unmount", () => {
    const { unmount } = renderHook(() => useKeyboardControls());
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
    );
    expect(removeEventListenerSpy).not.toHaveBeenCalled();

    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
    );
    // Ensure the listener functions are the same instance
    expect(addEventListenerSpy.mock.calls[0][1]).toBe(
      removeEventListenerSpy.mock.calls[0][1],
    );
  });

  it("should call the default handler for a default key", () => {
    renderHook(() => useKeyboardControls());
    const event = new KeyboardEvent("keydown", { key: "ArrowLeft" });
    const preventDefaultSpy = jest.spyOn(event, "preventDefault");

    act(() => {
      window.dispatchEvent(event);
    });

    const undoHandler = mockGameContext.methods.goToPreviousMove;

    expect(undoHandler).toHaveBeenCalledTimes(1);

    expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
  });

  it("should call the custom handler if provided", () => {
    const customHandler = jest.fn();
    const customControls = { z: customHandler };

    renderHook(() => useKeyboardControls(customControls));

    const event = new KeyboardEvent("keydown", { key: "z" });
    const preventDefaultSpy = jest.spyOn(event, "preventDefault");

    act(() => {
      window.dispatchEvent(event);
    });

    expect(customHandler).toHaveBeenCalledWith(mockGameContext);
    expect(customHandler).toHaveBeenCalledTimes(1);
    expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
  });

  it("should call the default handler if a custom handler for a different key is provided", () => {
    const customHandler = jest.fn();
    const customControls = { z: customHandler };

    renderHook(() => useKeyboardControls(customControls));

    const event = new KeyboardEvent("keydown", { key: "ArrowRight" });
    const preventDefaultSpy = jest.spyOn(event, "preventDefault");

    const redoHandler = mockGameContext.methods.goToNextMove;

    act(() => {
      window.dispatchEvent(event);
    });

    expect(redoHandler).toHaveBeenCalledTimes(1);

    expect(customHandler).not.toHaveBeenCalled();
    expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
  });

  it("should override the default handler if a custom handler for the same key is provided", () => {
    const customArrowLeftHandler = jest.fn();
    const customControls = { ArrowLeft: customArrowLeftHandler };

    renderHook(() => useKeyboardControls(customControls));

    const event = new KeyboardEvent("keydown", { key: "ArrowLeft" });
    const preventDefaultSpy = jest.spyOn(event, "preventDefault");

    act(() => {
      window.dispatchEvent(event);
    });

    expect(customArrowLeftHandler).toHaveBeenCalledWith(mockGameContext);
    expect(customArrowLeftHandler).toHaveBeenCalledTimes(1);
    expect(mockGameContext.methods.goToPreviousMove).not.toHaveBeenCalled();
    expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
  });

  it("should do nothing if an unmapped key is pressed", () => {
    renderHook(() => useKeyboardControls());
    const event = new KeyboardEvent("keydown", { key: "UnmappedKey" });
    const preventDefaultSpy = jest.spyOn(event, "preventDefault");

    act(() => {
      window.dispatchEvent(event);
    });

    // Check that no context functions were called
    Object.values(mockGameContext.methods).forEach((mockFn) => {
      if (jest.isMockFunction(mockFn)) {
        expect(mockFn).not.toHaveBeenCalled();
      }
    });
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });
});
