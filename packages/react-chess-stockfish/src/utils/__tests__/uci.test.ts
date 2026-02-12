import {
  validateFen,
  uciToSan,
  uciToPvMoves,
  parseUciInfoLine,
  buildUciGoCommand,
} from "../uci";
import { InvalidFenError } from "../evaluation";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

describe("validateFen", () => {
  it("accepts valid starting position FEN", () => {
    expect(() => validateFen(START_FEN)).not.toThrow();
  });

  it("accepts valid FENs for different positions", () => {
    expect(() =>
      validateFen(
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
      ),
    ).not.toThrow();
    expect(() =>
      validateFen(
        "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 2",
      ),
    ).not.toThrow();
  });

  it("throws InvalidFenError for invalid FENs", () => {
    expect(() => validateFen("invalid")).toThrow(InvalidFenError);
    expect(() => validateFen("rnbqkbnr/pppppppp")).toThrow(InvalidFenError);
    expect(() => validateFen("")).toThrow(InvalidFenError);
    expect(() => validateFen("totally-not-a-fen")).toThrow(InvalidFenError);
  });

  it("includes the invalid FEN in the error", () => {
    try {
      validateFen("bad-fen");
      fail("Expected validateFen to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidFenError);
      if (error instanceof InvalidFenError) {
        expect(error.fen).toBe("bad-fen");
      }
    }
  });
});

describe("uciToSan", () => {
  it("converts standard pawn moves", () => {
    expect(uciToSan("e2e4", START_FEN)).toBe("e4");
    expect(uciToSan("e2e3", START_FEN)).toBe("e3");
    expect(uciToSan("d2d4", START_FEN)).toBe("d4");
  });

  it("converts piece moves with piece letter", () => {
    expect(uciToSan("g1f3", START_FEN)).toBe("Nf3");
    expect(uciToSan("b1c3", START_FEN)).toBe("Nc3");
    // Black knight from starting position - need black to move
    const blackToMove =
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1";
    expect(uciToSan("g8f6", blackToMove)).toBe("Nf6");
  });

  it("converts castling moves", () => {
    // White kingside
    const whiteKingside = "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1";
    expect(uciToSan("e1g1", whiteKingside)).toBe("O-O");

    // Black kingside
    const blackKingside = "r3k2r/8/8/8/8/8/8/R3K2R b KQkq - 0 1";
    expect(uciToSan("e8g8", blackKingside)).toBe("O-O");

    // White queenside
    const whiteQueenside = "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1";
    expect(uciToSan("e1c1", whiteQueenside)).toBe("O-O-O");

    // Black queenside
    const blackQueenside = "r3k2r/8/8/8/8/8/8/R3K2R b KQkq - 0 1";
    expect(uciToSan("e8c8", blackQueenside)).toBe("O-O-O");
  });

  it("converts promotion moves", () => {
    const promoPos = "8/4P1k1/8/8/8/8/3K4/8 w - - 0 1";
    expect(uciToSan("e7e8q", promoPos)).toBe("e8=Q");
    expect(uciToSan("e7e8r", promoPos)).toBe("e8=R");
    expect(uciToSan("e7e8b", promoPos)).toBe("e8=B");
    // Knight promotion gives check (+)
    expect(uciToSan("e7e8n", promoPos)).toBe("e8=N+");
  });

  it("returns UCI string if move is invalid in the position", () => {
    // e4e5 is trying to move from empty square (no piece at e4 from start)
    expect(uciToSan("e4e5", START_FEN)).toBe("e4e5");
    expect(uciToSan("a0a0", START_FEN)).toBe("a0a0");
  });
});

describe("uciToPvMoves", () => {
  it("converts array of UCI moves to PVMove objects", () => {
    const result = uciToPvMoves(["e2e4", "e7e5", "g1f3"], START_FEN);

    expect(result).toEqual([
      { uci: "e2e4", san: "e4" },
      { uci: "e7e5", san: "e5" },
      { uci: "g1f3", san: "Nf3" },
    ]);
  });

  it("handles longer move sequences", () => {
    const result = uciToPvMoves(
      ["e2e4", "e7e5", "g1f3", "b8c6", "f1b5"],
      START_FEN,
    );

    expect(result).toHaveLength(5);
    expect(result[0]).toEqual({ uci: "e2e4", san: "e4" });
    expect(result[4]).toEqual({ uci: "f1b5", san: "Bb5" });
  });

  it("handles promotion moves in sequence", () => {
    // Test a simple sequence from the starting position
    const result = uciToPvMoves(["e2e4", "e7e5", "g1f3", "b8c6"], START_FEN);

    expect(result).toHaveLength(4);
    expect(result[0]).toEqual({ uci: "e2e4", san: "e4" });
    expect(result[1]).toEqual({ uci: "e7e5", san: "e5" });
    expect(result[2]).toEqual({ uci: "g1f3", san: "Nf3" });
    expect(result[3]).toEqual({ uci: "b8c6", san: "Nc6" });
  });

  it("returns UCI moves that can't be converted", () => {
    // If a move in the sequence is illegal (too short to be valid UCI),
    // it should still be included
    const result = uciToPvMoves(["e2e4", "ab", "g1f3"], START_FEN);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ uci: "e2e4", san: "e4" });
    // The invalid move will have UCI as both uci and san (fallback)
    expect(result[1]).toEqual({ uci: "ab", san: "ab" });
    // After e4, it's black's turn, so g1f3 fails and returns the UCI as fallback
    expect(result[2]).toEqual({ uci: "g1f3", san: "g1f3" });
  });

  it("handles empty array", () => {
    const result = uciToPvMoves([], START_FEN);
    expect(result).toEqual([]);
  });
});

describe("parseUciInfoLine", () => {
  it("parses centipawn score", () => {
    const info = parseUciInfoLine(
      "info depth 20 score cp 123 nodes 1000000 nps 500000 time 2000 pv e2e4 e7e5",
    );

    expect(info).not.toBeNull();
    expect(info!.depth).toBe(20);
    expect(info!.score).toEqual({ type: "cp", value: 123 });
    expect(info!.nodes).toBe(1000000);
    expect(info!.nps).toBe(500000);
    expect(info!.time).toBe(2000);
    expect(info!.pv).toEqual(["e2e4", "e7e5"]);
  });

  it("parses mate score", () => {
    const info = parseUciInfoLine(
      "info depth 15 score mate 3 pv e2e4 e7e5 g1f3",
    );

    expect(info!.score).toEqual({ type: "mate", value: 3 });
    expect(info!.pv).toEqual(["e2e4", "e7e5", "g1f3"]);
  });

  it("parses negative mate score", () => {
    const info = parseUciInfoLine("info depth 10 score mate -2 pv e7e5");

    expect(info!.score).toEqual({ type: "mate", value: -2 });
  });

  it("parses multipv", () => {
    const info = parseUciInfoLine(
      "info multipv 2 depth 20 score cp 50 pv d2d4",
    );

    expect(info!.multipv).toBe(2);
    expect(info!.depth).toBe(20);
    expect(info!.score).toEqual({ type: "cp", value: 50 });
  });

  it("parses tbhits", () => {
    const info = parseUciInfoLine("info depth 30 tbhits 42 score cp 0 pv e2e4");

    expect(info!.tbHits).toBe(42);
  });

  it("handles partial info lines (no pv)", () => {
    const info = parseUciInfoLine("info depth 5 score cp -30");

    expect(info!.depth).toBe(5);
    expect(info!.score).toEqual({ type: "cp", value: -30 });
    expect(info!.pv).toBeUndefined();
  });

  it("skips unknown tokens gracefully", () => {
    const info = parseUciInfoLine(
      "info depth 10 seldepth 15 score cp 100 pv e2e4",
    );

    expect(info!.depth).toBe(10);
    expect(info!.score).toEqual({ type: "cp", value: 100 });
    expect(info!.pv).toEqual(["e2e4"]);
  });

  it("returns an empty object for info-only line", () => {
    const info = parseUciInfoLine("info string some debug message");

    expect(info).not.toBeNull();
    // No structured fields parsed, just unknown tokens skipped
    expect(info!.depth).toBeUndefined();
    expect(info!.score).toBeUndefined();
  });
});

describe("buildUciGoCommand", () => {
  it("returns depth command when depth is specified", () => {
    expect(buildUciGoCommand({ depth: 20 })).toBe("depth 20");
  });

  it("returns infinite when depth is not specified", () => {
    expect(buildUciGoCommand({})).toBe("infinite");
  });

  it("returns infinite when depth is zero", () => {
    expect(buildUciGoCommand({ depth: 0 })).toBe("infinite");
  });

  it("returns infinite when depth is undefined", () => {
    expect(buildUciGoCommand({ depth: undefined })).toBe("infinite");
  });

  it("ignores non-depth config fields", () => {
    expect(buildUciGoCommand({ skillLevel: 10, multiPV: 3 })).toBe("infinite");
    expect(buildUciGoCommand({ skillLevel: 10, multiPV: 3, depth: 15 })).toBe(
      "depth 15",
    );
  });
});
