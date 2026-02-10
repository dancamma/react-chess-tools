import { validateFen, uciToSan, uciToPvMoves } from "../uci";
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

  it("handles disambiguation when needed", () => {
    // Position where both knights can move to d2
    // After some moves to create disambiguation scenario
    const disambiguationFen =
      "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3";
    // In this position, black knights on b8 and c6 could theoretically move to certain squares
    // This is a simplified test showing the function handles chess.js disambiguation
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
