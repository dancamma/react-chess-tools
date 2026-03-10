import { renderHook, act } from "@testing-library/react";
import { createRef } from "react";
import { useKeyboardControls } from "./useKeyboardControls";
import {
  useChessGameContext,
  ChessGameContextType,
} from "./useChessGameContext";
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

    renderHook(() => useKeyboardControls({ controls: customControls }));

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

    renderHook(() => useKeyboardControls({ controls: customControls }));

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

    renderHook(() => useKeyboardControls({ controls: customControls }));

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

  it("should not trigger when focus is on an input element", () => {
    renderHook(() => useKeyboardControls());

    // Create and focus an input element
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    const event = new KeyboardEvent("keydown", { key: "ArrowLeft" });
    const preventDefaultSpy = jest.spyOn(event, "preventDefault");

    act(() => {
      window.dispatchEvent(event);
    });

    expect(mockGameContext.methods.goToPreviousMove).not.toHaveBeenCalled();
    expect(preventDefaultSpy).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it("should not trigger when focus is on a textarea element", () => {
    renderHook(() => useKeyboardControls());

    // Create and focus a textarea element
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    textarea.focus();

    const event = new KeyboardEvent("keydown", { key: "ArrowLeft" });
    const preventDefaultSpy = jest.spyOn(event, "preventDefault");

    act(() => {
      window.dispatchEvent(event);
    });

    expect(mockGameContext.methods.goToPreviousMove).not.toHaveBeenCalled();
    expect(preventDefaultSpy).not.toHaveBeenCalled();

    document.body.removeChild(textarea);
  });

  it("should not trigger when focus is on a select element", () => {
    renderHook(() => useKeyboardControls());

    const select = document.createElement("select");
    document.body.appendChild(select);
    select.focus();

    const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
    const preventDefaultSpy = jest.spyOn(event, "preventDefault");

    act(() => {
      window.dispatchEvent(event);
    });

    expect(mockGameContext.methods.goToEnd).not.toHaveBeenCalled();
    expect(preventDefaultSpy).not.toHaveBeenCalled();

    document.body.removeChild(select);
  });

  it("should not trigger when focus is on an element with isContentEditable=true", () => {
    renderHook(() => useKeyboardControls());

    // Create and focus a contenteditable element
    const div = document.createElement("div");
    div.setAttribute("contenteditable", "true");
    document.body.appendChild(div);
    div.focus();

    // Mock isContentEditable since jsdom doesn't compute it automatically
    Object.defineProperty(div, "isContentEditable", {
      value: true,
      writable: true,
    });

    const event = new KeyboardEvent("keydown", { key: "ArrowLeft" });
    const preventDefaultSpy = jest.spyOn(event, "preventDefault");

    act(() => {
      window.dispatchEvent(event);
    });

    expect(mockGameContext.methods.goToPreviousMove).not.toHaveBeenCalled();
    expect(preventDefaultSpy).not.toHaveBeenCalled();

    document.body.removeChild(div);
  });

  it("should not trigger when focus is on an element with contenteditable='plaintext-only'", () => {
    renderHook(() => useKeyboardControls());

    // Create and focus an element with plaintext-only editing
    const div = document.createElement("div");
    div.setAttribute("contenteditable", "plaintext-only");
    document.body.appendChild(div);
    div.focus();

    // Mock isContentEditable since jsdom doesn't compute it automatically
    Object.defineProperty(div, "isContentEditable", {
      value: true,
      writable: true,
    });

    const event = new KeyboardEvent("keydown", { key: "ArrowLeft" });
    const preventDefaultSpy = jest.spyOn(event, "preventDefault");

    act(() => {
      window.dispatchEvent(event);
    });

    // isContentEditable should be true for plaintext-only as well
    expect(mockGameContext.methods.goToPreviousMove).not.toHaveBeenCalled();
    expect(preventDefaultSpy).not.toHaveBeenCalled();

    document.body.removeChild(div);
  });

  it("should use updated controls after rerender", () => {
    const initialHandler = jest.fn();
    const updatedHandler = jest.fn();

    const { rerender } = renderHook((options) => useKeyboardControls(options), {
      initialProps: { controls: { ArrowLeft: initialHandler } },
    });

    // Trigger with initial handler
    const event1 = new KeyboardEvent("keydown", { key: "ArrowLeft" });
    act(() => {
      window.dispatchEvent(event1);
    });

    expect(initialHandler).toHaveBeenCalledTimes(1);
    expect(updatedHandler).not.toHaveBeenCalled();

    // Rerender with updated handler
    rerender({ controls: { ArrowLeft: updatedHandler } });

    // Trigger with updated handler
    const event2 = new KeyboardEvent("keydown", { key: "ArrowLeft" });
    act(() => {
      window.dispatchEvent(event2);
    });

    // Initial handler should still be called only once
    expect(initialHandler).toHaveBeenCalledTimes(1);
    // Updated handler should be called
    expect(updatedHandler).toHaveBeenCalledTimes(1);
  });

  describe("containerRef scoping", () => {
    it("should only trigger when focus is within the containerRef element", () => {
      const containerRef = createRef<HTMLDivElement>();
      const container = document.createElement("div");
      document.body.appendChild(container);
      containerRef.current = container;

      renderHook(() => useKeyboardControls({ containerRef }));

      // Focus outside the container
      const outsideElement = document.createElement("input");
      document.body.appendChild(outsideElement);
      outsideElement.focus();

      const event1 = new KeyboardEvent("keydown", { key: "ArrowLeft" });
      act(() => {
        window.dispatchEvent(event1);
      });

      // Should not trigger because focus is outside container
      expect(mockGameContext.methods.goToPreviousMove).not.toHaveBeenCalled();

      // Focus inside the container
      const insideElement = document.createElement("button");
      container.appendChild(insideElement);
      insideElement.focus();

      const event2 = new KeyboardEvent("keydown", { key: "ArrowLeft" });
      act(() => {
        window.dispatchEvent(event2);
      });

      // Should trigger because focus is inside container
      expect(mockGameContext.methods.goToPreviousMove).toHaveBeenCalledTimes(1);

      document.body.removeChild(container);
      document.body.removeChild(outsideElement);
    });

    it("should work globally when no containerRef is provided", () => {
      renderHook(() => useKeyboardControls());

      // Even with no specific focus, should work globally
      const event = new KeyboardEvent("keydown", { key: "ArrowLeft" });
      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockGameContext.methods.goToPreviousMove).toHaveBeenCalledTimes(1);
    });

    it("should not trigger when containerRef.current is null", () => {
      const containerRef = createRef<HTMLDivElement>();
      // containerRef.current is null by default

      renderHook(() => useKeyboardControls({ containerRef }));

      const event = new KeyboardEvent("keydown", { key: "ArrowLeft" });
      act(() => {
        window.dispatchEvent(event);
      });

      // Scoped controls should stay inactive until the container ref is attached
      expect(mockGameContext.methods.goToPreviousMove).not.toHaveBeenCalled();
    });
  });
});
