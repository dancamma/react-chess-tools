import { useEffect, useRef, type RefObject } from "react";
import {
  defaultKeyboardControls,
  KeyboardControls,
} from "../components/ChessGame/parts/KeyboardControls";
import { useChessGameContext } from "./useChessGameContext";

export type UseKeyboardControlsOptions = {
  controls?: KeyboardControls;
  /**
   * Optional container ref to scope keyboard handling to a specific board.
   * Keyboard events only trigger when focus is within this container.
   */
  containerRef?: RefObject<HTMLElement | null>;
};

export const useKeyboardControls = (options?: UseKeyboardControlsOptions) => {
  const controls = options?.controls;
  const containerRef = options?.containerRef;

  const gameContext = useChessGameContext();
  if (!gameContext) {
    throw new Error("ChessGameContext not found");
  }
  const keyboardControls = { ...defaultKeyboardControls, ...controls };

  // Use ref to store controls to avoid stale closure issues
  const controlsRef = useRef(keyboardControls);
  controlsRef.current = keyboardControls;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLElement | null;

      // If containerRef is provided, only respond when focus is within that container
      if (containerRef) {
        const containerElement = containerRef.current;
        const isWithinContainer =
          !!containerElement &&
          !!activeElement &&
          containerElement.contains(activeElement);
        if (!isWithinContainer) {
          return;
        }
      }

      // Ignore events from editable elements using the proper isContentEditable property
      // This handles contenteditable="true", "plaintext-only", and inherited editability
      if (activeElement?.isContentEditable) {
        return;
      }

      // Also ignore input and textarea elements
      if (
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement
      ) {
        return;
      }

      const handler = controlsRef.current[event.key];
      if (handler) {
        event.preventDefault();
        handler(gameContext);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameContext, containerRef]);
  return null;
};
