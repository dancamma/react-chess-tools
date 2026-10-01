# Tempo

Un piccolo club di allenamento tattico, costruito come applicazione consumer di `react-chess-tools`. Tre percorsi, otto posizioni, una posizione del giorno, spiegazioni e replay delle soluzioni, sprint da tre minuti e progressi salvati sul dispositivo.

## Avvio

Dalla radice del repository, con Node 24:

```bash
npm ci
npm run build
npm run dev --workspace @react-chess-tools/tempo
```

Vite stampa l'indirizzo disponibile. La porta predefinita è 5173; se occupata, passa alla successiva.

## Distribuzione

```bash
npm run build
npm run preview --workspace @react-chess-tools/tempo
```

Pubblica `examples/tempo/dist` su un hosting statico alla radice del dominio. Nessun backend, account, chiave API o motore remoto necessario. Font e relative licenze sono inclusi localmente. Non sono presenti analytics né richieste di rete a servizi esterni durante l'utilizzo.

I progressi sono locali al browser, non sincronizzati tra dispositivi. La posizione del giorno ruota nel catalogo di otto posizioni; non è un feed di nuovi puzzle. Lo sprint affronta il catalogo una volta, senza ripetizioni. L'emulazione mobile dei test usa Chromium: non equivale a una certificazione su Safari/iOS reale.

## Verifica

```bash
npm run test --workspace @react-chess-tools/tempo
npx playwright install chromium
npm run test:e2e --workspace @react-chess-tools/tempo
npm run test:packages
npm run lint
npm run test-types
```

I sei test di dominio verificano legalità e obiettivi delle posizioni, sottopromozione e recupero dei dati salvati. Venti test E2E verificano la build di produzione su desktop e viewport mobile: click-to-move, inserimento SAN/UCI, cambio puzzle, errori, indizi, risposta automatica, replay, promozione, pausa, timeout, persistenza e indisponibilità del salvataggio. Il server E2E usa la porta 41873 e termina alla fine della suite.

## Integrazione della libreria

L'app importa esclusivamente gli export pubblici di `react-chess-game`, `react-chess-puzzle` e `react-chess-clock`. Non usa alias verso `packages/*/src`, import privati o patch alla libreria. Le dipendenze npm dei workspace risolvono i pacchetti locali tramite i loro export `dist`, per questo serve compilarli prima di avviare l'app.

- `ChessPuzzle.Root` / `Board` gestiscono soluzione, risposta avversaria, indizi e promozione; il default `solveOnCheckmate` accetta anche un matto diverso dalla linea canonica.
- `useChessPuzzleContext` collega i controlli del prodotto; il conteggio degli errori resta nell'app; `Root.onHint` segnala gli aiuti e `Root.disabled` blocca la posizione durante la pausa.
- `useChessGameContext` permette inserimento testuale e descrizione della posizione. `ChessGame.Root` / `Board` gestiscono anteprima e replay in un contesto separato dal tentativo attivo.
- `useChessClock` gestisce il timer dello sprint. Non è montato un provider condiviso con i puzzle: il tempo della sessione non deve cambiare giocatore dopo ogni mossa.

Bot e Stockfish non fanno parte di questo prodotto e non sono validati da questa integrazione. I test generali del repository ne verificano le unità, ma non sostituiscono una prova dei worker in un'app reale.

## Contenuti

Sette posizioni didattiche sono originali. La combinazione “Il prezzo della difesa” riprende una posizione già presente nelle stories di `react-chess-puzzle`. Tutte le linee vengono verificate con `chess.js` nei test.

## Feedback di integrazione

Il percorso client con Vite funziona con i pacchetti compilati: i controlli del prodotto si compongono liberamente, il tema non richiede CSS privato e le risposte dell'avversario sono automatiche. Le verifiche del browser coprono anche cambio posizione e sottopromozione a torre.

Problemi individuati e risolti in questa modifica:

1. **Import dei pacchetti in Node.** Dopo la build, dalla radice, `node --input-type=module -e 'await import("@react-chess-tools/react-chess-game")'` fallisce su `Named export 'merge' not found` da `lodash`. Anche `node -e 'require("@react-chess-tools/react-chess-game")'` fallisce: `react-chessboard/dist/index.js` usa `require` mentre il pacchetto lo tratta come ESM. Il secondo problema nasce nella dipendenza. Ora gli import di lodash usano il default CommonJS e react-chessboard viene incluso nel bundle della libreria, mantenendo React esterno. La build Vite gestisce entrambi, ma non è prova di compatibilità con Node o SSR senza bundler. `npm run test:packages` ora impacchetta i cinque pacchetti e verifica import ESM/CJS e rendering server di Game e Puzzle sui tarball; la CI esegue questa verifica.
2. **Semantica di `movesPlayed`.** Il contesto espone `state.currentMoveIndex`; il reducer non lo incrementa quando arriva la soluzione. Un matto in una mossa lascia `status: "solved"`, `movesPlayed: 0`, `totalMoves: 1`. Verificato eseguendo il reducer reale con `chess.js`. Ora il conteggio è separato dall'indice e include tutte le semimosse accettate, comprese CPU e mossa finale; esclude gli errori.
3. **Accessibilità della promozione.** Inizialmente i quattro pulsanti del menu non avevano un nome accessibile. La sottopromozione funziona nei test, ma ora il componente espone nomi localizzabili, mantiene il focus nel menu, gestisce Escape e restituisce il focus alla scacchiera. Tempo offre anche inserimento testuale UCI/SAN e descrizione testuale dei pezzi.

La modifica aggiunge anche `ChessPuzzle.Root.onHint` per osservare i livelli di aiuto e `disabled` sui root di Game e Puzzle. Tempo utilizza entrambe le API; non serve più bloccare click e trascinamento separatamente. `disabled` non modifica automaticamente il clock: la pausa del timer resta esplicita.
