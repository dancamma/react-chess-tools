import React from "react";
import { renderHook } from "@testing-library/react";
import { useChessGameTheme, ThemeProvider } from "../context";
import { defaultGameTheme } from "../defaults";
import { lichessTheme } from "../presets";

describe("useChessGameTheme", () => {
  it("should return default theme when no provider is present", () => {
    const { result } = renderHook(() => useChessGameTheme());
    expect(result.current).toEqual(defaultGameTheme);
  });

  it("should return provided theme when wrapped in ThemeProvider", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={lichessTheme}>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useChessGameTheme(), { wrapper });
    expect(result.current).toEqual(lichessTheme);
  });

  it("should return custom theme with all properties", () => {
    const customTheme = {
      ...defaultGameTheme,
      state: {
        ...defaultGameTheme.state,
        lastMove: "rgba(100, 200, 100, 0.6)",
      },
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={customTheme}>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useChessGameTheme(), { wrapper });
    expect(result.current.state.lastMove).toBe("rgba(100, 200, 100, 0.6)");
  });
});

describe("ThemeProvider", () => {
  it("should allow nested providers with inner provider winning", () => {
    const outerTheme = {
      ...defaultGameTheme,
      state: { ...defaultGameTheme.state, lastMove: "outer" },
    };
    const innerTheme = {
      ...defaultGameTheme,
      state: { ...defaultGameTheme.state, lastMove: "inner" },
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={outerTheme}>
        <ThemeProvider theme={innerTheme}>{children}</ThemeProvider>
      </ThemeProvider>
    );

    const { result } = renderHook(() => useChessGameTheme(), { wrapper });
    expect(result.current.state.lastMove).toBe("inner");
  });
});
