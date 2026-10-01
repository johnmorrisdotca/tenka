import { TENKA_MOVES, TENKA_PHASES } from "./tenka.constants.ts";
import type { TenkaGame, TenkaMove, TenkaPhase, TenkaRoll, TenkaSeat, TenkaTrade, TenkaMap, TenkaMapKey } from "./tenka.types.ts";
import { playTenka } from "./tenka.ts";
import { decodeTenka, readTenkaMove, replayTenka, writeTenkaMove } from "./tenkaKeep.ts";
import { TENKA_MAPS, tenkaMapOf } from "./tenkaMap.ts";
import { startTenka } from "./tenkaStart.ts";
import { TENKA_STRINGS, tenkaSay, territoryNameIn, type TenkaStrings } from "./strings.ts";
import { TENKA_VERSION } from "./version.ts";

/**
 * A GAME WRITTEN OUT for other programs and for people: JSON that reads back
 * in, plain text for a chat or a log, and CSV for a spreadsheet. All pure: a
 * game in, a string out. What is done with the string (a file, a clipboard,
 * a server) is the caller's.
 *
 * What is written is the game's table and its moves, never the world: the
 * moves make the world again, dice and all, from the seed. So an export can
 * never hold a position its moves do not reach, and `tenkaFromJSON` trusts
 * nothing in it: it plays the moves through the rules again, and refuses the
 * text if any one of them could not have been made.
 */

/** The shape of the JSON this package writes. It goes up only when a reader of the old shape would be wrong about the new one. */
export const TENKA_EXPORT_FORMAT = 1;

/** A whole JSON export of one game: what `tenkaToJSON` writes and `tenkaFromJSON` reads. */
export type TenkaExported = {
  /** The shape's number: `TENKA_EXPORT_FORMAT`. */
  format: typeof TENKA_EXPORT_FORMAT;
  /** Always `"tenka"`, so a file of this shape is not mistaken for another game's. */
  game: "tenka";
  /** The package and version that wrote it, such as `"tenka 1.1.0"`. For people; never read back. */
  generator: string;
  /** The seed every deal, shuffle and die is drawn from. */
  seed: number;
  /** The names round the table, in seat order. */
  players: string[];
  /** Rounds before the count: 10, 20 or 60. */
  rounds: number;
  /** Whether the starting armies were scattered (`"auto"`) or placed by hand (`"hand"`). */
  placing: "auto" | "hand";
  /** The map, when it is not the world (`"europe"`); left out for the world. */
  map?: TenkaMapKey;
  /** Every move, in order, each as the short list `writeTenkaMove` makes: `["a", 0, 1, 3]`. */
  moves: (string | number)[][];
  /** Where the game stood when it was written. For people and for listings; never read back, since the moves say it. */
  state: { round: number; phase: TenkaPhase; toPlay: TenkaSeat; winners: TenkaSeat[] };
};

/** A game as the JSON export's object: its table, its moves, and where it stands. */
export function tenkaExported(game: TenkaGame): TenkaExported {
  return {
    format: TENKA_EXPORT_FORMAT,
    game: "tenka",
    generator: `tenka ${TENKA_VERSION}`,
    seed: game.seed,
    players: [...game.players],
    rounds: game.rounds,
    placing: game.placing,
    ...(game.map === undefined || game.map === "world" ? {} : { map: game.map }),
    moves: game.moves.map(writeTenkaMove),
    state: { round: game.round, phase: game.phase, toPlay: game.toPlay, winners: [...game.winners] },
  };
}

/** A game as JSON, two spaces deep, with the format's number first. `tenkaFromJSON` reads it back. */
export function tenkaToJSON(game: TenkaGame): string {
  const { moves, state, ...table } = tenkaExported(game);
  // One move to a line: a long game stays readable and a diff of two saves shows the moves that differ.
  const lines = moves.map((move) => `    ${JSON.stringify(move)}`).join(",\n");
  const head = JSON.stringify(table, null, 2).slice(0, -2);
  return `${head},\n  "moves": [${lines === "" ? "" : `\n${lines}\n  `}],\n  "state": ${JSON.stringify(state)}\n}\n`;
}

/**
 * A game from JSON that `tenkaToJSON` wrote, or text that `encodeTenka` did.
 * Nothing in it is trusted: the game is dealt again from the seed and every
 * move is played through the rules, so what comes back is a game these rules
 * made. Null when the text is not JSON, is of a later format than this
 * version reads, is another game's, or holds a move that could not have been
 * made when it was.
 */
export function tenkaFromJSON(text: string): TenkaGame | null {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) return null;
  const { format, game, seed, players, rounds, placing, moves, map } = data as Record<string, unknown>;
  // What `encodeTenka` keeps has a `v` and no `format`: read by the reader it was written for.
  if (format === undefined) return decodeTenka(text);
  if (typeof format !== "number" || !Number.isInteger(format) || format < 1 || format > TENKA_EXPORT_FORMAT) return null;
  if (game !== undefined && game !== "tenka") return null;
  if (typeof seed !== "number" || typeof rounds !== "number") return null;
  if (placing !== "auto" && placing !== "hand") return null;
  if (!Array.isArray(players) || !players.every((name) => typeof name === "string")) return null;
  if (!Array.isArray(moves)) return null;
  const read = moves.map(readTenkaMove);
  if (read.some((move) => move === null)) return null;
  if (map !== undefined && !(typeof map === "string" && map in TENKA_MAPS)) return null;
  return replayTenka({ seed, players: players as string[], rounds, placing, map: (map as TenkaMapKey | undefined) ?? "world" }, read as TenkaMove[]);
}

/** One move of a game's record, with what came of it: what the text and the CSV are written from. */
export type TenkaRecordEntry = {
  /** The move's number, from 1. */
  n: number;
  /** The round it was made in. */
  round: number;
  /** The seat that made it. */
  seat: TenkaSeat;
  /** The move itself. */
  move: TenkaMove;
  /** The dice of an attack: the one throw, or the last of a blitz with the losses of all of them. */
  roll?: TenkaRoll;
  /** The set traded in, what it was worth, and the territory that got two more. */
  trade?: TenkaTrade;
  /** The two territories armies moved between: on the `shift` that carries out a fortifying move, and on the `occupy` that moves into a territory taken. */
  moved?: { from: number; to: number };
  /** The seat knocked out by this move. */
  out?: TenkaSeat;
  /** Whether the move ended the turn with a card drawn. */
  drew?: boolean;
  /** Whether the move ended the game, and who won. */
  winners?: readonly TenkaSeat[];
  /** Whether the game ended by the count of the last round (true) or by one player taking the world (false). */
  counted?: boolean;
};

/**
 * THE RECORD OF A GAME, move by move, with the dice and everything else each
 * move brought: made by playing the game again from its seed. A game whose
 * moves do not replay from its table (one put together by hand, in a test)
 * is recorded as far as they do.
 */
export function tenkaRecord(game: TenkaGame): TenkaRecordEntry[] {
  const entries: TenkaRecordEntry[] = [];
  let now = startTenka(game.rounds, game.players, game.seed, game.placing, game.map ?? "world");
  if (now === null) return entries;
  for (const move of game.moves) {
    const next = playTenka(now, move);
    if (next === null) break;
    const entry: TenkaRecordEntry = { n: entries.length + 1, round: now.round, seat: now.toPlay, move };
    if ((move.kind === TENKA_MOVES.attack || move.kind === TENKA_MOVES.blitz) && next.lastRoll !== null) {
      entry.roll = next.lastRoll;
      if (next.lastOut !== null && next.lastOut !== now.lastOut) entry.out = next.lastOut.seat;
    }
    if (move.kind === TENKA_MOVES.trade && next.lastTrade !== null) entry.trade = next.lastTrade;
    if (move.kind === TENKA_MOVES.shift && now.shifting !== null) entry.moved = now.shifting;
    if (move.kind === TENKA_MOVES.occupy && now.occupying !== null) entry.moved = { from: now.occupying.from, to: now.occupying.to };
    if ((move.kind === TENKA_MOVES.shift || move.kind === TENKA_MOVES.endTurn) && next.lastDraw !== null) entry.drew = true;
    if (next.phase === TENKA_PHASES.over) {
      entry.winners = next.winners;
      entry.counted = move.kind === TENKA_MOVES.shift || move.kind === TENKA_MOVES.endTurn;
    }
    entries.push(entry);
    now = next;
  }
  return entries;
}

function nameOf(game: TenkaGame, seat: TenkaSeat, strings: TenkaStrings): string {
  const given = game.players[seat]?.trim() ?? "";
  return given === "" ? tenkaSay(strings.player, { n: seat + 1 }) : given;
}

function landOf(territory: number, strings: TenkaStrings, map: TenkaMap = TENKA_MAPS.world): string {
  const data = map.territories[territory];
  return data === undefined ? String(territory) : territoryNameIn(strings, data.key) || data.name;
}

/** One entry of the record as a line of text. Null for a move that says nothing on its own: the choosing of a fortifying move, which the next move carries out. */
function entryText(game: TenkaGame, entry: TenkaRecordEntry, strings: TenkaStrings): string | null {
  const name = nameOf(game, entry.seat, strings);
  const { move } = entry;
  const parts: string[] = [];
  switch (move.kind) {
    case TENKA_MOVES.place:
      parts.push(tenkaSay(strings.logPlace, { name, n: move.armies, land: landOf(move.territory, strings, tenkaMapOf(game)) }));
      break;
    case TENKA_MOVES.trade:
      parts.push(tenkaSay(strings.logTrade, { name, n: entry.trade?.armies ?? 0 }));
      if (entry.trade !== undefined && entry.trade.bonusTerritory !== null) parts.push(tenkaSay(strings.logTradeBonus, { land: landOf(entry.trade.bonusTerritory, strings, tenkaMapOf(game)) }));
      break;
    case TENKA_MOVES.attack:
    case TENKA_MOVES.blitz: {
      const roll = entry.roll;
      const values = { name, from: landOf(move.from, strings, tenkaMapOf(game)), to: landOf(move.to, strings, tenkaMapOf(game)), a: roll?.attackDice.join(" ") ?? "", d: roll?.defendDice.join(" ") ?? "", al: roll?.attackerLost ?? 0, dl: roll?.defenderLost ?? 0, n: roll?.throws ?? 1 };
      // A blitz decided in one throw reads as the one throw it was, dice and all.
      parts.push(tenkaSay(move.kind === TENKA_MOVES.blitz && values.n > 1 ? strings.logBlitz : strings.logAttack, values));
      if (roll?.took === true) parts.push(tenkaSay(strings.logTook, { land: values.to }));
      if (entry.out !== undefined) parts.push(tenkaSay(strings.logOut, { name: nameOf(game, entry.out, strings) }));
      break;
    }
    case TENKA_MOVES.occupy:
      parts.push(tenkaSay(strings.logOccupy, { name, n: move.armies }));
      break;
    case TENKA_MOVES.endAttack:
      parts.push(tenkaSay(strings.logEndAttack, { name }));
      break;
    case TENKA_MOVES.fortify:
      return null;
    case TENKA_MOVES.shift:
      parts.push(tenkaSay(strings.logFortify, { name, n: move.armies, from: landOf(entry.moved?.from ?? -1, strings, tenkaMapOf(game)), to: landOf(entry.moved?.to ?? -1, strings, tenkaMapOf(game)) }));
      break;
    case TENKA_MOVES.endTurn:
      parts.push(tenkaSay(strings.logEndTurn, { name }));
      break;
  }
  if (entry.drew === true) parts.push(tenkaSay(strings.logCard, { name }));
  if (entry.winners !== undefined) {
    const names = entry.winners.map((seat) => nameOf(game, seat, strings));
    if (entry.counted === true) parts.push(tenkaSay(strings.logCounted, { n: entry.round, names: names.join(strings.and) }));
    else parts.push(tenkaSay(strings.wins, { name: names[0] ?? "" }));
  }
  return parts.join(strings.sentenceGap);
}

/**
 * A game as plain text, a line to a move, for a chat or a log: who placed
 * what where, every throw of the dice, every territory taken, and how it
 * ended. In English unless given another table of strings
 * (`TENKA_STRINGS.ja`). Lines end with a line feed.
 */
export function tenkaToText(game: TenkaGame, strings: TenkaStrings = TENKA_STRINGS.en): string {
  const lines = [tenkaSay(strings.logTitle, { players: game.players.map((_, seat) => nameOf(game, seat, strings)).join(strings.listComma), rounds: game.rounds, seed: game.seed })];
  let round = 0;
  for (const entry of tenkaRecord(game)) {
    if (entry.round !== round) {
      round = entry.round;
      lines.push(tenkaSay(strings.logRound, { n: round }));
    }
    const line = entryText(game, entry, strings);
    if (line !== null) lines.push(line);
  }
  return `${lines.join("\n")}\n`;
}

/** The columns of the CSV export, in order. */
export const TENKA_CSV_COLUMNS: readonly string[] = ["move", "round", "seat", "player", "kind", "from", "to", "armies", "dice", "attack", "defend", "attackerLost", "defenderLost", "throws", "took", "cards", "out", "winners"];

/** A cell as RFC 4180 has it, and safe to open: text a spreadsheet would run as a formula is given a leading apostrophe. */
function cell(value: string | number | undefined): string {
  if (value === undefined) return "";
  if (typeof value === "number") return String(value);
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/**
 * A game as CSV, a row to a move, for a spreadsheet: `TENKA_CSV_COLUMNS`.
 * Territories are written by key (`alaska`, `westernCanada`), seats from 1,
 * dice as they fell, highest first and spaced. Lines end CRLF, as RFC 4180
 * has them, and a player's name that a spreadsheet would run as a formula is
 * made safe with a leading apostrophe.
 */
export function tenkaToCSV(game: TenkaGame): string {
  const key = (territory: number | undefined) => (territory === undefined ? undefined : (tenkaMapOf(game).territories[territory]?.key ?? String(territory)));
  const rows = tenkaRecord(game).map((entry) => {
    const { move, roll } = entry;
    const from = "from" in move ? move.from : entry.moved?.from;
    const to = "to" in move ? move.to : move.kind === TENKA_MOVES.place ? move.territory : entry.moved?.to;
    const armies = "armies" in move ? move.armies : entry.trade?.armies;
    return [
      entry.n,
      entry.round,
      entry.seat + 1,
      game.players[entry.seat] ?? "",
      move.kind,
      key(from),
      key(to),
      armies,
      move.kind === TENKA_MOVES.attack ? move.dice : undefined,
      roll?.attackDice.join(" "),
      roll?.defendDice.join(" "),
      roll?.attackerLost,
      roll?.defenderLost,
      roll?.throws,
      roll === undefined ? undefined : roll.took ? "yes" : "no",
      move.kind === TENKA_MOVES.trade ? move.cards.join(" ") : undefined,
      entry.out === undefined ? undefined : entry.out + 1,
      entry.winners?.map((seat) => seat + 1).join(" "),
    ]
      .map(cell)
      .join(",");
  });
  return [TENKA_CSV_COLUMNS.join(","), ...rows].map((row) => `${row}\r\n`).join("");
}
