import { defaultGameTheme } from "../defaults";

describe("defaultGameTheme", () => {
  describe("backward compatibility", () => {
    it("should have the original lastMove color", () => {
      expect(defaultGameTheme.state.lastMove).toBe("rgba(255, 255, 0, 0.5)");
    });

    it("should have the original check color", () => {
      expect(defaultGameTheme.state.check).toBe("rgba(255, 0, 0, 0.5)");
    });

    it("should have the original activeSquare color", () => {
      expect(defaultGameTheme.state.activeSquare).toBe(
        "rgba(255, 255, 0, 0.5)",
      );
    });

    it("should have the original dropSquare style", () => {
      expect(defaultGameTheme.state.dropSquare).toEqual({
        backgroundColor: "rgba(255, 255, 0, 0.4)",
      });
    });

    it("should have the original move indicator color", () => {
      expect(defaultGameTheme.indicators.move).toBe("rgba(0, 0, 0, 0.1)");
    });

    it("should have the original capture indicator color", () => {
      expect(defaultGameTheme.indicators.capture).toBe("rgba(1, 0, 0, 0.1)");
    });
  });

  describe("structure", () => {
    it("should have board property with lightSquare and darkSquare", () => {
      expect(defaultGameTheme.board).toHaveProperty("lightSquare");
      expect(defaultGameTheme.board).toHaveProperty("darkSquare");
    });

    it("should have state property with all required colors", () => {
      expect(defaultGameTheme.state).toHaveProperty("lastMove");
      expect(defaultGameTheme.state).toHaveProperty("check");
      expect(defaultGameTheme.state).toHaveProperty("activeSquare");
      expect(defaultGameTheme.state).toHaveProperty("dropSquare");
    });

    it("should have indicators property with move and capture", () => {
      expect(defaultGameTheme.indicators).toHaveProperty("move");
      expect(defaultGameTheme.indicators).toHaveProperty("capture");
    });

    it("should have valid CSS properties for board squares", () => {
      expect(defaultGameTheme.board.lightSquare).toHaveProperty(
        "backgroundColor",
      );
      expect(defaultGameTheme.board.darkSquare).toHaveProperty(
        "backgroundColor",
      );
    });
  });
});
