import { TENKA_MOVES, TENKA_PLACING } from "./tenka.constants.ts";
import type { TenkaGame, TenkaMove, TenkaPlacing, TenkaMapKey } from "./tenka.types.ts";
import { playTenka } from "./tenka.ts";
import { TENKA_MAPS } from "./tenkaMap.ts";
import { startTenka } from "./tenkaStart.ts";

/**
 * A GAME OF TENKA AS TEXT TO KEEP, and read back: its table and its moves,
 * never the world, which the moves make again — dice and all, from the seed.
 *
 * Each move is written as a short list, its kind's letter first, so that a
 * long evening's game stays small in a browser's storage:
 *
 *   p territory armies   place          x a b c    trade three cards
 *   a from to dice       attack         b from to  attack until it is decided
 *   o armies             move in
 *   e                    end attacking  f from to  fortify from, to
 *   s armies             how many move  t          end the turn
 */

/**
 * The version of what `encodeTenka` writes, so a later shape can refuse an older one rather than misread it. It is 2
 * since 2.0.0, when the world and Europe became the classic boards': a game kept at 1 was dealt, and its moves numbered, on
 * a different set of territories, so it is refused rather than replayed as another game.
 */
const KEPT_VERSION = 2;

type Kept = (string | number)[];

/** A move as the short list it is kept as — and sent as, to the other devices at a table played on several.
 *
 * @param move - The native move to apply or encode.
 * @returns A move as the short list it is kept as — and sent as, to the other devices at a table played on several.
 * @example
 * ```ts
 * import { writeTenkaMove } from "@johnmorrisdotca/tenka";
 *
 * console.log(writeTenkaMove({kind:"endTurn"}));
 * ```
 */
export function writeTenkaMove(move: TenkaMove): Kept {
  switch (move.kind) {
    case TENKA_MOVES.place:
      return ["p", move.territory, move.armies];
    case TENKA_MOVES.trade:
      return ["x", ...move.cards];
    case TENKA_MOVES.attack:
      return ["a", move.from, move.to, move.dice];
    case TENKA_MOVES.blitz:
      return ["b", move.from, move.to];
    case TENKA_MOVES.occupy:
      return ["o", move.armies];
    case TENKA_MOVES.endAttack:
      return ["e"];
    case TENKA_MOVES.fortify:
      return ["f", move.from, move.to];
    case TENKA_MOVES.shift:
      return ["s", move.armies];
    case TENKA_MOVES.endTurn:
      return ["t"];
  }
}

/** A kept move read back, or null for anything that is not one.
 *
 * @param kept - The unknown compact move data to parse.
 * @returns The parsed move, or null when the compact shape is not recognized.
 * @example
 * ```ts
 * import { readTenkaMove } from "@johnmorrisdotca/tenka";
 *
 * console.log(readTenkaMove(["t"]));
 * ```
 */
export function readTenkaMove(kept: unknown): TenkaMove | null {
  if (!Array.isArray(kept) || typeof kept[0] !== "string") return null;
  const [letter, ...rest] = kept as [string, ...unknown[]];
  if (!rest.every((value) => typeof value === "number")) return null;
  const n = rest as number[];
  const is = (count: number) => n.length === count;
  switch (letter) {
    case "p":
      return is(2) ? { kind: TENKA_MOVES.place, territory: n[0], armies: n[1] } : null;
    case "x":
      return is(3) ? { kind: TENKA_MOVES.trade, cards: n } : null;
    case "a":
      return is(3) ? { kind: TENKA_MOVES.attack, from: n[0], to: n[1], dice: n[2] } : null;
    case "b":
      return is(2) ? { kind: TENKA_MOVES.blitz, from: n[0], to: n[1] } : null;
    case "o":
      return is(1) ? { kind: TENKA_MOVES.occupy, armies: n[0] } : null;
    case "e":
      return is(0) ? { kind: TENKA_MOVES.endAttack } : null;
    case "f":
      return is(2) ? { kind: TENKA_MOVES.fortify, from: n[0], to: n[1] } : null;
    case "s":
      return is(1) ? { kind: TENKA_MOVES.shift, armies: n[0] } : null;
    case "t":
      return is(0) ? { kind: TENKA_MOVES.endTurn } : null;
    default:
      return null;
  }
}

/** A game made again from its table and its moves, or null if any move could not have been made when it was.
 *
 * @param table - The original round limit, players, seed, placement and map.
 * @param moves - The native moves in chronological order.
 * @returns The replayed game, or null for invalid setup or any refused move.
 * @example
 * ```ts
 * import { replayTenka } from "@johnmorrisdotca/tenka";
 *
 * console.log(replayTenka({rounds:10,players:["Seat 1","Seat 2"],seed:42,placing:"auto"},[] )?.seed);
 * ```
 */
export function replayTenka(
  table: { rounds: number; players: readonly string[]; seed: number; placing: TenkaPlacing; map?: TenkaMapKey },
  moves: readonly TenkaMove[],
): TenkaGame | null {
  let game = startTenka(table.rounds, table.players, table.seed, table.placing, table.map ?? "world");
  for (const move of moves) {
    if (game === null) return null;
    game = playTenka(game, move);
  }
  return game;
}

/** A game as text to keep: its table and its moves.
 *
 * @param game - The current native game state.
 * @returns A game as text to keep: its table and its moves.
 * @example
 * ```ts
 * import { encodeTenka, startTenka } from "@johnmorrisdotca/tenka";
 *
 * const game = startTenka(10,["Seat 1","Seat 2"],42)!;
 * console.log(encodeTenka(game));
 * ```
 */
export function encodeTenka(game: TenkaGame): string {
  return JSON.stringify({
    v: KEPT_VERSION,
    seed: game.seed,
    players: game.players,
    rounds: game.rounds,
    placing: game.placing,
    // The map only when it is not the world, so a world game is kept exactly as before there was a choice.
    ...(game.map === undefined || game.map === "world" ? {} : { map: game.map }),
    moves: game.moves.map(writeTenkaMove),
  });
}

/**
 * A kept game read back, or null for nothing kept, or for text that is not a
 * game these rules can play out again: a browser's storage is somebody's to
 * edit, and a half-understood game is worse than none.
 *
 * @param text - The encoded game text to validate and replay.
 * @returns The reconstructed game, or null for absent, malformed, unsupported or illegal saved data.
 * @example
 * ```ts
 * import { decodeTenka, encodeTenka, startTenka } from "@johnmorrisdotca/tenka";
 *
 * const game = startTenka(10,["Seat 1","Seat 2"],42)!;
 * console.log(decodeTenka(encodeTenka(game))?.seed);
 * ```
 */
export function decodeTenka(text: string | null): TenkaGame | null {
  if (text === null) return null;
  let kept: unknown;
  try {
    kept = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof kept !== "object" || kept === null) return null;
  const { v, seed, players, rounds, placing, moves, map } = kept as Record<string, unknown>;
  if (v !== KEPT_VERSION || typeof seed !== "number" || typeof rounds !== "number") return null;
  if (placing !== TENKA_PLACING.auto && placing !== TENKA_PLACING.hand) return null;
  if (!Array.isArray(players) || !players.every((name) => typeof name === "string")) return null;
  if (!Array.isArray(moves)) return null;
  if (map !== undefined && !(typeof map === "string" && map in TENKA_MAPS)) return null;
  const read = moves.map(readTenkaMove);
  if (read.some((move) => move === null)) return null;
  return replayTenka({ seed, players: players as string[], rounds, placing, map: (map as TenkaMapKey | undefined) ?? "world" }, read as TenkaMove[]);
}
