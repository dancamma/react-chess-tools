import React from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import "./styles.css";

class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    console.error("Tempo could not render", error);
  }
  render() {
    if (this.state.failed)
      return (
        <main className="error-screen">
          <h1>Ripartiamo da qui.</h1>
          <p>
            Non siamo riusciti a caricare la scacchiera. I progressi salvati
            restano sul tuo dispositivo.
          </p>
          <button
            className="button primary"
            onClick={() => window.location.reload()}
          >
            Ricarica Tempo
          </button>
        </main>
      );
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
