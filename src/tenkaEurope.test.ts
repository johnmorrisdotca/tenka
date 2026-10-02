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
import { EUROPE_LAND_EDGES, EUROPE_SEA_EDGES, EUROPE_TERRITORY_LIST } from "../scripts/europe-edges.mjs";
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
 * TENKA'S EUROPE IS THE CLASSIC EUROPE BOARD'S, as a graph: the same forty-nine
 * named areas, the same borders between them on land and the same dashed
 * routes across the water (John, 2026-10-02: "why would I want a Risk clone
 * that is different?"). The pairs below are written out again here by
 * territory NAME, apart from the list the map script is held to
 * (`scripts/europe-edges.mjs`, by key), so that a slip in one is caught by the
 * other. Only geography: no artwork, wording or name of any published game.
 * The eleven regions are Tenka's own: the board has none.
 */
const EUROPE = TENKA_MAPS.europe;
const at = (key: string) => EUROPE.territories.findIndex((territory) => territory.key === key);

/** Every neighbour of each territory in the graph, by name, on land and across the water together. */
const NEIGHBOURS: Record<string, string[]> = {
  Scotland: ["England", "Norway", "Ireland"],
  England: ["Scotland", "Wales", "Normandy", "Lorraine"],
  Wales: ["England", "Ireland"],
  Ireland: ["Scotland", "Wales", "Brittany"],
  Norway: ["Sweden", "Scotland", "Denmark"],
  Sweden: ["Norway", "Finland", "Denmark"],
  Finland: ["Sweden", "Estonia", "Republic of Novgorod"],
  Denmark: ["Friesland", "Saxony", "Pomerania", "Poland", "Bohemia", "Norway", "Sweden"],
  Portugal: ["León-Castile"],
  "León-Castile": ["Portugal", "Navarre", "Valencia", "Granada", "Brittany", "Morocco"],
  Navarre: ["León-Castile", "Barcelona", "Valencia", "France"],
  Barcelona: ["Navarre", "Valencia", "France", "Burgundy"],
  Valencia: ["León-Castile", "Navarre", "Barcelona", "Granada", "Algeria"],
  Granada: ["León-Castile", "Valencia"],
  Morocco: ["Algeria", "León-Castile"],
  Algeria: ["Morocco", "Tunisia", "Valencia"],
  Tunisia: ["Algeria", "Sardinia", "Greece"],
  Normandy: ["Brittany", "France", "England"],
  Brittany: ["Normandy", "France", "Ireland", "León-Castile"],
  France: ["Normandy", "Brittany", "Burgundy", "Lorraine", "Navarre", "Barcelona"],
  Burgundy: ["France", "Lorraine", "Swabia", "Lombardy", "Barcelona"],
  Friesland: ["Denmark", "Saxony", "Lorraine"],
  Saxony: ["Denmark", "Friesland", "Lorraine", "Franconia", "Bohemia"],
  Lorraine: ["France", "Burgundy", "Friesland", "Saxony", "Franconia", "Swabia", "England"],
  Franconia: ["Saxony", "Lorraine", "Swabia", "Bavaria", "Bohemia"],
  Swabia: ["Burgundy", "Lorraine", "Franconia", "Bavaria", "Lombardy"],
  Bavaria: ["Franconia", "Swabia", "Bohemia", "Highlands", "Hungary", "Venice", "Lombardy"],
  Bohemia: ["Denmark", "Saxony", "Franconia", "Bavaria", "Highlands", "Poland"],
  Highlands: ["Bavaria", "Bohemia", "Poland", "Hungary"],
  Hungary: ["Bavaria", "Highlands", "Poland", "Galicia", "Venice", "Serbia", "Bulgaria"],
  Lombardy: ["Burgundy", "Swabia", "Bavaria", "Rome"],
  Rome: ["Lombardy", "Kingdom of Sicily", "Sardinia"],
  "Kingdom of Sicily": ["Rome", "Venice"],
  Sardinia: ["Rome", "Tunisia"],
  Venice: ["Bavaria", "Hungary", "Serbia", "Kingdom of Sicily"],
  Serbia: ["Hungary", "Venice", "Greece", "Bulgaria"],
  Greece: ["Serbia", "Bulgaria", "Turkey", "Tunisia"],
  Bulgaria: ["Hungary", "Galicia", "Serbia", "Greece", "Turkey"],
  Turkey: ["Greece", "Bulgaria"],
  Pomerania: ["Denmark", "Prussia", "Poland", "Lithuania"],
  Prussia: ["Pomerania", "Poland", "Polotsk", "Lithuania"],
  Poland: ["Denmark", "Bohemia", "Highlands", "Hungary", "Galicia", "Rusland", "Polotsk", "Prussia", "Pomerania"],
  Lithuania: ["Prussia", "Polotsk", "Estonia", "Smolensk", "Pomerania"],
  Estonia: ["Lithuania", "Smolensk", "Republic of Novgorod", "Finland"],
  "Republic of Novgorod": ["Estonia", "Smolensk", "Finland"],
  Smolensk: ["Lithuania", "Estonia", "Republic of Novgorod", "Polotsk", "Rusland"],
  Polotsk: ["Prussia", "Lithuania", "Poland", "Smolensk", "Rusland"],
  Rusland: ["Poland", "Polotsk", "Smolensk", "Galicia"],
  Galicia: ["Hungary", "Bulgaria", "Poland", "Rusland"],
};

/** The routes across the water, by name: the nineteen of the neighbours above that do not share a border. */
const ACROSS_THE_WATER: [string, string][] = [
  ["Scotland", "Norway"],
  ["Scotland", "Ireland"],
  ["Ireland", "Wales"],
  ["Ireland", "Brittany"],
  ["England", "Normandy"],
  ["England", "Lorraine"],
  ["Norway", "Denmark"],
  ["Denmark", "Sweden"],
  ["Pomerania", "Lithuania"],
  ["Finland", "Estonia"],
  ["Finland", "Republic of Novgorod"],
  ["Brittany", "León-Castile"],
  ["León-Castile", "Morocco"],
  ["Valencia", "Algeria"],
  ["Barcelona", "Burgundy"],
  ["Sardinia", "Rome"],
  ["Sardinia", "Tunisia"],
  ["Venice", "Kingdom of Sicily"],
  ["Tunisia", "Greece"],
];

/** The regions, each with how many territories are in it, how many other territories touch it, and what holding it is worth. */
const REGIONS: Record<string, { name: string; territories: number; waysIn: number; bonus: number }> = {
  britishIsles: { name: "Britain and Ireland", territories: 4, waysIn: 4, bonus: 2 },
  scandinavia: { name: "The Nordic Countries", territories: 4, waysIn: 8, bonus: 3 },
  iberia: { name: "Iberia", territories: 6, waysIn: 5, bonus: 3 },
  maghreb: { name: "The Maghreb", territories: 3, waysIn: 4, bonus: 2 },
  france: { name: "France", territories: 4, waysIn: 8, bonus: 3 },
  germany: { name: "Germany and the Low Countries", territories: 5, waysIn: 7, bonus: 4 },
  centralEurope: { name: "Central Europe", territories: 4, waysIn: 10, bonus: 3 },
  italy: { name: "Italy", territories: 4, waysIn: 5, bonus: 2 },
  balkans: { name: "The Balkans and Turkey", territories: 5, waysIn: 5, bonus: 3 },
  baltic: { name: "Poland and the Baltic", territories: 5, waysIn: 10, bonus: 4 },
  easternEurope: { name: "Eastern Europe", territories: 5, waysIn: 7, bonus: 4 },
};

const nameAt = (territory: number) => EUROPE.territories[territory]!.name;

describe("Tenka's Europe", () => {
  it("has forty-nine territories, each named once, in eleven regions, every one in a region", () => {
    expect(EUROPE.territories).toHaveLength(49);
    expect(new Set(EUROPE.territories.map((territory) => territory.key)).size).toBe(49);
    expect(new Set(EUROPE.territories.map((territory) => territory.name)).size).toBe(49);
    expect(Object.keys(NEIGHBOURS).sort()).toEqual(EUROPE.territories.map((territory) => territory.name).sort());
    expect(EUROPE.continents).toHaveLength(11);
    expect(EUROPE.continents.flatMap((region) => region.territories).sort((a, b) => a - b)).toEqual(EUROPE.territories.map((_, territory) => territory));
    expect(TENKA_MAP_LIST).toEqual(["world", "europe"]);
  });

  it("has the board's graph exactly: every territory touches just the territories it should, by land or across the water", () => {
    for (const [name, neighbours] of Object.entries(NEIGHBOURS)) {
      const territory = EUROPE.territories.findIndex((one) => one.name === name);
      expect(EUROPE.neighbours[territory]!.map(nameAt).sort(), name).toEqual([...neighbours].sort());
    }
  });

  it("has eighty-two borders on land and nineteen routes across the water, the routes being the neighbours that share no border", () => {
    const pairs = (key: "land" | "sea") => EUROPE.territories.reduce((sum, territory) => sum + territory[key].length, 0) / 2;
    expect(pairs("land")).toBe(82);
    expect(pairs("sea")).toBe(19);
    expect(ACROSS_THE_WATER).toHaveLength(19);
    const water = EUROPE.territories.flatMap((territory, one) => territory.sea.filter((other) => other > one).map((other) => [territory.name, nameAt(other)].sort().join(" / ")));
    expect(water.sort()).toEqual(ACROSS_THE_WATER.map((pair) => [...pair].sort().join(" / ")).sort());
  });

  it("is the list the map script is held to, key for key", () => {
    const keys = EUROPE_TERRITORY_LIST.map((territory) => territory.key);
    expect(EUROPE.territories.map((territory) => territory.key)).toEqual(keys);
    expect(EUROPE.territories.map((territory) => territory.name)).toEqual(EUROPE_TERRITORY_LIST.map((territory) => territory.name));
    const named = (kind: "land" | "sea") => EUROPE.territories.flatMap((territory, one) => territory[kind].filter((other) => other > one).map((other) => [territory.key, EUROPE.territories[other]!.key].sort().join("|")));
    expect(named("land").sort()).toEqual(EUROPE_LAND_EDGES.map((pair) => [...pair].sort().join("|")).sort());
    expect(named("sea").sort()).toEqual(EUROPE_SEA_EDGES.map((pair) => [...pair].sort().join("|")).sort());
  });

  it("reaches every territory from every other, and sees every border from both sides, no territory beside itself, none twice", () => {
    const reach = (start: number) => {
      const seen = new Set([start]);
      const queue = [start];
      while (queue.length > 0) {
        for (const next of EUROPE.neighbours[queue.shift()!]!) {
          if (seen.has(next)) continue;
          seen.add(next);
          queue.push(next);
        }
      }
      return seen.size;
    };
    EUROPE.neighbours.forEach((list, territory) => {
      expect(reach(territory), nameAt(territory)).toBe(49);
      expect(list).not.toContain(territory);
      expect(new Set(list).size).toBe(list.length);
      expect(list.length, `${nameAt(territory)} has no neighbour`).toBeGreaterThan(0);
      for (const other of list) expect(EUROPE.neighbours[other], `${nameAt(territory)}–${nameAt(other)}`).toContain(territory);
    });
  });

  it("borders the way Europe does", () => {
    expect(areNeighbours(at("france"), at("navarre"), EUROPE)).toBe(true);
    expect(areNeighbours(at("poland"), at("denmark"), EUROPE)).toBe(true);
    expect(areNeighbours(at("ireland"), at("wales"), EUROPE)).toBe(true);
    expect(areNeighbours(at("leonCastile"), at("morocco"), EUROPE)).toBe(true);
    expect(areNeighbours(at("tunisia"), at("greece"), EUROPE)).toBe(true);
    expect(areNeighbours(at("portugal"), at("rome"), EUROPE)).toBe(false);
    expect(areNeighbours(at("norway"), at("finland"), EUROPE)).toBe(false);
    expect(areNeighbours(at("lombardy"), at("venice"), EUROPE)).toBe(false);
  });

  it("makes eleven regions of Tenka's own, each worth what its size and the ways into it say", () => {
    for (const region of EUROPE.continents) {
      const expected = REGIONS[region.key];
      expect(expected, region.key).toBeDefined();
      expect(region.name).toBe(expected!.name);
      expect(region.territories, region.key).toHaveLength(expected!.territories);
      const inside = new Set(region.territories);
      const waysIn = new Set(region.territories.flatMap((territory) => EUROPE.neighbours[territory]!.filter((other) => !inside.has(other))));
      expect(waysIn.size, `${region.key}'s ways in`).toBe(expected!.waysIn);
      expect(region.bonus, region.key).toBe(expected!.bonus);
    }
  });

  it("names every territory and region in English and Japanese, the English the map's own, no Japanese name twice", () => {
    for (const territory of EUROPE.territories) {
      expect(territoryNameIn(TENKA_STRINGS.en, territory.key), territory.key).toBe(territory.name);
      expect(territoryNameIn(TENKA_STRINGS.ja, territory.key), territory.key).not.toBe("");
    }
    for (const region of EUROPE.continents) {
      expect(continentNameIn(TENKA_STRINGS.en, region.key), region.key).toBe(region.name);
      expect(continentNameIn(TENKA_STRINGS.ja, region.key), region.key).not.toBe("");
    }
    expect(new Set(EUROPE.territories.map((territory) => territoryNameIn(TENKA_STRINGS.ja, territory.key))).size).toBe(49);
  });

  it("draws every territory, with a counter inside the map, in well under 150 KB", () => {
    expect(TENKA_EUROPE_SHAPES.outlines).toHaveLength(49);
    expect(TENKA_EUROPE_SHAPES.labels).toHaveLength(49);
    expect(TENKA_EUROPE_SHAPES.boxes).toHaveLength(49);
    for (const [x, y] of TENKA_EUROPE_SHAPES.labels) {
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(TENKA_EUROPE_SHAPES.width);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(TENKA_EUROPE_SHAPES.height);
    }
    expect(JSON.stringify(TENKA_EUROPE_SHAPES).length).toBeLessThan(150_000);
  });

  it("draws every route across the water as a line long enough to read as a crossing, from one territory's coast to the other's", () => {
    expect(TENKA_EUROPE_SHAPES.seaLines).toHaveLength(19);
    expect(TENKA_EUROPE_SHAPES.wraps).toHaveLength(0);
    for (const [x1, y1, x2, y2] of TENKA_EUROPE_SHAPES.seaLines) expect(Math.hypot(x2 - x1, y2 - y1)).toBeGreaterThanOrEqual(62);
    const near = ([x, y]: number[], [left, top, right, bottom]: readonly number[], slack: number) => x >= left - slack && x <= right + slack && y >= top - slack && y <= bottom + slack;
    for (const [a, b] of ACROSS_THE_WATER) {
      const [boxA, boxB] = [TENKA_EUROPE_SHAPES.boxes[at(EUROPE.territories.find((t) => t.name === a)!.key)]!, TENKA_EUROPE_SHAPES.boxes[at(EUROPE.territories.find((t) => t.name === b)!.key)]!];
      const joined = TENKA_EUROPE_SHAPES.seaLines.some(([x1, y1, x2, y2]) => (near([x1, y1], boxA, 40) && near([x2, y2], boxB, 40)) || (near([x1, y1], boxB, 40) && near([x2, y2], boxA, 40)));
      expect(joined, `${a} – ${b}`).toBe(true);
    }
  });
});

describe("a game on Europe", () => {
  const players = ["A", "B", "C", "D"];

  it("is dealt Europe's territories and a card for each, and says it is on Europe", () => {
    const game = startTenka(TENKA_WORLD_ROUNDS, players, 7, "auto", "europe")!;
    expect(game.map).toBe("europe");
    expect(game.owners).toHaveLength(49);
    expect(game.deck).toHaveLength(49 + 2);
    expect(tenkaDeckFor(EUROPE).filter((card) => isWild(card, EUROPE))).toEqual([49, 50]);
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

  it("is kept and read back on Europe, and a world game is kept as before apart from its version", () => {
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

  it("refuses a Europe game kept before the map was the board's, whose moves mean other territories now, and still reads a world game kept then", () => {
    const europe = startTenka(TENKA_WORLD_ROUNDS, players, 11, "auto", "europe")!;
    const world = startTenka(TENKA_WORLD_ROUNDS, players, 11)!;
    // What 1.3.0 wrote: the kept text at version 1, the JSON at format 1.
    const keptAtOne = (game: TenkaGame) => encodeTenka(game).replace('"v":2', '"v":1');
    expect(JSON.parse(keptAtOne(europe)).v).toBe(1);
    expect(decodeTenka(keptAtOne(europe))).toBeNull();
    expect(decodeTenka(keptAtOne(world))).toEqual(world);
    const exportedAtOne = (game: TenkaGame) => JSON.stringify({ ...JSON.parse(tenkaToJSON(game)), format: 1 });
    expect(tenkaFromJSON(exportedAtOne(europe))).toBeNull();
    expect(tenkaFromJSON(exportedAtOne(world))).toEqual(world);
    // A game kept at version 3, which this version cannot read, is refused for both.
    expect(decodeTenka(encodeTenka(europe).replace('"v":2', '"v":3'))).toBeNull();
  });
});
