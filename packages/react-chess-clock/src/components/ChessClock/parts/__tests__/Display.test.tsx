import React from "react";
import { render, screen } from "@testing-library/react";
import { ChessClock } from "../../index";

describe("ChessClock.Display", () => {
  it("should render white player time", () => {
    render(
      <ChessClock.Root timeControl={{ time: "5+0" }}>
        <ChessClock.Display color="white" data-testid="white-clock" />
      </ChessClock.Root>,
    );

    const display = screen.getByTestId("white-clock");
    expect(display).toBeInTheDocument();
    expect(display).toHaveTextContent("5:00");
  });

  it("should render black player time", () => {
    render(
      <ChessClock.Root timeControl={{ time: "10+5" }}>
        <ChessClock.Display color="black" data-testid="black-clock" />
      </ChessClock.Root>,
    );

    const display = screen.getByTestId("black-clock");
    expect(display).toHaveTextContent("10:00");
  });

  it("should include data attributes", () => {
    render(
      <ChessClock.Root timeControl={{ time: "5+0" }}>
        <ChessClock.Display color="white" data-testid="clock" />
      </ChessClock.Root>,
    );

    const display = screen.getByTestId("clock");
    expect(display).toHaveAttribute("data-clock-color", "white");
    expect(display).toHaveAttribute("data-clock-active", "false");
    expect(display).toHaveAttribute("data-clock-paused", "false");
    expect(display).toHaveAttribute("data-clock-timeout", "false");
    expect(display).toHaveAttribute("data-clock-status", "delayed"); // default clockStart is "delayed"
  });

  it("should show active clock when clock is running", () => {
    render(
      <ChessClock.Root timeControl={{ time: "5+0", clockStart: "immediate" }}>
        <ChessClock.Display color="white" data-testid="white-clock" />
        <ChessClock.Display color="black" data-testid="black-clock" />
      </ChessClock.Root>,
    );

    const whiteClock = screen.getByTestId("white-clock");
    const blackClock = screen.getByTestId("black-clock");

    expect(whiteClock).toHaveAttribute("data-clock-active", "true");
    expect(blackClock).toHaveAttribute("data-clock-active", "false");
  });

  it("should support custom className", () => {
    render(
      <ChessClock.Root timeControl={{ time: "5+0" }}>
        <ChessClock.Display
          color="white"
          className="custom-class"
          data-testid="clock"
        />
      </ChessClock.Root>,
    );

    expect(screen.getByTestId("clock")).toHaveClass("custom-class");
  });

  it("should support custom style", () => {
    render(
      <ChessClock.Root timeControl={{ time: "5+0" }}>
        <ChessClock.Display
          color="white"
          style={{ fontSize: "24px" }}
          data-testid="clock"
        />
      </ChessClock.Root>,
    );

    expect(screen.getByTestId("clock")).toHaveStyle({ fontSize: "24px" });
  });

  describe("format prop", () => {
    it("should format as mm:ss", () => {
      render(
        <ChessClock.Root timeControl={{ time: "5+0" }}>
          <ChessClock.Display
            color="white"
            format="mm:ss"
            data-testid="clock"
          />
        </ChessClock.Root>,
      );

      expect(screen.getByTestId("clock")).toHaveTextContent("5:00");
    });

    it("should format as ss.d", () => {
      render(
        <ChessClock.Root timeControl={{ time: "5+0" }}>
          <ChessClock.Display color="white" format="ss.d" data-testid="clock" />
        </ChessClock.Root>,
      );

      expect(screen.getByTestId("clock")).toHaveTextContent("300.0");
    });

    it("should format as hh:mm:ss for long times", () => {
      render(
        <ChessClock.Root timeControl={{ time: "90+30" }}>
          <ChessClock.Display
            color="white"
            format="hh:mm:ss"
            data-testid="clock"
          />
        </ChessClock.Root>,
      );

      expect(screen.getByTestId("clock")).toHaveTextContent("1:30:00");
    });
  });

  describe("formatTime prop", () => {
    it("should use custom formatTime function", () => {
      const customFormat = jest.fn((ms) => `${Math.ceil(ms / 1000)}s`);

      render(
        <ChessClock.Root timeControl={{ time: "5+0" }}>
          <ChessClock.Display
            color="white"
            formatTime={customFormat}
            data-testid="clock"
          />
        </ChessClock.Root>,
      );

      expect(screen.getByTestId("clock")).toHaveTextContent("300s");
      expect(customFormat).toHaveBeenCalledWith(300_000);
    });
  });

  it("should have displayName", () => {
    expect(ChessClock.Display.displayName).toBe("ChessClock.Display");
  });
});
