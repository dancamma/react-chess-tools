import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ChessGame } from "../..";
import { Sounds } from "../Sounds";

describe("ChessGame.Sounds", () => {
  it("should have correct displayName", () => {
    expect(Sounds.displayName).toBe("ChessGame.Sounds");
  });

  it("should render null (no DOM element)", () => {
    const { container } = render(
      <ChessGame.Root>
        <ChessGame.Sounds />
      </ChessGame.Root>,
    );

    // Sounds should not render any DOM elements
    expect(container.querySelector("*")).toBeNull();
  });
});
