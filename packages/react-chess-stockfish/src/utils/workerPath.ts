import { DEFAULT_WORKER_PATH } from "../types";

/**
 * Validate a Stockfish worker path for security.
 *
 * This prevents XSS attacks by rejecting dangerous URL schemes like data:,
 * javascript:, blob:, and file:. Only https:// URLs are accepted (http:// is
 * allowed for localhost only).
 *
 * @param workerPath - The URL path to validate
 * @throws {Error} If the path contains null bytes or uses an invalid protocol
 *
 * @example
 * ```ts
 * validateWorkerPath("https://example.com/worker.js");  // OK
 * validateWorkerPath("http://localhost:3000/worker.js"); // OK (localhost)
 * validateWorkerPath("data:text/javascript,...");       // throws
 * validateWorkerPath("javascript:alert(1)");            // throws
 * ```
 */
export function validateWorkerPath(workerPath: string): void {
  const trimmed = workerPath.trim();

  // Reject null bytes to prevent path truncation attacks
  if (trimmed.includes("\0")) {
    throw new Error("workerPath cannot contain null bytes");
  }

  let url: URL;
  try {
    // Parse relative to current origin to catch relative paths
    const base =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://localhost";
    url = new URL(trimmed, base);
  } catch {
    throw new Error(`Invalid workerPath: ${workerPath}`);
  }

  // Allow http: for localhost only (for development)
  const isLocalhost =
    url.hostname === "localhost" || url.hostname === "127.0.0.1";

  if (url.protocol !== "https:" && !(isLocalhost && url.protocol === "http:")) {
    throw new Error(
      `workerPath must use https:// protocol (http:// allowed for localhost only)`,
    );
  }
}

export { DEFAULT_WORKER_PATH };
