import { validateWorkerPath } from "../workerPath";

describe("validateWorkerPath", () => {
  // jsdom defaults to http://localhost:3000, which is perfect for these tests

  it("accepts https URLs", () => {
    expect(() =>
      validateWorkerPath("https://example.com/worker.js"),
    ).not.toThrow();
    expect(() =>
      validateWorkerPath("https://cdn.example.com/path/to/stockfish.js"),
    ).not.toThrow();
    expect(() =>
      validateWorkerPath("https://unpkg.com/stockfish@17.1.0/src/stockfish.js"),
    ).not.toThrow();
  });

  it("accepts http URLs for localhost", () => {
    expect(() =>
      validateWorkerPath("http://localhost:3000/worker.js"),
    ).not.toThrow();
    expect(() =>
      validateWorkerPath("http://localhost:8080/stockfish.js"),
    ).not.toThrow();
    expect(() =>
      validateWorkerPath("http://127.0.0.1:3000/worker.js"),
    ).not.toThrow();
  });

  it("accepts relative URLs (parsed against origin)", () => {
    // Since origin is localhost, relative paths should work
    expect(() => validateWorkerPath("/worker.js")).not.toThrow();
    expect(() => validateWorkerPath("./stockfish.js")).not.toThrow();
  });

  it("trims whitespace before validation", () => {
    expect(() =>
      validateWorkerPath("  https://example.com/worker.js  "),
    ).not.toThrow();
  });

  it("rejects null bytes", () => {
    expect(() => validateWorkerPath("path\x00")).toThrow("null bytes");
    expect(() =>
      validateWorkerPath("https://example.com/\x00worker.js"),
    ).toThrow("null bytes");
  });

  it("rejects data URLs", () => {
    expect(() =>
      validateWorkerPath("data:text/javascript,console.log(1)"),
    ).toThrow();
    expect(() =>
      validateWorkerPath("data:application/javascript,alert(1)"),
    ).toThrow();
  });

  it("rejects javascript URLs", () => {
    expect(() => validateWorkerPath("javascript:console.log(1)")).toThrow();
    expect(() => validateWorkerPath("javascript:alert(1)")).toThrow();
  });

  it("rejects blob URLs", () => {
    expect(() =>
      validateWorkerPath("blob:https://example.com/uuid-worker"),
    ).toThrow();
  });

  it("rejects file URLs", () => {
    expect(() => validateWorkerPath("file:///path/to/worker.js")).toThrow();
  });

  it("rejects http URLs for non-localhost", () => {
    expect(() => validateWorkerPath("http://example.com/worker.js")).toThrow(
      "must use https://",
    );
    expect(() => validateWorkerPath("http://192.168.1.1/worker.js")).toThrow(
      "must use https://",
    );
  });
});
