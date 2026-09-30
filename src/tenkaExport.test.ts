import { describe, expect, it } from "vitest";

import type { TenkaGame } from "./tenka.types.ts";
import { playTenka, tenkaOver } from "./tenka.ts";
import { nextRandom } from "./tenkaDice.ts";
import { TENKA_CSV_COLUMNS, TENKA_EXPORT_FORMAT, tenkaExported, tenkaFromJSON, tenkaRecord, tenkaToCSV, tenkaToJSON, tenkaToText } from "./tenkaExport.ts";
import { encodeTenka } from "./tenkaKeep.ts";
import { attacksOpen } from "./tenkaMoves.ts";
import { sensibleTenkaMove } from "./tenkaPolicy.ts";
import { startTenka } from "./tenkaStart.ts";
import { TENKA_STRINGS } from "./strings.ts";
import { TENKA_VERSION } from "./version.ts";

/** A random that gives the same numbers every time, so a computer's game is the same game. */
function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    const drawn = nextRandom(state);
    state = drawn.state;
    return drawn.value;
  };
}

/** A whole game between computer players, or its first `most` moves. */
function played(rounds: number, players: string[], seed: number, most = Infinity, placing: "auto" | "hand" = "auto"): TenkaGame {
  const random = seeded(seed);
  let game = startTenka(rounds, players, seed, placing)!;
  while (!tenkaOver(game) && game.moves.length < most) game = playTenka(game, sensibleTenkaMove(game, random))!;
  return game;
}

describe("a game as JSON", () => {
  it("is the format's number, the table and the moves, and reads back as the same game", () => {
    for (const game of [played(10, ["Ann", "Ben", "Cho"], 2026), played(20, ["Ann", "Ben"], 7, 40), played(10, ["a", "b", "c", "d", "e", "f"], 99, 30, "hand"), startTenka(60, ["Ann", "Ben"], 1)!]) {
      const text = tenkaToJSON(game);
      const data = JSON.parse(text);
      expect(data.format).toBe(TENKA_EXPORT_FORMAT);
      expect(data.game).toBe("tenka");
      expect(data.generator).toBe(`tenka ${TENKA_VERSION}`);
      expect(Object.keys(data)).toEqual(["format", "game", "generator", "seed", "players", "rounds", "placing", "moves", "state"]);
      expect(data).toEqual(tenkaExported(game));
      expect(text.endsWith("}\n")).toBe(true);
      expect(tenkaFromJSON(text)).toEqual(game);
    }
  });

  it("a finished game says who won, and reads back finished", () => {
    const game = played(10, ["Ann", "Ben", "Cho"], 2026);
    expect(tenkaOver(game)).toBe(true);
    expect(JSON.parse(tenkaToJSON(game)).state).toEqual({ round: game.round, phase: "over", toPlay: game.toPlay, winners: game.winners });
    expect(tenkaFromJSON(tenkaToJSON(game))!.winners).toEqual(game.winners);
  });

  it("reads what encodeTenka keeps as well", () => {
    const game = played(20, ["Ann", "Ben", "Cho"], 5, 25);
    expect(tenkaFromJSON(encodeTenka(game))).toEqual(game);
  });

  it("trusts nothing: the state written is never read, and a move that could not be made refuses the whole", () => {
    const game = played(20, ["Ann", "Ben", "Cho"], 5, 25);
    const data = JSON.parse(tenkaToJSON(game));
    // A state that lies changes nothing: the moves say where the game stands.
    expect(tenkaFromJSON(JSON.stringify({ ...data, state: { round: 9, phase: "over", toPlay: 2, winners: [2] } }))).toEqual(game);
    // A move nobody could have made.
    expect(tenkaFromJSON(JSON.stringify({ ...data, moves: [...data.moves, ["a", 0, 41, 3]] }))).toBeNull();
    expect(tenkaFromJSON(JSON.stringify({ ...data, moves: [["o", 99]] }))).toBeNull();
    expect(tenkaFromJSON(JSON.stringify({ ...data, moves: [["z"]] }))).toBeNull();
    expect(tenkaFromJSON(JSON.stringify({ ...data, moves: "none" }))).toBeNull();
  });

  it("refuses what is not a game of Tenka", () => {
    const data = JSON.parse(tenkaToJSON(startTenka(10, ["Ann", "Ben"], 3)!));
    expect(tenkaFromJSON("")).toBeNull();
    expect(tenkaFromJSON("not json")).toBeNull();
    expect(tenkaFromJSON("null")).toBeNull();
    expect(tenkaFromJSON("[]")).toBeNull();
    expect(tenkaFromJSON("{}")).toBeNull();
    expect(tenkaFromJSON(JSON.stringify({ ...data, format: TENKA_EXPORT_FORMAT + 1 }))).toBeNull();
    expect(tenkaFromJSON(JSON.stringify({ ...data, format: "1" }))).toBeNull();
    expect(tenkaFromJSON(JSON.stringify({ ...data, format: 0 }))).toBeNull();
    expect(tenkaFromJSON(JSON.stringify({ ...data, game: "chess" }))).toBeNull();
    expect(tenkaFromJSON(JSON.stringify({ ...data, seed: "3" }))).toBeNull();
    expect(tenkaFromJSON(JSON.stringify({ ...data, seed: -1 }))).toBeNull();
    expect(tenkaFromJSON(JSON.stringify({ ...data, rounds: 11 }))).toBeNull();
    expect(tenkaFromJSON(JSON.stringify({ ...data, players: ["only one"] }))).toBeNull();
    expect(tenkaFromJSON(JSON.stringify({ ...data, players: [1, 2] }))).toBeNull();
    expect(tenkaFromJSON(JSON.stringify({ ...data, placing: "anyhow" }))).toBeNull();
  });

  it("a name too long or untidy is tidied by the rules, as at the table", () => {
    const data = JSON.parse(tenkaToJSON(startTenka(10, ["Ann", "Ben"], 3)!));
    const read = tenkaFromJSON(JSON.stringify({ ...data, players: ["  Ann   of the very long name indeed  ", "Ben"] }))!;
    expect(read.players).toEqual(["Ann of the very long", "Ben"]);
  });
});

describe("the record of a game", () => {
  it("has an entry for every move, with the dice of every attack", () => {
    const game = played(10, ["Ann", "Ben", "Cho"], 2026);
    const record = tenkaRecord(game);
    expect(record.length).toBe(game.moves.length);
    expect(record.map((entry) => entry.n)).toEqual(game.moves.map((_, at) => at + 1));
    for (const entry of record) {
      const attacking = entry.move.kind === "attack" || entry.move.kind === "blitz";
      expect(entry.roll !== undefined).toBe(attacking);
      if (entry.roll !== undefined) expect(entry.roll.attackDice.length).toBeGreaterThan(0);
      if (entry.move.kind === "shift") expect(entry.moved).toBeDefined();
      if (entry.move.kind === "trade") expect(entry.trade!.armies).toBeGreaterThanOrEqual(4);
    }
    expect(record.at(-1)!.winners).toEqual(game.winners);
    expect(record.filter((entry) => entry.winners !== undefined).length).toBe(1);
  });

  it("a game taken to the last player standing ends on an attack, not a count", () => {
    const game = played(60, ["Ann", "Ben"], 11);
    const last = tenkaRecord(game).at(-1)!;
    expect(last.winners).toEqual(game.winners);
    if (game.out.filter((isOut) => !isOut).length === 1) {
      expect(last.counted).toBe(false);
      expect(last.roll!.took).toBe(true);
      expect(last.out).toBeDefined();
    }
  });
});

describe("a game as text", () => {
  const game = played(10, ["Ann", "Ben", "Cho"], 2026);

  it("opens with the table, then a line to a move under each round", () => {
    const lines = tenkaToText(game).split("\n");
    expect(lines[0]).toBe("Tenka: Ann, Ben, Cho; 10 rounds; seed 2026");
    expect(lines[1]).toBe("Round 1");
    expect(lines.filter((line) => /^Round \d+$/.test(line)).length).toBe(10);
    expect(lines.at(-1)).toBe("");
    expect(lines.at(-2)).toMatch(/The game is counted after round 10\. Winner: |takes the world\.$/);
    expect(tenkaToText(game)).toMatch(/attacks .+ until it is decided, \d+ throws?: attacker lost \d+, defender lost \d+\./);
    expect(tenkaToText(game)).toMatch(/ places \d+ on /);
    expect(tenkaToText(game)).not.toMatch(/\{\w+\}/);
  });

  it("is the same text every time, and Japanese when asked", () => {
    expect(tenkaToText(game)).toBe(tenkaToText(tenkaFromJSON(tenkaToJSON(game))!));
    const ja = tenkaToText(game, TENKA_STRINGS.ja).split("\n");
    expect(ja[0]).toBe("天下: Ann、Ben、Cho、10ラウンド、シード 2026");
    expect(ja[1]).toBe("第1ラウンド");
    expect(ja.length).toBe(tenkaToText(game).split("\n").length);
    expect(ja.join("\n")).not.toMatch(/\{\w+\}/);
  });

  it("a single throw shows the dice of both sides", () => {
    let one = startTenka(60, ["Ann", "Ben", "Cho"], 4)!;
    const random = seeded(4);
    let attack = attacksOpen(one).find((move) => move.kind === "attack" && move.dice === 3);
    while (attack === undefined) {
      one = playTenka(one, one.phase === "attack" ? { kind: "endAttack" } : sensibleTenkaMove(one, random))!;
      attack = attacksOpen(one).find((move) => move.kind === "attack" && move.dice === 3);
    }
    const thrown = playTenka(one, attack)!;
    expect(tenkaToText(thrown).trimEnd().split("\n").at(-1)).toMatch(/^\w+: .+ attacks .+, \[[1-6] [1-6] [1-6]\] against \[[1-6]( [1-6])?\]: attacker lost [0-2], defender lost [0-2]\.( .+ is taken\.)?$/);
    expect(tenkaToText(thrown, TENKA_STRINGS.ja).trimEnd().split("\n").at(-1)).toMatch(/を攻撃、\[[1-6] [1-6] [1-6]\] 対 \[/);
  });

  it("names nobody gave are Player 1, Player 2", () => {
    expect(tenkaToText(startTenka(10, ["", ""], 3)!)).toBe("Tenka: Player 1, Player 2; 10 rounds; seed 3\n");
    expect(tenkaToText(startTenka(10, ["", ""], 3)!, TENKA_STRINGS.ja)).toBe("天下: プレイヤー1、プレイヤー2、10ラウンド、シード 3\n");
  });
});

describe("a game as CSV", () => {
  const game = played(10, ["Ann", "=1+1", 'Cho, "the" Bold'], 2026);
  const rows = tenkaToCSV(game).split("\r\n");

  it("is a heading and a row to a move, ended CRLF", () => {
    expect(rows[0]).toBe(TENKA_CSV_COLUMNS.join(","));
    expect(rows.at(-1)).toBe("");
    expect(rows.length).toBe(game.moves.length + 2);
    expect(tenkaToCSV(startTenka(10, ["Ann", "Ben"], 3)!)).toBe(`${TENKA_CSV_COLUMNS.join(",")}\r\n`);
  });

  it("quotes what needs it, and makes a name a spreadsheet would run safe", () => {
    const text = tenkaToCSV(game);
    expect(text).toContain(",'=1+1,");
    expect(text).toContain(',"Cho, ""the"" Bold",');
    expect(text).not.toMatch(/,=1\+1,/);
  });

  it("writes territories by key and an attack's dice as they fell", () => {
    const attack = rows.find((row) => row.includes(",blitz,"))!;
    const cells = attack.match(/("([^"]|"")*"|[^,]*)(,|$)/g)!.map((part) => part.replace(/,$/, ""));
    expect(cells[TENKA_CSV_COLUMNS.indexOf("from")]).toMatch(/^[a-zA-Z]+$/);
    expect(cells[TENKA_CSV_COLUMNS.indexOf("attack")]).toMatch(/^[1-6]( [1-6]){0,2}$/);
    expect(cells[TENKA_CSV_COLUMNS.indexOf("took")]).toMatch(/^(yes|no)$/);
  });
});
