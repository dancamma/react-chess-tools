/**
 * Preset time controls for common chess formats
 *
 * @example
 * ```tsx
 * import { presets } from "@react-chess-tools/react-chess-clock";
 *
 * <ChessClock.Root timeControl={{ time: presets.blitz5_3 }}>
 *   <ChessClock.Display color="white" />
 *   <ChessClock.Display color="black" />
 * </ChessClock.Root>
 * ```
 */
export const presets = {
  // Bullet (< 3 minutes)
  bullet1_0: { baseTime: 60, increment: 0 },
  bullet1_1: { baseTime: 60, increment: 1 },
  bullet2_1: { baseTime: 120, increment: 1 },

  // Blitz (3-10 minutes)
  blitz3_0: { baseTime: 180, increment: 0 },
  blitz3_2: { baseTime: 180, increment: 2 },
  blitz5_0: { baseTime: 300, increment: 0 },
  blitz5_3: { baseTime: 300, increment: 3 },

  // Rapid (10-60 minutes)
  rapid10_0: { baseTime: 600, increment: 0 },
  rapid10_5: { baseTime: 600, increment: 5 },
  rapid15_10: { baseTime: 900, increment: 10 },

  // Classical (≥ 60 minutes)
  classical30_0: { baseTime: 1800, increment: 0 },
  classical90_30: { baseTime: 5400, increment: 30 },

  // Tournament (multi-period)
  fideClassical: [
    { baseTime: 5400, increment: 30, moves: 40 },
    { baseTime: 1800, increment: 30, moves: 20 },
    { baseTime: 900, increment: 30 },
  ],

  uscfClassical: [
    { baseTime: 7200, moves: 40 },
    { baseTime: 3600, moves: 20 },
    { baseTime: 1800 },
  ],
} as const;
