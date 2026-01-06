import React from "react";
import { renderHook } from "@testing-library/react";
import { useChessPuzzleTheme, PuzzleThemeProvider } from "../context";
import { defaultPuzzleTheme } from "../defaults";

describe("useChessPuzzleTheme", () => {
  it("should return default puzzle theme when no provider is present", () => {
    const { result } = renderHook(() => useChessPuzzleTheme());
    expect(result.current).toEqual(defaultPuzzleTheme);
  });

  it("should return provided theme when wrapped in PuzzleThemeProvider", () => {
    const customTheme = {
      ...defaultPuzzleTheme,
      puzzle: {
        ...defaultPuzzleTheme.puzzle,
        hint: "rgba(0, 255, 255, 0.5)",
      },
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PuzzleThemeProvider theme={customTheme}>{children}</PuzzleThemeProvider>
    );

    const { result } = renderHook(() => useChessPuzzleTheme(), { wrapper });
    expect(result.current.puzzle.hint).toBe("rgba(0, 255, 255, 0.5)");
  });

  it("should return all puzzle-specific properties", () => {
    const { result } = renderHook(() => useChessPuzzleTheme());

    expect(result.current.puzzle).toHaveProperty("success");
    expect(result.current.puzzle).toHaveProperty("failure");
    expect(result.current.puzzle).toHaveProperty("hint");
  });

  it("should return inherited game theme properties", () => {
    const { result } = renderHook(() => useChessPuzzleTheme());

    expect(result.current.board).toBeDefined();
    expect(result.current.state).toBeDefined();
    expect(result.current.indicators).toBeDefined();
  });
});

describe("PuzzleThemeProvider", () => {
  it("should allow nested providers with inner provider winning", () => {
    const outerTheme = {
      ...defaultPuzzleTheme,
      puzzle: { ...defaultPuzzleTheme.puzzle, hint: "outer" },
    };
    const innerTheme = {
      ...defaultPuzzleTheme,
      puzzle: { ...defaultPuzzleTheme.puzzle, hint: "inner" },
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PuzzleThemeProvider theme={outerTheme}>
        <PuzzleThemeProvider theme={innerTheme}>{children}</PuzzleThemeProvider>
      </PuzzleThemeProvider>
    );

    const { result } = renderHook(() => useChessPuzzleTheme(), { wrapper });
    expect(result.current.puzzle.hint).toBe("inner");
  });
});
