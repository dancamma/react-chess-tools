import React from "react";
import { render, screen } from "@testing-library/react";
import { ChessClock } from "../../index";

describe("ChessClock.Root", () => {
  it("should render children", () => {
    render(
      <ChessClock.Root timeControl={{ time: "5+3" }}>
        <div data-testid="test-child">Test Child</div>
      </ChessClock.Root>,
    );

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("should render multiple children", () => {
    render(
      <ChessClock.Root timeControl={{ time: "5+3" }}>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </ChessClock.Root>,
    );

    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
    expect(screen.getByTestId("child-3")).toBeInTheDocument();
  });

  it("should provide context to children", () => {
    const TestChild = () => {
      // This would use useChessClockContext
      return <div>Context Child</div>;
    };

    render(
      <ChessClock.Root timeControl={{ time: "5+3" }}>
        <TestChild />
      </ChessClock.Root>,
    );

    expect(screen.getByText("Context Child")).toBeInTheDocument();
  });

  it("should have displayName", () => {
    expect(ChessClock.Root.displayName).toBe("ChessClock.Root");
  });
});
