import type { Puzzle } from "@react-chess-tools/react-chess-puzzle";

export interface Lesson {
  id: string;
  title: string;
  motif: string;
  difficulty: string;
  prompt: string;
  explanation: string;
  puzzle: Puzzle;
}

// Original teaching positions, with one longer combination from the library's examples.
export const LESSONS: Lesson[] = [
  {
    id: "back-rank",
    title: "L'ultima traversa",
    motif: "Matto di corridoio",
    difficulty: "Essenziale",
    prompt:
      "Il re ha una casa sicura. O almeno così sembra. Trova il matto in una mossa.",
    explanation:
      "Re8# porta la torre sull'ottava traversa. I pedoni f7, g7 e h7 chiudono tutte le uscite del re: prima di attaccare, cerca le sue vie di fuga.",
    puzzle: {
      fen: "6k1/5ppp/8/8/8/8/6PP/4R1K1 w - - 0 1",
      moves: ["e1e8"],
      makeFirstMove: false,
    },
  },
  {
    id: "ladder",
    title: "Un gradino alla volta",
    motif: "Coordinazione",
    difficulty: "Essenziale",
    prompt: "Due torri, un solo piano. Trova il matto in una mossa.",
    explanation:
      "Ra8# dà scacco mentre la torre b7 taglia la settima traversa. Le torri si dividono il lavoro: una attacca, l'altra impedisce la fuga.",
    puzzle: {
      fen: "7k/RR6/8/8/8/8/8/7K w - - 0 1",
      moves: ["a7a8"],
      makeFirstMove: false,
    },
  },
  {
    id: "queen-net",
    title: "Una rete silenziosa",
    motif: "Re e donna",
    difficulty: "Essenziale",
    prompt: "Il tuo re è già al posto giusto. Completa la rete di matto.",
    explanation:
      "Qg7# è protetta dal re f6. La donna controlla g8 e h7; il re nero non può catturarla. La vicinanza del tuo re trasforma una minaccia in matto.",
    puzzle: {
      fen: "7k/8/5KQ1/8/8/8/8/8 w - - 0 1",
      moves: ["g6g7"],
      makeFirstMove: false,
    },
  },
  {
    id: "fork",
    title: "Due problemi insieme",
    motif: "Forchetta di cavallo",
    difficulty: "Intermedio",
    prompt:
      "Non inseguire la donna. Costringi prima il re a rispondere, poi conquista materiale.",
    explanation:
      "Ne7+ attacca contemporaneamente re e donna. Dopo Kf8, Nxd5 guadagna la donna. Uno scacco ti regala il tempo per completare la forchetta.",
    puzzle: {
      fen: "6k1/5ppp/8/3q1N2/8/8/6PP/6K1 w - - 0 1",
      moves: ["f5e7", "g8f8", "e7d5"],
      makeFirstMove: false,
    },
  },
  {
    id: "black-rank",
    title: "Dall'altra parte",
    motif: "Matto di corridoio",
    difficulty: "Essenziale",
    prompt:
      "Ora giochi con il Nero. Cambia prospettiva e trova il matto in una mossa.",
    explanation:
      "...Re1# sfrutta i pedoni f2, g2 e h2 che intrappolano il re bianco. Lo stesso schema funziona con entrambi i colori: riconosci la forma, non il verso della scacchiera.",
    puzzle: {
      fen: "4r1k1/6pp/8/8/8/8/5PPP/6K1 b - - 0 1",
      moves: ["e8e1"],
      makeFirstMove: false,
    },
  },
  {
    id: "promotion",
    title: "Il piccolo diventa grande",
    motif: "Promozione",
    difficulty: "Essenziale",
    prompt: "Un pedone a un passo dalla meta. Promuovi e dai matto.",
    explanation:
      "f8=Q# trasforma il pedone in donna. Il re g6 controlla g7 e h7; la donna chiude l'ottava traversa. Anche f8=R# è matto: qui entrambe le promozioni sono accettate.",
    puzzle: {
      fen: "7k/5P2/6K1/8/8/8/8/8 w - - 0 1",
      moves: ["f7f8q"],
      makeFirstMove: false,
    },
  },
  {
    id: "deflection",
    title: "Il prezzo della difesa",
    motif: "Deviazione",
    difficulty: "Avanzato",
    prompt:
      "Il cavallo difende tutto. Fallo scegliere: calcola la combinazione fino al matto.",
    explanation:
      "Bxd7+ Nxd7 allontana il cavallo da f6. Qb8+! lo devia ancora: dopo Nxb8, Rd8# conclude. La donna si sacrifica per liberare l'ottava traversa alla torre.",
    puzzle: {
      fen: "4kb1r/p2r1ppp/4qn2/1B2p1B1/4P3/1Q6/PPP2PPP/2KR4 w k - 0 1",
      moves: ["Bxd7+", "Nxd7", "Qb8+", "Nxb8", "Rd8#"],
      makeFirstMove: false,
    },
  },
  {
    id: "smothered",
    title: "Troppo ben protetto",
    motif: "Matto soffocato",
    difficulty: "Intermedio",
    prompt:
      "I pezzi del Nero circondano il loro re. Quale pezzo può attraversare questa barriera?",
    explanation:
      "Nf7# salta le difese. Torre g8 e pedoni g7 e h7 occupano le case di fuga; il re non ha alcuna risposta allo scacco di cavallo.",
    puzzle: {
      fen: "6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1",
      moves: ["g5f7"],
      makeFirstMove: false,
    },
  },
];

export const COLLECTIONS = [
  {
    id: "essentials",
    number: "01",
    title: "L'arte di chiudere",
    subtitle: "Riconosci il matto prima di cercare la mossa.",
    label: "LE BASI",
    ids: ["back-rank", "ladder", "queen-net", "black-rank"],
    minutes: 4,
    color: "sage",
  },
  {
    id: "forcing",
    number: "02",
    title: "Una mossa, due idee",
    subtitle: "Forchette, salti e piccoli grandi cambiamenti.",
    label: "LA VISIONE",
    ids: ["fork", "smothered", "promotion"],
    minutes: 5,
    color: "sand",
  },
  {
    id: "sacrifice",
    number: "03",
    title: "Lascia andare la donna",
    subtitle: "Una combinazione da calcolare fino in fondo.",
    label: "IL CALCOLO",
    ids: ["deflection"],
    minutes: 3,
    color: "rose",
  },
] as const;

export function getLessons(ids: readonly string[]): Lesson[] {
  return ids.map((id) => {
    const lesson = LESSONS.find((item) => item.id === id);
    if (!lesson) throw new Error(`Unknown lesson: ${id}`);
    return lesson;
  });
}
