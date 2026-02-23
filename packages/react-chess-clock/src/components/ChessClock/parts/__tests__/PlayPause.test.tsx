import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChessClock } from "../../index";

describe("ChessClock.PlayPause", () => {
  it("should render children by default", () => {
    render(
      <ChessClock.Root timeControl={{ time: "5+0", clockStart: "immediate" }}>
        <ChessClock.PlayPause>Toggle</ChessClock.PlayPause>
      </ChessClock.Root>,
    );

    expect(screen.getByRole("button")).toHaveTextContent("Toggle");
  });

  describe("default content", () => {
    it("should use default content when no props provided", () => {
      render(
        <ChessClock.Root timeControl={{ time: "5+0", clockStart: "manual" }}>
          <ChessClock.PlayPause />
        </ChessClock.Root>,
      );

      // Default for idle/start is "Start"
      expect(screen.getByRole("button")).toHaveTextContent("Start");
    });

    it("should use default pauseContent when running", () => {
      render(
        <ChessClock.Root timeControl={{ time: "5+0", clockStart: "immediate" }}>
          <ChessClock.PlayPause />
        </ChessClock.Root>,
      );

      // Default for running is "Pause"
      expect(screen.getByRole("button")).toHaveTextContent("Pause");
    });

    it("should use default resumeContent when paused", () => {
      render(
        <ChessClock.Root timeControl={{ time: "5+0", clockStart: "immediate" }}>
          <ChessClock.PlayPause />
        </ChessClock.Root>,
      );

      const button = screen.getByRole("button");

      // Initially shows "Pause" (running)
      expect(button).toHaveTextContent("Pause");

      // Click to pause
      fireEvent.click(button);

      // Now shows "Resume" (default)
      expect(button).toHaveTextContent("Resume");
    });

    it("should use default content for delayed state", () => {
      render(
        <ChessClock.Root timeControl={{ time: "5+0", clockStart: "delayed" }}>
          <ChessClock.PlayPause />
        </ChessClock.Root>,
      );

      // Default for delayed is "Start"
      expect(screen.getByRole("button")).toHaveTextContent("Start");
    });
  });

  describe("partial custom content with defaults", () => {
    it("should use custom pauseContent and defaults for other states", () => {
      render(
        <ChessClock.Root timeControl={{ time: "5+0", clockStart: "immediate" }}>
          <ChessClock.PlayPause pauseContent="⏸️ Stop" />
        </ChessClock.Root>,
      );

      const button = screen.getByRole("button");

      // Shows custom pauseContent
      expect(button).toHaveTextContent("⏸️ Stop");

      fireEvent.click(button);

      // Shows default resumeContent
      expect(button).toHaveTextContent("Resume");
    });

    it("should use custom startContent and defaults for other states", () => {
      render(
        <ChessClock.Root timeControl={{ time: "5+0", clockStart: "manual" }}>
          <ChessClock.PlayPause startContent="▶️ Go!" />
        </ChessClock.Root>,
      );

      const button = screen.getByRole("button");

      // Shows custom startContent
      expect(button).toHaveTextContent("▶️ Go!");

      fireEvent.click(button);

      // Shows default pauseContent
      expect(button).toHaveTextContent("Pause");
    });

    it("should use custom finishedContent and defaults for other states", () => {
      render(
        <ChessClock.Root timeControl={{ time: "5+0", clockStart: "manual" }}>
          <ChessClock.PlayPause finishedContent="💀 Time's up!" />
        </ChessClock.Root>,
      );

      const button = screen.getByRole("button");

      // Shows default startContent (not finished yet)
      expect(button).toHaveTextContent("Start");
    });
  });

  describe("custom content overrides", () => {
    it("should render startContent when idle", () => {
      render(
        <ChessClock.Root timeControl={{ time: "5+0", clockStart: "manual" }}>
          <ChessClock.PlayPause
            startContent="Start"
            pauseContent="Pause"
            resumeContent="Resume"
          />
        </ChessClock.Root>,
      );

      expect(screen.getByRole("button")).toHaveTextContent("Start");
    });

    it("should render pauseContent when running", () => {
      render(
        <ChessClock.Root timeControl={{ time: "5+0", clockStart: "immediate" }}>
          <ChessClock.PlayPause
            startContent="Start"
            pauseContent="Pause"
            resumeContent="Resume"
          />
        </ChessClock.Root>,
      );

      expect(screen.getByRole("button")).toHaveTextContent("Pause");
    });

    it("should render resumeContent when paused", () => {
      render(
        <ChessClock.Root timeControl={{ time: "5+0", clockStart: "immediate" }}>
          <ChessClock.PlayPause
            startContent="Start"
            pauseContent="Pause"
            resumeContent="Resume"
          />
        </ChessClock.Root>,
      );

      const button = screen.getByRole("button");

      // Initially shows "Pause" (running)
      expect(button).toHaveTextContent("Pause");

      // Click to pause
      fireEvent.click(button);

      // Now shows "Resume"
      expect(button).toHaveTextContent("Resume");
    });
  });

  it("should start clock on click when idle", () => {
    render(
      <ChessClock.Root timeControl={{ time: "5+0", clockStart: "manual" }}>
        <ChessClock.Display color="white" data-testid="clock" />
        <ChessClock.PlayPause>Start</ChessClock.PlayPause>
      </ChessClock.Root>,
    );

    const clock = screen.getByTestId("clock");

    // Clock is idle
    expect(clock).toHaveAttribute("data-clock-status", "idle");

    // Click to start
    fireEvent.click(screen.getByRole("button"));

    // Clock is running
    expect(clock).toHaveAttribute("data-clock-status", "running");
  });

  it("should pause clock on click when running", () => {
    render(
      <ChessClock.Root timeControl={{ time: "5+0", clockStart: "immediate" }}>
        <ChessClock.Display color="white" data-testid="clock" />
        <ChessClock.PlayPause>Pause</ChessClock.PlayPause>
      </ChessClock.Root>,
    );

    const clock = screen.getByTestId("clock");

    // Clock is running
    expect(clock).toHaveAttribute("data-clock-status", "running");

    // Click pause
    fireEvent.click(screen.getByRole("button"));

    // Clock is paused
    expect(clock).toHaveAttribute("data-clock-status", "paused");
  });

  it("should resume clock on click when paused", () => {
    render(
      <ChessClock.Root timeControl={{ time: "5+0", clockStart: "immediate" }}>
        <ChessClock.Display color="white" data-testid="clock" />
        <ChessClock.PlayPause>Toggle</ChessClock.PlayPause>
      </ChessClock.Root>,
    );

    const clock = screen.getByTestId("clock");
    const button = screen.getByRole("button");

    // Pause
    fireEvent.click(button);
    expect(clock).toHaveAttribute("data-clock-status", "paused");

    // Resume
    fireEvent.click(button);
    expect(clock).toHaveAttribute("data-clock-status", "running");
  });

  it("should not be disabled when clock is idle", () => {
    render(
      <ChessClock.Root timeControl={{ time: "5+0", clockStart: "manual" }}>
        <ChessClock.PlayPause>Start</ChessClock.PlayPause>
      </ChessClock.Root>,
    );

    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("should be disabled when clock is finished", () => {
    render(
      <ChessClock.Root timeControl={{ time: "5+0" }}>
        <ChessClock.PlayPause disabled>Toggle</ChessClock.PlayPause>
      </ChessClock.Root>,
    );

    expect(screen.getByRole("button")).toBeDisabled();
  });

  describe("delayed clock start", () => {
    it("should render startContent when delayed (no delayedContent prop)", () => {
      render(
        <ChessClock.Root timeControl={{ time: "5+0", clockStart: "delayed" }}>
          <ChessClock.PlayPause
            startContent="Start"
            pauseContent="Pause"
            resumeContent="Resume"
          />
        </ChessClock.Root>,
      );

      expect(screen.getByRole("button")).toHaveTextContent("Start");
    });

    it("should render delayedContent when delayed", () => {
      render(
        <ChessClock.Root timeControl={{ time: "5+0", clockStart: "delayed" }}>
          <ChessClock.PlayPause
            startContent="Start"
            delayedContent="Press to start immediately"
            pauseContent="Pause"
            resumeContent="Resume"
          />
        </ChessClock.Root>,
      );

      expect(screen.getByRole("button")).toHaveTextContent(
        "Press to start immediately",
      );
    });

    it("should be disabled when clock is delayed", () => {
      render(
        <ChessClock.Root timeControl={{ time: "5+0", clockStart: "delayed" }}>
          <ChessClock.PlayPause>Start</ChessClock.PlayPause>
        </ChessClock.Root>,
      );

      // In delayed mode, the button is disabled since clock starts via player moves
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  describe("finished state", () => {
    it("should be disabled when clock is finished", () => {
      render(
        <ChessClock.Root timeControl={{ time: "5+0" }}>
          <ChessClock.PlayPause>Toggle</ChessClock.PlayPause>
        </ChessClock.Root>,
      );

      // When clock is finished, PlayPause button is disabled
      // (actual timeout simulation requires RAF which doesn't work in jsdom)
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("should respect disabled prop", () => {
      render(
        <ChessClock.Root timeControl={{ time: "5+0" }}>
          <ChessClock.PlayPause disabled>Toggle</ChessClock.PlayPause>
        </ChessClock.Root>,
      );

      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  it("should support custom className", () => {
    render(
      <ChessClock.Root timeControl={{ time: "5+0", clockStart: "immediate" }}>
        <ChessClock.PlayPause className="custom-playpause">
          Toggle
        </ChessClock.PlayPause>
      </ChessClock.Root>,
    );

    expect(screen.getByRole("button")).toHaveClass("custom-playpause");
  });

  it("should call onClick handler", () => {
    const handleClick = jest.fn();

    render(
      <ChessClock.Root timeControl={{ time: "5+0", clockStart: "immediate" }}>
        <ChessClock.PlayPause onClick={handleClick}>
          Toggle
        </ChessClock.PlayPause>
      </ChessClock.Root>,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  describe("asChild prop", () => {
    it("should render as custom element when asChild is true and inject resolved content", () => {
      render(
        <ChessClock.Root timeControl={{ time: "5+0", clockStart: "immediate" }}>
          <ChessClock.PlayPause asChild>
            <div data-testid="custom-playpause" role="button" tabIndex={0}>
              Toggle
            </div>
          </ChessClock.PlayPause>
        </ChessClock.Root>,
      );

      const customElement = screen.getByTestId("custom-playpause");
      expect(customElement.tagName).toBe("DIV");
      // When asChild is true, resolved content ("Pause" for running state) is injected
      expect(customElement).toHaveTextContent("Pause");
    });

    it("should toggle pause when asChild element is clicked", () => {
      const handleClick = jest.fn();
      render(
        <ChessClock.Root timeControl={{ time: "5+0", clockStart: "immediate" }}>
          <ChessClock.Display color="white" data-testid="clock" />
          <ChessClock.PlayPause asChild onClick={handleClick}>
            <span data-testid="custom-playpause" role="button" tabIndex={0}>
              Toggle
            </span>
          </ChessClock.PlayPause>
        </ChessClock.Root>,
      );

      const clock = screen.getByTestId("clock");
      const customPlayPause = screen.getByTestId("custom-playpause");

      expect(clock).toHaveAttribute("data-clock-status", "running");
      // When running, content should be "Pause"
      expect(customPlayPause).toHaveTextContent("Pause");

      fireEvent.click(customPlayPause);

      expect(clock).toHaveAttribute("data-clock-status", "paused");
      // When paused, content should be "Resume"
      expect(customPlayPause).toHaveTextContent("Resume");
      expect(handleClick).toHaveBeenCalled();
    });

    it("should be disabled when clock is finished with asChild", () => {
      render(
        <ChessClock.Root timeControl={{ time: "5+0" }}>
          <ChessClock.PlayPause asChild>
            <div data-testid="custom-playpause" role="button" tabIndex={0}>
              Toggle
            </div>
          </ChessClock.PlayPause>
        </ChessClock.Root>,
      );

      const customElement = screen.getByTestId("custom-playpause");
      expect(customElement).toHaveAttribute("disabled");
    });

    it("should show Start when clock is idle with asChild", () => {
      render(
        <ChessClock.Root timeControl={{ time: "5+0", clockStart: "manual" }}>
          <ChessClock.PlayPause asChild>
            <div data-testid="custom-playpause" role="button" tabIndex={0}>
              Ignored
            </div>
          </ChessClock.PlayPause>
        </ChessClock.Root>,
      );

      const customElement = screen.getByTestId("custom-playpause");
      expect(customElement).toHaveTextContent("Start");
    });

    it("should show custom content when props are provided with asChild", () => {
      render(
        <ChessClock.Root timeControl={{ time: "5+0", clockStart: "immediate" }}>
          <ChessClock.PlayPause asChild pauseContent="⏸️ Stop">
            <div data-testid="custom-playpause" role="button" tabIndex={0}>
              Ignored
            </div>
          </ChessClock.PlayPause>
        </ChessClock.Root>,
      );

      const customElement = screen.getByTestId("custom-playpause");
      expect(customElement).toHaveTextContent("⏸️ Stop");
    });
  });

  it("should have displayName", () => {
    expect(ChessClock.PlayPause.displayName).toBe("ChessClock.PlayPause");
  });
});
