import { statSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { TENKA_CONTINENTS, TENKA_TERRITORIES, TENKA_TERRITORY_COUNT, connectedOwn, continentsHeld, tenkaNeighbours } from "./tenkaMap.ts";
import { TENKA_SHAPES } from "./tenkaShapes.data.ts";
import type { TenkaContinentKey } from "./tenka.types.ts";

/**
 * Tenka's world, as the map script wrote it and the rules read it: every
 * territory reachable, every border seen from both sides, every continent
 * worth what the rules page says — and small enough to send to a phone.
 */

/** Every territory reachable from `start` over neighbours, land and sea. */
function reachable(start: number): Set<number> {
  const seen = new Set([start]);
  const queue = [start];
  while (queue.length > 0) {
    for (const next of tenkaNeighbours(queue.shift()!)) {
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  return seen;
}

describe("Tenka's world", () => {
  it("has forty-two territories, each named once, in six continents", () => {
    expect(TENKA_TERRITORY_COUNT).toBe(42);
    expect(new Set(TENKA_TERRITORIES.map((territory) => territory.key)).size).toBe(42);
    expect(new Set(TENKA_TERRITORIES.map((territory) => territory.name)).size).toBe(42);
    expect(TENKA_CONTINENTS.map((continent) => continent.key)).toEqual(["northAmerica", "southAmerica", "europe", "africa", "asia", "australia"]);
    expect(TENKA_CONTINENTS.reduce((sum, continent) => sum + continent.territories.length, 0)).toBe(42);
  });

  it("reaches every territory from every other, by land or sea", () => {
    for (let start = 0; start < TENKA_TERRITORY_COUNT; start += 1) expect(reachable(start).size).toBe(TENKA_TERRITORY_COUNT);
  });

  it("sees every border from both sides, never a territory beside itself, never a border twice", () => {
    TENKA_TERRITORIES.forEach((territory, at) => {
      for (const other of territory.land) expect(TENKA_TERRITORIES[other].land, `${territory.key} and ${TENKA_TERRITORIES[other].key} by land`).toContain(at);
      for (const other of territory.sea) expect(TENKA_TERRITORIES[other].sea, `${territory.key} and ${TENKA_TERRITORIES[other].key} by sea`).toContain(at);
      const all = tenkaNeighbours(at);
      expect(all).not.toContain(at);
      expect(new Set(all).size).toBe(all.length);
      expect(all.length, `${territory.key} has no neighbour`).toBeGreaterThan(0);
    });
  });

  it("has twenty-five sea links, the Bering Strait among them, and fifty-eight borders by land", () => {
    const links = TENKA_TERRITORIES.reduce((sum, territory) => sum + territory.sea.length, 0) / 2;
    expect(links).toBe(25);
    expect(TENKA_TERRITORIES.reduce((sum, territory) => sum + territory.land.length, 0) / 2).toBe(58);
    const alaska = TENKA_TERRITORIES.findIndex((territory) => territory.key === "alaska");
    const kamchatka = TENKA_TERRITORIES.findIndex((territory) => territory.key === "kamchatka");
    expect(TENKA_TERRITORIES[alaska].sea).toContain(kamchatka);
  });

  it("borders the way the world does: a few real land borders", () => {
    const at = (key: string) => TENKA_TERRITORIES.findIndex((territory) => territory.key === key);
    const borders = (a: string, b: string) => TENKA_TERRITORIES[at(a)].land.includes(at(b));
    expect(borders("centralAmerica", "venezuela")).toBe(true); // Panama and Colombia
    expect(borders("egypt", "middleEast")).toBe(true); // Sinai
    expect(borders("ukraine", "middleEast")).toBe(true); // the Caucasus
    expect(borders("alaska", "alberta")).toBe(true); // British Columbia and the Alaska panhandle
    expect(borders("ural", "china")).toBe(true); // Kazakhstan and Xinjiang
    expect(borders("scandinavia", "northernEurope")).toBe(true); // Denmark and Germany
    expect(borders("greatBritain", "westernEurope")).toBe(false); // the Channel is a sea link
    expect(borders("ukraine", "afghanistan")).toBe(false); // the Caspian is a sea link
  });

  /*
   * THE CONTINENT TABLE ON THE RULES PAGE: bonuses sized by territories and
   * the ways in. A map that changes how many ways a continent has in fails
   * here, so the bonus is looked at again rather than left to drift.
   */
  it.each<[TenkaContinentKey, number, number, number]>([
    ["northAmerica", 9, 3, 5],
    ["southAmerica", 4, 2, 2],
    ["europe", 7, 4, 5],
    ["africa", 6, 3, 3],
    ["asia", 12, 5, 7],
    ["australia", 4, 1, 2],
  ])("%s: %i territories, %i ways in, worth %i", (key, territories, waysIn, bonus) => {
    const continent = TENKA_CONTINENTS.find((one) => one.key === key)!;
    expect(continent.territories.length).toBe(territories);
    const borders = continent.territories.filter((territory) => tenkaNeighbours(territory).some((next) => TENKA_TERRITORIES[next].continent !== key));
    expect(borders.length).toBe(waysIn);
    expect(continent.bonus).toBe(bonus);
  });

  it("counts a continent held only when every territory of it is", () => {
    const australia = TENKA_CONTINENTS.find((one) => one.key === "australia")!;
    const owners = new Array<number>(TENKA_TERRITORY_COUNT).fill(1);
    for (const territory of australia.territories) owners[territory] = 0;
    expect(continentsHeld(owners, 0).map((one) => one.key)).toEqual(["australia"]);
    owners[australia.territories[0]] = 1;
    expect(continentsHeld(owners, 0)).toEqual([]);
  });

  it("fortifies only through a player's own territories", () => {
    const at = (key: string) => TENKA_TERRITORIES.findIndex((territory) => territory.key === key);
    const owners = new Array<number>(TENKA_TERRITORY_COUNT).fill(1);
    for (const key of ["westernUnitedStates", "easternUnitedStates", "centralAmerica", "venezuela"]) owners[at(key)] = 0;
    expect(connectedOwn(owners, at("westernUnitedStates")).sort()).toEqual([at("easternUnitedStates"), at("centralAmerica"), at("venezuela")].sort());
    // Brazil is theirs too, but only through somebody else's Peru — still joined through Venezuela.
    owners[at("brazil")] = 0;
    expect(connectedOwn(owners, at("westernUnitedStates"))).toContain(at("brazil"));
    // Cut Central America, and the south is out of reach.
    owners[at("centralAmerica")] = 1;
    expect(connectedOwn(owners, at("westernUnitedStates"))).toEqual([at("easternUnitedStates")]);
  });

  it("draws every territory, with a counter inside the map, and weighs well under 150 KB", () => {
    expect(TENKA_SHAPES.outlines.length).toBe(TENKA_TERRITORY_COUNT);
    expect(TENKA_SHAPES.labels.length).toBe(TENKA_TERRITORY_COUNT);
    for (const [x, y] of TENKA_SHAPES.labels) {
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(TENKA_SHAPES.width);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(TENKA_SHAPES.height);
    }
    for (const outline of TENKA_SHAPES.outlines) expect(outline).toMatch(/^M-?\d+ -?\d+l/);
    const bytes = statSync(new URL("./tenkaShapes.data.ts", import.meta.url)).size + statSync(new URL("./tenkaWorld.data.ts", import.meta.url)).size;
    expect(bytes).toBeLessThan(150_000);
  });
});
