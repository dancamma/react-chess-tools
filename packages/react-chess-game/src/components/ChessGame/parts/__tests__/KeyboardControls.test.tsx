import React from "react";
import { render } from "@testing-library/react";
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
