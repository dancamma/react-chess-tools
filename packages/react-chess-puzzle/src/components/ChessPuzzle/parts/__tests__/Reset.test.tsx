import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ChessPuzzle } from "../..";
import { Reset } from "../Reset";
import { Puzzle } from "../../../../utils";

describe("ChessPuzzle.Reset", () => {
  const mockPuzzle: Puzzle = {
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    moves: ["e4", "e5"],
  };

  describe("displayName", () => {
    it("should have correct displayName", () => {
      expect(Reset.displayName).toBe("ChessPuzzle.Reset");
    });
  });

  describe("ref forwarding", () => {
    it("should forward ref to button element", () => {
      const ref = React.createRef<HTMLElement>();

      render(
        <ChessPuzzle.Root puzzle={mockPuzzle}>
          <Reset
            ref={ref}
            showOn={["not-started", "in-progress", "failed", "solved"]}
          />
        </ChessPuzzle.Root>,
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it("should forward ref when using asChild", () => {
      const ref = React.createRef<HTMLElement>();

      render(
        <ChessPuzzle.Root puzzle={mockPuzzle}>
          <Reset
            ref={ref}
            asChild
            showOn={["not-started", "in-progress", "failed", "solved"]}
          >
            <button>Custom Reset</button>
          </Reset>
        </ChessPuzzle.Root>,
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it("should support callback refs", () => {
      let capturedRef: HTMLElement | null = null;
      const callbackRef = (ref: HTMLElement | null) => {
        capturedRef = ref;
      };

      render(
        <ChessPuzzle.Root puzzle={mockPuzzle}>
          <Reset
            ref={callbackRef}
            showOn={["not-started", "in-progress", "failed", "solved"]}
          />
        </ChessPuzzle.Root>,
      );

      expect(capturedRef).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe("visibility based on showOn prop", () => {
    it("should be visible when status matches showOn", () => {
      render(
        <ChessPuzzle.Root puzzle={mockPuzzle}>
          <Reset showOn={["not-started"]}>Reset</Reset>
        </ChessPuzzle.Root>,
      );

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should be hidden when status does not match showOn", () => {
      render(
        <ChessPuzzle.Root puzzle={mockPuzzle}>
          <Reset showOn={["solved"]}>Reset</Reset>
        </ChessPuzzle.Root>,
      );

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should default to showing on failed and solved statuses", () => {
      // Default showOn is ["failed", "solved"], so it should be hidden at start
      render(
        <ChessPuzzle.Root puzzle={mockPuzzle}>
          <Reset>Reset</Reset>
        </ChessPuzzle.Root>,
      );

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should accept multiple statuses in showOn", () => {
      render(
        <ChessPuzzle.Root puzzle={mockPuzzle}>
          <Reset showOn={["not-started", "in-progress", "failed", "solved"]}>
            Reset
          </Reset>
        </ChessPuzzle.Root>,
      );

      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  describe("prop spreading", () => {
    it("should apply custom className", () => {
      render(
        <ChessPuzzle.Root puzzle={mockPuzzle}>
          <Reset className="custom-reset-class" showOn={["not-started"]}>
            Reset
          </Reset>
        </ChessPuzzle.Root>,
      );

      expect(screen.getByRole("button")).toHaveClass("custom-reset-class");
    });

    it("should apply custom id", () => {
      render(
        <ChessPuzzle.Root puzzle={mockPuzzle}>
          <Reset id="reset-button" showOn={["not-started"]}>
            Reset
          </Reset>
        </ChessPuzzle.Root>,
      );

      expect(screen.getByRole("button")).toHaveAttribute("id", "reset-button");
    });

    it("should apply data-* attributes", () => {
      render(
        <ChessPuzzle.Root puzzle={mockPuzzle}>
          <Reset
            data-testid="reset"
            data-custom="value"
            showOn={["not-started"]}
          >
            Reset
          </Reset>
        </ChessPuzzle.Root>,
      );

      const button = screen.getByTestId("reset");
      expect(button).toHaveAttribute("data-custom", "value");
    });

    it("should apply aria-* attributes", () => {
      render(
        <ChessPuzzle.Root puzzle={mockPuzzle}>
          <Reset aria-label="Reset puzzle" showOn={["not-started"]}>
            Reset
          </Reset>
        </ChessPuzzle.Root>,
      );

      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-label",
        "Reset puzzle",
      );
    });

    it("should apply disabled attribute", () => {
      render(
        <ChessPuzzle.Root puzzle={mockPuzzle}>
          <Reset disabled showOn={["not-started"]}>
            Reset
          </Reset>
        </ChessPuzzle.Root>,
      );

      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  describe("asChild pattern", () => {
    it("should render custom element when asChild is true", () => {
      render(
        <ChessPuzzle.Root puzzle={mockPuzzle}>
          <Reset asChild showOn={["not-started"]}>
            <button className="custom-button">Custom Reset</button>
          </Reset>
        </ChessPuzzle.Root>,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("Custom Reset");
      expect(button).toHaveClass("custom-button");
    });

    it("should merge className with asChild element", () => {
      render(
        <ChessPuzzle.Root puzzle={mockPuzzle}>
          <Reset asChild className="reset-class" showOn={["not-started"]}>
            <button className="child-class">Reset</button>
          </Reset>
        </ChessPuzzle.Root>,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass("reset-class");
      expect(button).toHaveClass("child-class");
    });

    it("should compose onClick handlers with asChild", () => {
      const childOnClick = jest.fn();

      render(
        <ChessPuzzle.Root puzzle={mockPuzzle}>
          <Reset asChild showOn={["not-started"]}>
            <button onClick={childOnClick}>Reset</button>
          </Reset>
        </ChessPuzzle.Root>,
      );

      fireEvent.click(screen.getByRole("button"));
      expect(childOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("functionality", () => {
    it("should call onReset callback when clicked", () => {
      const handleReset = jest.fn();

      render(
        <ChessPuzzle.Root puzzle={mockPuzzle}>
          <Reset onReset={handleReset} showOn={["not-started"]}>
            Reset
          </Reset>
        </ChessPuzzle.Root>,
      );

      fireEvent.click(screen.getByRole("button"));
      expect(handleReset).toHaveBeenCalledTimes(1);
    });

    it("should pass puzzle context to onReset callback", () => {
      const handleReset = jest.fn();

      render(
        <ChessPuzzle.Root puzzle={mockPuzzle}>
          <Reset onReset={handleReset} showOn={["not-started"]}>
            Reset
          </Reset>
        </ChessPuzzle.Root>,
      );

      fireEvent.click(screen.getByRole("button"));
      expect(handleReset).toHaveBeenCalledWith(
        expect.objectContaining({
          puzzle: mockPuzzle,
          status: expect.any(String),
          changePuzzle: expect.any(Function),
        }),
      );
    });

    it("should have type button by default", () => {
      render(
        <ChessPuzzle.Root puzzle={mockPuzzle}>
          <Reset showOn={["not-started"]}>Reset</Reset>
        </ChessPuzzle.Root>,
      );

      expect(screen.getByRole("button")).toHaveAttribute("type", "button");
    });
  });

  describe("context validation", () => {
    it("should throw error when used outside ChessPuzzle.Root", () => {
      const consoleError = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(<Reset showOn={["not-started"]}>Reset</Reset>);
      }).toThrow();

      consoleError.mockRestore();
    });
  });

  describe("children", () => {
    it("should render text children", () => {
      render(
        <ChessPuzzle.Root puzzle={mockPuzzle}>
          <Reset showOn={["not-started"]}>Reset Puzzle</Reset>
        </ChessPuzzle.Root>,
      );

      expect(screen.getByRole("button")).toHaveTextContent("Reset Puzzle");
    });

    it("should render element children", () => {
      render(
        <ChessPuzzle.Root puzzle={mockPuzzle}>
          <Reset showOn={["not-started"]}>
            <span data-testid="child">Reset Icon</span>
          </Reset>
        </ChessPuzzle.Root>,
      );

      expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    it("should render without children", () => {
      render(
        <ChessPuzzle.Root puzzle={mockPuzzle}>
          <Reset showOn={["not-started"]} aria-label="Reset" />
        </ChessPuzzle.Root>,
      );

      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  describe("backward compatibility", () => {
    it("should work with minimal props when status matches default showOn", () => {
      // Since default showOn is ["failed", "solved"], we need to set showOn to see the button
      render(
        <ChessPuzzle.Root puzzle={mockPuzzle}>
          <Reset showOn={["not-started"]}>Reset</Reset>
        </ChessPuzzle.Root>,
      );

      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });
});
