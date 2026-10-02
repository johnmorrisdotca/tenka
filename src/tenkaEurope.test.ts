import { describe, expect, it } from "vitest";

import { TENKA_PHASES, TENKA_WORLD_ROUNDS } from "./tenka.constants.ts";
import type { TenkaGame } from "./tenka.types.ts";
import { playTenka } from "./tenka.ts";
import { isWild, tenkaDeckFor } from "./tenkaCards.ts";
import { decodeTenka, encodeTenka } from "./tenkaKeep.ts";
import { tenkaFromJSON, tenkaToJSON } from "./tenkaExport.ts";
import { TENKA_MAPS, TENKA_MAP_LIST, areNeighbours, tenkaMapOf } from "./tenkaMap.ts";
import { sensibleTenkaMove } from "./tenkaPolicy.ts";
import { startTenka } from "./tenkaStart.ts";
import { TENKA_STRINGS, continentNameIn, territoryNameIn } from "./strings.ts";
import { TENKA_EUROPE_SHAPES } from "./tenkaEuropeShapes.data.ts";
import { nextRandom } from "./tenkaDice.ts";

/** A seeded stream of numbers from 0 up to 1, for the computer's choices: the game's own generator. */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    const next = nextRandom(state);
    state = next.state;
    return next.value;
  };
}

/**
 * TENKA'S EUROPE: a second map, thirty-seven territories in eleven regions,
 * played by the same rules as the world. A game says which map it is on, and a
 * game on the world, which says nothing, is kept and read exactly as before.
 */
const EUROPE = TENKA_MAPS.europe;
const at = (key: string) => EUROPE.territories.findIndex((territory) => territory.key === key);

describe("Tenka's Europe", () => {
  it("has thirty-seven territories, each named once, in eleven regions, every one in a region", () => {
    expect(EUROPE.territories).toHaveLength(37);
    expect(new Set(EUROPE.territories.map((territory) => territory.key)).size).toBe(37);
    expect(EUROPE.continents).toHaveLength(11);
    expect(EUROPE.continents.flatMap((region) => region.territories).sort((a, b) => a - b)).toEqual(EUROPE.territories.map((_, territory) => territory));
    expect(TENKA_MAP_LIST).toEqual(["world", "europe"]);
  });

  it("reaches every territory from every other, and sees every border from both sides", () => {
    const seen = new Set([0]);
    const queue = [0];
    while (queue.length > 0) {
      for (const next of EUROPE.neighbours[queue.shift()!]!) {
        if (seen.has(next)) continue;
        seen.add(next);
        queue.push(next);
      }
    }
    expect(seen.size).toBe(37);
    EUROPE.neighbours.forEach((list, territory) => {
      expect(list).not.toContain(territory);
      for (const other of list) expect(EUROPE.neighbours[other], `${EUROPE.territories[territory]!.key}–${EUROPE.territories[other]!.key}`).toContain(territory);
    });
  });

  it("borders the way Europe does, with the crossings of its seas", () => {
    expect(areNeighbours(at("westernFrance"), at("easternSpain"), EUROPE)).toBe(true);
    expect(areNeighbours(at("poland"), at("easternGermany"), EUROPE)).toBe(true);
    expect(areNeighbours(at("ireland"), at("greatBritain"), EUROPE)).toBe(true);
    expect(areNeighbours(at("westernSpain"), at("morocco"), EUROPE)).toBe(true);
    expect(areNeighbours(at("italy"), at("tunisia"), EUROPE)).toBe(true);
    expect(areNeighbours(at("portugal"), at("italy"), EUROPE)).toBe(false);
    expect(areNeighbours(at("iceland"), at("finland"), EUROPE)).toBe(false);
  });

  it("names every territory and region in English and Japanese, the English the map's own", () => {
    for (const territory of EUROPE.territories) {
      expect(territoryNameIn(TENKA_STRINGS.en, territory.key), territory.key).toBe(territory.name);
      expect(territoryNameIn(TENKA_STRINGS.ja, territory.key), territory.key).not.toBe("");
    }
    for (const region of EUROPE.continents) {
      expect(continentNameIn(TENKA_STRINGS.en, region.key), region.key).toBe(region.name);
      expect(continentNameIn(TENKA_STRINGS.ja, region.key), region.key).not.toBe("");
    }
  });

  it("draws every territory, with a counter inside the map, in well under 150 KB", () => {
    expect(TENKA_EUROPE_SHAPES.outlines).toHaveLength(37);
    for (const [x, y] of TENKA_EUROPE_SHAPES.labels) {
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(TENKA_EUROPE_SHAPES.width);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(TENKA_EUROPE_SHAPES.height);
    }
    expect(JSON.stringify(TENKA_EUROPE_SHAPES).length).toBeLessThan(150_000);
  });
});

describe("a game on Europe", () => {
  const players = ["A", "B", "C", "D"];

  it("is dealt Europe's territories and a card for each, and says it is on Europe", () => {
    const game = startTenka(TENKA_WORLD_ROUNDS, players, 7, "auto", "europe")!;
    expect(game.map).toBe("europe");
    expect(game.owners).toHaveLength(37);
    expect(game.deck).toHaveLength(37 + 2);
    expect(tenkaDeckFor(EUROPE).filter((card) => isWild(card, EUROPE))).toEqual([37, 38]);
    expect(tenkaMapOf(game)).toBe(EUROPE);
  });

  it("is played to its end by the computer at every table, two, three and six", () => {
    for (const count of [2, 3, 6]) {
      for (const seed of [1, 2, 3]) {
        let game: TenkaGame = startTenka(10, players.slice(0, count).concat(["E", "F"]).slice(0, count), seed, "auto", "europe")!;
        const random = seededRandom(seed);
        for (let step = 0; step < 20_000 && game.phase !== TENKA_PHASES.over; step += 1) {
          const next = playTenka(game, sensibleTenkaMove(game, random));
          expect(next, `${count} players, seed ${seed}, step ${step}`).not.toBeNull();
          game = next!;
        }
        expect(game.phase, `${count} players, seed ${seed}`).toBe(TENKA_PHASES.over);
        expect(game.winners.length).toBeGreaterThan(0);
      }
    }
  });

  it("is kept and read back on Europe, and a world game is kept exactly as before", () => {
    const europe = startTenka(TENKA_WORLD_ROUNDS, players, 11, "auto", "europe")!;
    expect(JSON.parse(encodeTenka(europe)).map).toBe("europe");
    expect(decodeTenka(encodeTenka(europe))).toEqual(europe);
    expect(tenkaFromJSON(tenkaToJSON(europe))).toEqual(europe);
    const world = startTenka(TENKA_WORLD_ROUNDS, players, 11)!;
    expect("map" in world).toBe(false);
    expect("map" in JSON.parse(encodeTenka(world))).toBe(false);
    expect(decodeTenka(encodeTenka(world))).toEqual(world);
    expect(decodeTenka(encodeTenka(europe).replace('"europe"', '"atlantis"'))).toBeNull();
  });

  it("still reads a Europe game kept before 2.0.0, when only the world changed, and refuses a world game kept then", () => {
    const europe = startTenka(TENKA_WORLD_ROUNDS, players, 11, "auto", "europe")!;
    const world = startTenka(TENKA_WORLD_ROUNDS, players, 11)!;
    expect(decodeTenka(encodeTenka(europe).replace('"v":2', '"v":1'))).toEqual(europe);
    expect(decodeTenka(encodeTenka(world).replace('"v":2', '"v":1'))).toBeNull();
    const old = (game: TenkaGame) => tenkaToJSON(game).replace('"format": 2', '"format": 1');
    expect(tenkaFromJSON(old(europe))).toEqual(europe);
    expect(tenkaFromJSON(old(world))).toBeNull();
  });
});
