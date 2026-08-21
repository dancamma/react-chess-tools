/**
 * The default jsdom origin is localhost, which would pass the http check through
 * the localhost branch. Serve the document from a LAN address instead so the
 * same-origin branch is the only thing that can allow http here.
 *
 * @jest-environment-options {"url": "http://192.168.1.5:5173/"}
 */
import { validateWorkerPath } from "../workerPath";

describe("validateWorkerPath on a plain-http non-localhost origin", () => {
  it("accepts a relative path", () => {
    expect(() => validateWorkerPath("/stockfish/stockfish.js")).not.toThrow();
  });

  it("accepts an absolute path on the document's own origin", () => {
    expect(() =>
      validateWorkerPath("http://192.168.1.5:5173/stockfish.js"),
    ).not.toThrow();
  });

  it("still rejects http on another origin", () => {
    expect(() =>
      validateWorkerPath("http://192.168.1.6:5173/stockfish.js"),
    ).toThrow("https:// protocol");
  });
});
