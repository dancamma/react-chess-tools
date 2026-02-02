import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChessClock } from "../../index";

describe("ChessClock.Switch", () => {
  it("should render children", () => {
    render(
      <ChessClock.Root timeControl={{ time: "5+0", clockStart: "immediate" }}>
        <ChessClock.Switch>Switch Clock</ChessClock.Switch>
      </ChessClock.Root>,
    );

    expect(screen.getByRole("button")).toHaveTextContent("Switch Clock");
  });

  it("should render button element by default", () => {
    render(
      <ChessClock.Root timeControl={{ time: "5+0", clockStart: "immediate" }}>
        <ChessClock.Switch data-testid="switch">Switch</ChessClock.Switch>
      </ChessClock.Root>,
    );

    const button = screen.getByTestId("switch");
    expect(button.tagName).toBe("BUTTON");
  });

  it("should switch active player on click", () => {
    render(
      <ChessClock.Root timeControl={{ time: "5+0", clockStart: "immediate" }}>
        <ChessClock.Display color="white" data-testid="white" />
        <ChessClock.Display color="black" data-testid="black" />
        <ChessClock.Switch>Switch</ChessClock.Switch>
      </ChessClock.Root>,
    );

    const whiteClock = screen.getByTestId("white");
    const blackClock = screen.getByTestId("black");
    const switchButton = screen.getByRole("button");

    // White starts active
    expect(whiteClock).toHaveAttribute("data-clock-active", "true");
    expect(blackClock).toHaveAttribute("data-clock-active", "false");

    // Click switch
    fireEvent.click(switchButton);

    // Black should now be active
    expect(whiteClock).toHaveAttribute("data-clock-active", "false");
    expect(blackClock).toHaveAttribute("data-clock-active", "true");
  });

  it("should support custom className", () => {
    render(
      <ChessClock.Root timeControl={{ time: "5+0", clockStart: "immediate" }}>
        <ChessClock.Switch className="custom-switch">Switch</ChessClock.Switch>
      </ChessClock.Root>,
    );

    expect(screen.getByRole("button")).toHaveClass("custom-switch");
  });

  it("should be disabled when clock is idle", () => {
    render(
      <ChessClock.Root timeControl={{ time: "5+0", clockStart: "manual" }}>
        <ChessClock.Switch>Switch</ChessClock.Switch>
      </ChessClock.Root>,
    );

    expect(screen.getByRole("button")).toBeDisabled();
  });

  describe("delayed clock start", () => {
    it("should be enabled when clock start is delayed", () => {
      render(
        <ChessClock.Root timeControl={{ time: "5+0", clockStart: "delayed" }}>
          <ChessClock.Switch>Switch</ChessClock.Switch>
        </ChessClock.Root>,
      );

      expect(screen.getByRole("button")).not.toBeDisabled();
    });

    it("should start timer after two switches", async () => {
      render(
        <ChessClock.Root timeControl={{ time: "5+0", clockStart: "delayed" }}>
          <ChessClock.Display color="white" data-testid="white" />
          <ChessClock.Display color="black" data-testid="black" />
          <ChessClock.Switch>Switch</ChessClock.Switch>
        </ChessClock.Root>,
      );

      const whiteClock = screen.getByTestId("white");
      const blackClock = screen.getByTestId("black");
      const switchButton = screen.getByRole("button");

      // Initially no active player in delayed mode, status is "delayed"
      expect(whiteClock).toHaveAttribute("data-clock-active", "false");
      expect(blackClock).toHaveAttribute("data-clock-active", "false");
      expect(whiteClock).toHaveAttribute("data-clock-status", "delayed");

      // First switch - black becomes active but status remains "delayed"
      fireEvent.click(switchButton);

      // Wait for state update
      await waitFor(
        () => {
          expect(blackClock).toHaveAttribute("data-clock-active", "true");
        },
        { timeout: 300 },
      );
      expect(whiteClock).toHaveAttribute("data-clock-active", "false");
      // Status is still "delayed" after first switch
      expect(whiteClock).toHaveAttribute("data-clock-status", "delayed");

      // Add a small delay to ensure React has processed all state updates
      // This is needed because the callback captures the stale state values
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Second switch - white becomes active and status changes to "running"
      fireEvent.click(switchButton);

      // Wait for state update - white should become active and status should be "running"
      await waitFor(
        () => {
          expect(whiteClock).toHaveAttribute("data-clock-active", "true");
          expect(whiteClock).toHaveAttribute("data-clock-status", "running");
        },
        { timeout: 300 },
      );
      expect(blackClock).toHaveAttribute("data-clock-active", "false");
    });
  });

  it("should call onClick handler", () => {
    const handleClick = jest.fn();

    render(
      <ChessClock.Root timeControl={{ time: "5+0", clockStart: "immediate" }}>
        <ChessClock.Switch onClick={handleClick}>Switch</ChessClock.Switch>
      </ChessClock.Root>,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  describe("asChild prop", () => {
    it("should render as custom element when asChild is true", () => {
      render(
        <ChessClock.Root timeControl={{ time: "5+0", clockStart: "immediate" }}>
          <ChessClock.Switch asChild>
            <div data-testid="custom-switch">Switch</div>
          </ChessClock.Switch>
        </ChessClock.Root>,
      );

      const customElement = screen.getByTestId("custom-switch");
      expect(customElement.tagName).toBe("DIV");
      expect(customElement).toHaveTextContent("Switch");
    });

    it("should switch when asChild element is clicked", () => {
      render(
        <ChessClock.Root timeControl={{ time: "5+0", clockStart: "immediate" }}>
          <ChessClock.Display color="white" data-testid="white" />
          <ChessClock.Display color="black" data-testid="black" />
          <ChessClock.Switch asChild>
            <div data-testid="custom-switch" role="button" tabIndex={0}>
              Switch
            </div>
          </ChessClock.Switch>
        </ChessClock.Root>,
      );

      const whiteClock = screen.getByTestId("white");
      const customSwitch = screen.getByTestId("custom-switch");

      expect(whiteClock).toHaveAttribute("data-clock-active", "true");

      fireEvent.click(customSwitch);

      expect(whiteClock).toHaveAttribute("data-clock-active", "false");
    });
  });

  it("should have displayName", () => {
    expect(ChessClock.Switch.displayName).toBe("ChessClock.Switch");
  });
});
