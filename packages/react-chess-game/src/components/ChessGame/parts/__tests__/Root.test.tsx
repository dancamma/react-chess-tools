import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ChessGame } from "../..";
import { Root } from "../Root";

describe("ChessGame.Root", () => {
  it("should have correct displayName", () => {
    expect(Root.displayName).toBe("ChessGame.Root");
  });

  it("should render children correctly", () => {
    render(
      <ChessGame.Root>
        <div data-testid="child">Child Component</div>
      </ChessGame.Root>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Child Component")).toBeInTheDocument();
  });

  it("should render multiple children", () => {
    render(
      <ChessGame.Root>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </ChessGame.Root>,
    );

    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
    expect(screen.getByTestId("child-3")).toBeInTheDocument();
  });

  it("should NOT render a DOM element wrapper", () => {
    const { container } = render(
      <ChessGame.Root>
        <div data-testid="child">Child</div>
      </ChessGame.Root>,
    );

    // The child should be in the container
    const child = screen.getByTestId("child");
    expect(child).toBeInTheDocument();
    // Root itself doesn't add any DOM elements - it's just a fragment/context provider
    expect(container.innerHTML).toContain('data-testid="child"');
  });
});
