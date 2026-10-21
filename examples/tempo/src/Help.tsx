import React, { useEffect } from "react";
import { ArrowRight, X } from "lucide-react";

export function Help({ close }: { close: () => void }) {
  const dialog = React.useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  return (
    <dialog
      ref={dialog}
      onClose={close}
      className="help-dialog"
      aria-labelledby="help-title"
    >
      <button
        className="icon-button dialog-close"
        onClick={() => dialog.current?.close()}
        aria-label="Chiudi istruzioni"
      >
        <X size={20} />
      </button>
      <span className="eyebrow">BENVENUTO AL CLUB</span>
      <h2 id="help-title">Una buona mossa alla volta.</h2>
      <p>
        Seleziona un pezzo e la sua destinazione, oppure trascinalo. Giochi
        inizialmente dal lato in basso; Tempo risponde per l'avversario.
      </p>
      <p>
        Puoi anche inserire una mossa nel campo sotto la scacchiera:{" "}
        <strong>e2e4</strong> oppure notazione inglese, come{" "}
        <strong>Nf3</strong> (cavallo), <strong>Bc4</strong> (alfiere),{" "}
        <strong>Re8</strong> (torre), <strong>Qg7</strong> (donna) e{" "}
        <strong>Kf6</strong> (re). Per promuovere: <strong>g7g8q</strong>.
      </p>
      <p>
        Il primo indizio evidenzia il pezzo; il secondo mostra la destinazione.
        Dopo un errore puoi riprovare. Nello sprint hai tre minuti per
        affrontare otto posizioni: puoi saltare, ma il timer continua anche
        cambiando scheda.
      </p>
      <p>
        I progressi restano in questo browser. Nessun account, nessun dato
        inviato a un server.
      </p>
      <button
        className="button primary"
        onClick={() => dialog.current?.close()}
      >
        Ci sono <ArrowRight size={16} />
      </button>
    </dialog>
  );
}
