if (typeof SharedArrayBuffer === "undefined") {
  throw new Error(
    "Fairy-Stockfish requires cross-origin isolation. Serve Storybook with Cross-Origin-Opener-Policy: same-origin and Cross-Origin-Embedder-Policy: require-corp.",
  );
}

importScripts("./stockfish.js");

let engine = null;
const pendingMessages = [];
const engineScriptUrl = new URL("./stockfish.js", self.location.href).href;

function flushPendingMessages() {
  if (!engine) {
    return;
  }

  while (pendingMessages.length > 0) {
    engine.postMessage(pendingMessages.shift());
  }
}

function forwardEngineMessage(message) {
  self.postMessage(message);
}

const factory =
  typeof Stockfish === "function"
    ? Stockfish
    : typeof self.Stockfish === "function"
      ? self.Stockfish
      : null;

if (!factory) {
  throw new Error(
    "Fairy-Stockfish worker could not find the Stockfish factory",
  );
}

factory({
  locateFile: (file) => new URL(`./${file}`, engineScriptUrl).href,
  mainScriptUrlOrBlob: engineScriptUrl,
})
  .then((instance) => {
    engine = instance;
    engine.addMessageListener(forwardEngineMessage);
    flushPendingMessages();
  })
  .catch((error) => {
    self.postMessage(
      `info string Fairy-Stockfish worker initialization failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  });

self.onmessage = (event) => {
  const message = String(event.data);

  if (!engine) {
    pendingMessages.push(message);
    return;
  }

  engine.postMessage(message);
};
