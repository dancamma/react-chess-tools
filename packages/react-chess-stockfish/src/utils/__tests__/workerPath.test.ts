import { validateWorkerPath } from "../workerPath";

describe("validateWorkerPath", () => {
  it("accepts https URLs", () => {
    expect(() =>
      validateWorkerPath("https://example.com/stockfish/stockfish.js"),
    ).not.toThrow();
  });

  it("accepts localhost http URLs", () => {
    expect(() =>
      validateWorkerPath("http://localhost:3000/stockfish.js"),
    ).not.toThrow();
    expect(() =>
      validateWorkerPath("http://127.0.0.1:3000/stockfish.js"),
    ).not.toThrow();
  });

  it("accepts relative URLs resolved against current origin", () => {
    expect(() => validateWorkerPath("/stockfish/stockfish.js")).not.toThrow();
  });

  it("rejects empty input", () => {
    expect(() => validateWorkerPath("")).toThrow("cannot be empty");
  });

  it("rejects null bytes", () => {
    expect(() => validateWorkerPath("https://example.com/a.js\0")).toThrow(
      "null bytes",
    );
  });

  it("rejects non-https protocols for non-localhost", () => {
    expect(() => validateWorkerPath("http://example.com/stockfish.js")).toThrow(
      "https:// protocol",
    );
    expect(() => validateWorkerPath("javascript:alert('xss')")).toThrow();
    expect(() => validateWorkerPath("data:text/javascript,alert(1)")).toThrow();
    expect(() => validateWorkerPath("blob:https://example.com/abc")).toThrow();
    expect(() => validateWorkerPath("file:///tmp/stockfish.js")).toThrow();
  });
});
