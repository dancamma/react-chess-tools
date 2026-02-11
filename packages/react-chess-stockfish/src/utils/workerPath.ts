/**
 * Validate a worker path against the allowlist policy:
 * - no null bytes
 * - https only (http allowed for localhost/127.0.0.1)
 * - rejects data:, javascript:, blob:, file:, etc.
 */
export function validateWorkerPath(workerPath: string): void {
  const trimmed = workerPath.trim();

  if (!trimmed) {
    throw new Error("workerPath cannot be empty");
  }

  if (trimmed.includes("\0")) {
    throw new Error("workerPath cannot contain null bytes");
  }

  let url: URL;
  try {
    const base =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost";
    url = new URL(trimmed, base);
  } catch {
    throw new Error(`Invalid workerPath: ${workerPath}`);
  }

  const isLocalhost =
    url.hostname === "localhost" || url.hostname === "127.0.0.1";
  const isAllowedProtocol =
    url.protocol === "https:" || (isLocalhost && url.protocol === "http:");

  if (!isAllowedProtocol) {
    throw new Error(
      "workerPath must use https:// protocol (http:// allowed for localhost only)",
    );
  }
}
