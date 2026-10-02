import { describe, expect, it } from "vitest";

import { CLASSIC_EDGES } from "../scripts/classic-edges.mjs";
import { TENKA_PHASES } from "./tenka.constants.ts";
import { playTenka } from "./tenka.ts";
import { nextRandom } from "./tenkaDice.ts";
import { TENKA_DECK, cardTerritory, isWild } from "./tenkaCards.ts";
import { TENKA_CONTINENTS, TENKA_MAPS, TENKA_TERRITORIES } from "./tenkaMap.ts";
import { sensibleTenkaMove } from "./tenkaPolicy.ts";
import { startTenka } from "./tenkaStart.ts";

/**
 * THE WORLD IS THE CLASSIC BOARD'S WORLD, as a graph: the same forty-two
 * territories, the same eighty-three pairs that touch or are joined across the
 * water, the same six continents worth the same armies (John, 2026-10-02: "I
 * only want equal to the original"). The list of pairs below is written out
 * again here by territory NAME, apart from the one the map script is held to
 * (`scripts/classic-edges.mjs`, by key), so that a slip in one is caught by the
 * other. Only geography: no artwork, wording or name of any published game.
 */

const CONTINENTS: Record<string, { bonus: number; names: string[] }> = {
  northAmerica: { bonus: 5, names: ["Alaska", "Northwest Territory", "Greenland", "Alberta", "Ontario", "Quebec", "Western United States", "Eastern United States", "Central America"] },
  southAmerica: { bonus: 2, names: ["Venezuela", "Peru", "Brazil", "Argentina"] },
  europe: { bonus: 5, names: ["Iceland", "Scandinavia", "Great Britain", "Northern Europe", "Western Europe", "Southern Europe", "Ukraine"] },
  africa: { bonus: 3, names: ["North Africa", "Egypt", "East Africa", "Congo", "South Africa", "Madagascar"] },
  asia: { bonus: 7, names: ["Ural", "Siberia", "Yakutsk", "Kamchatka", "Irkutsk", "Mongolia", "Japan", "Afghanistan", "China", "Middle East", "India", "Siam"] },
  australia: { bonus: 2, names: ["Indonesia", "New Guinea", "Western Australia", "Eastern Australia"] },
};

/** Every neighbour of each territory in the classic graph, by name. */
const NEIGHBOURS: Record<string, string[]> = {
  Alaska: ["Northwest Territory", "Alberta", "Kamchatka"],
  "Northwest Territory": ["Alaska", "Alberta", "Ontario", "Greenland"],
  Greenland: ["Northwest Territory", "Ontario", "Quebec", "Iceland"],
  Alberta: ["Alaska", "Northwest Territory", "Ontario", "Western United States"],
  Ontario: ["Northwest Territory", "Alberta", "Greenland", "Quebec", "Western United States", "Eastern United States"],
  Quebec: ["Ontario", "Greenland", "Eastern United States"],
  "Western United States": ["Alberta", "Ontario", "Eastern United States", "Central America"],
  "Eastern United States": ["Ontario", "Quebec", "Western United States", "Central America"],
  "Central America": ["Western United States", "Eastern United States", "Venezuela"],
  Venezuela: ["Central America", "Peru", "Brazil"],
  Peru: ["Venezuela", "Brazil", "Argentina"],
  Brazil: ["Venezuela", "Peru", "Argentina", "North Africa"],
  Argentina: ["Peru", "Brazil"],
  Iceland: ["Greenland", "Great Britain", "Scandinavia"],
  Scandinavia: ["Iceland", "Great Britain", "Northern Europe", "Ukraine"],
  "Great Britain": ["Iceland", "Scandinavia", "Northern Europe", "Western Europe"],
  "Northern Europe": ["Great Britain", "Scandinavia", "Western Europe", "Southern Europe", "Ukraine"],
  "Western Europe": ["Great Britain", "Northern Europe", "Southern Europe", "North Africa"],
  "Southern Europe": ["Northern Europe", "Western Europe", "Ukraine", "North Africa", "Egypt", "Middle East"],
  Ukraine: ["Scandinavia", "Northern Europe", "Southern Europe", "Ural", "Afghanistan", "Middle East"],
  "North Africa": ["Brazil", "Western Europe", "Southern Europe", "Egypt", "East Africa", "Congo"],
  Egypt: ["Southern Europe", "North Africa", "East Africa", "Middle East"],
  "East Africa": ["North Africa", "Egypt", "Congo", "South Africa", "Madagascar", "Middle East"],
  Congo: ["North Africa", "East Africa", "South Africa"],
  "South Africa": ["East Africa", "Congo", "Madagascar"],
  Madagascar: ["East Africa", "South Africa"],
  Ural: ["Ukraine", "Siberia", "China", "Afghanistan"],
  Siberia: ["Ural", "Yakutsk", "Irkutsk", "Mongolia", "China"],
  Yakutsk: ["Siberia", "Irkutsk", "Kamchatka"],
  Kamchatka: ["Alaska", "Yakutsk", "Irkutsk", "Mongolia", "Japan"],
  Irkutsk: ["Siberia", "Yakutsk", "Kamchatka", "Mongolia"],
  Mongolia: ["Siberia", "Irkutsk", "Kamchatka", "Japan", "China"],
  Japan: ["Kamchatka", "Mongolia"],
  Afghanistan: ["Ukraine", "Ural", "China", "India", "Middle East"],
  China: ["Ural", "Siberia", "Mongolia", "Afghanistan", "India", "Siam"],
  "Middle East": ["Southern Europe", "Ukraine", "Egypt", "East Africa", "Afghanistan", "India"],
  India: ["Afghanistan", "China", "Middle East", "Siam"],
  Siam: ["China", "India", "Indonesia"],
  Indonesia: ["Siam", "New Guinea", "Western Australia"],
  "New Guinea": ["Indonesia", "Western Australia", "Eastern Australia"],
  "Western Australia": ["Indonesia", "New Guinea", "Eastern Australia"],
  "Eastern Australia": ["New Guinea", "Western Australia"],
};

const WORLD = TENKA_MAPS.world;
const nameOf = (at: number) => TENKA_TERRITORIES[at].name;
const pair = (a: string, b: string) => [a, b].sort().join(" – ");

describe("Tenka's world is the classic graph", () => {
  it("has the classic forty-two territories, by name, in the classic six continents", () => {
    const wanted = Object.values(CONTINENTS).flatMap((continent) => continent.names);
    expect(wanted.length).toBe(42);
    expect(TENKA_TERRITORIES.map((territory) => territory.name)).toEqual(wanted);
    expect(TENKA_CONTINENTS.map((continent) => continent.key)).toEqual(Object.keys(CONTINENTS));
  });

  it.each(Object.entries(CONTINENTS))("%s holds its classic territories and is worth the classic bonus", (key, { bonus, names }) => {
    const continent = TENKA_CONTINENTS.find((one) => one.key === key)!;
    expect(continent.territories.map(nameOf)).toEqual(names);
    expect(continent.bonus).toBe(bonus);
  });

  it("joins exactly the classic eighty-three pairs, by land or by sea, and no others", () => {
    const wanted = new Set(Object.entries(NEIGHBOURS).flatMap(([name, others]) => others.map((other) => pair(name, other))));
    expect(wanted.size).toBe(83);
    const drawn = new Set(WORLD.neighbours.flatMap((others, at) => others.map((other) => pair(nameOf(at), nameOf(other)))));
    expect([...drawn].filter((edge) => !wanted.has(edge))).toEqual([]);
    expect([...wanted].filter((edge) => !drawn.has(edge))).toEqual([]);
    expect(drawn.size).toBe(83);
  });

  it("lists every neighbour of each territory in the classic table, from both sides", () => {
    for (const [name, others] of Object.entries(NEIGHBOURS)) {
      for (const other of others) expect(NEIGHBOURS[other], `${other} lists ${name}`).toContain(name);
    }
    TENKA_TERRITORIES.forEach((territory, at) => {
      expect(WORLD.neighbours[at].map(nameOf).sort(), territory.name).toEqual([...NEIGHBOURS[territory.name]].sort());
    });
  });

  it("is the list the map script is held to, by key: eighty-three unique pairs of the forty-two territories", () => {
    expect(CLASSIC_EDGES.length).toBe(83);
    expect(new Set(CLASSIC_EDGES.map(([a, b]) => [a, b].sort().join())).size).toBe(83);
    const keys = new Set(TENKA_TERRITORIES.map((territory) => territory.key));
    expect(new Set(CLASSIC_EDGES.flat())).toEqual(keys);
    const drawn = new Set(WORLD.neighbours.flatMap((others, at) => others.map((other) => [TENKA_TERRITORIES[at].key, TENKA_TERRITORIES[other].key].sort().join())));
    expect(new Set(CLASSIC_EDGES.map(([a, b]) => [a, b].sort().join()))).toEqual(drawn);
  });

  it("never joins a pair by land and by sea at once, and keeps each pair once in each list", () => {
    TENKA_TERRITORIES.forEach((territory) => {
      expect(territory.land.filter((other) => territory.sea.includes(other))).toEqual([]);
    });
    expect(WORLD.neighbours.reduce((sum, others) => sum + others.length, 0)).toBe(166);
  });

  it("has a card for every territory, in territory order, and the two wild cards after them", () => {
    expect(TENKA_DECK.length).toBe(42 + 2);
    TENKA_TERRITORIES.forEach((_, at) => expect(cardTerritory(at)).toBe(at));
    expect(TENKA_DECK.filter((card) => isWild(card)).length).toBe(2);
  });

  it("is played to its end by the computer at every table from two to six, over the classic graph", () => {
    for (const count of [2, 3, 4, 5, 6]) {
      let state = count;
      const random = () => {
        const drawn = nextRandom(state);
        state = drawn.state;
        return drawn.value;
      };
      let game = startTenka(10, Array.from({ length: count }, (_, at) => `P${at + 1}`), 100 + count)!;
      for (let step = 0; step < 20_000 && game.phase !== TENKA_PHASES.over; step += 1) {
        const next = playTenka(game, sensibleTenkaMove(game, random));
        expect(next, `${count} players, step ${step}`).not.toBeNull();
        game = next!;
      }
      expect(game.phase, `${count} players`).toBe(TENKA_PHASES.over);
      expect(game.winners.length).toBeGreaterThan(0);
    }
  });
});
