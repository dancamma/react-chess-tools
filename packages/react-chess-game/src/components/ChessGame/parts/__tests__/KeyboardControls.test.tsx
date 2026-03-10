import React from "react";
import { act, fireEvent, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ChessGame } from "../..";
import { KeyboardControls } from "../KeyboardControls";

describe("ChessGame.KeyboardControls", () => {
  it("should have correct displayName", () => {
    expect(KeyboardControls.displayName).toBe("ChessGame.KeyboardControls");
  });

  it("should render null (no DOM element)", () => {
    const { container } = render(
      <ChessGame.Root>
        <ChessGame.KeyboardControls />
      </ChessGame.Root>,
    );

    // KeyboardControls should not render any DOM elements
    expect(container.querySelector("*")).toBeNull();
  });

  it("should scope shortcuts to the focused board by default", () => {
    const customHandler = jest.fn();

    const { container } = render(
      <ChessGame.Root>
        <ChessGame.KeyboardControls controls={{ z: customHandler }} />
        <ChessGame.Board />
      </ChessGame.Root>,
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "z" }));
    });

    expect(customHandler).not.toHaveBeenCalled();

    const boardContainer = container.firstElementChild as HTMLDivElement | null;
    expect(boardContainer).toHaveAttribute("tabindex", "0");

    fireEvent.pointerDown(boardContainer as HTMLDivElement);

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "z" }));
    });

    expect(customHandler).toHaveBeenCalledTimes(1);
  });

  it("should remain global when no board is registered", () => {
    const customHandler = jest.fn();

    render(
      <ChessGame.Root>
        <ChessGame.KeyboardControls controls={{ z: customHandler }} />
      </ChessGame.Root>,
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "z" }));
    });

    expect(customHandler).toHaveBeenCalledTimes(1);
  });

  it("should throw error when used outside ChessGame.Root", () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      render(<ChessGame.KeyboardControls />);
    }).toThrow();

    consoleError.mockRestore();
  });
});
