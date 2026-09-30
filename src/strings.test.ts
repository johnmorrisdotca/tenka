import { describe, expect, it } from "vitest";

import { TENKA_CONTINENTS, TENKA_TERRITORIES } from "./tenkaMap.ts";
import { TENKA_STRINGS, continentNameIn, tenkaSay, tenkaStrings, territoryNameIn } from "./strings.ts";

const braces = (line: string) => [...line.matchAll(/\{(\w+)\}/g)].map((found) => found[1]).sort();

describe("the words, in English and Japanese", () => {
  it("both languages have every string, and none is empty", () => {
    expect(Object.keys(TENKA_STRINGS.ja)).toEqual(Object.keys(TENKA_STRINGS.en));
    for (const table of [TENKA_STRINGS.en, TENKA_STRINGS.ja]) {
      for (const [name, line] of Object.entries(table)) {
        // The gap between two sentences is a space in English and nothing in Japanese.
        if (name !== "sentenceGap") expect(line.trim(), name).not.toBe("");
      }
    }
  });

  it("a Japanese line fills the same braces as its English", () => {
    for (const name of Object.keys(TENKA_STRINGS.en) as (keyof typeof TENKA_STRINGS.en)[]) expect(braces(TENKA_STRINGS.ja[name]), name).toEqual(braces(TENKA_STRINGS.en[name]));
  });

  it("every territory and continent has a name in both, and the English is the map's own", () => {
    for (const territory of TENKA_TERRITORIES) {
      expect(territoryNameIn(TENKA_STRINGS.en, territory.key)).toBe(territory.name);
      expect(territoryNameIn(TENKA_STRINGS.ja, territory.key), territory.key).not.toBe("");
    }
    for (const continent of TENKA_CONTINENTS) {
      expect(continentNameIn(TENKA_STRINGS.en, continent.key)).toBe(continent.name);
      expect(continentNameIn(TENKA_STRINGS.ja, continent.key), continent.key).not.toBe("");
    }
    expect(new Set(TENKA_TERRITORIES.map((territory) => territoryNameIn(TENKA_STRINGS.ja, territory.key))).size).toBe(42);
    expect(territoryNameIn(TENKA_STRINGS.en, "atlantis")).toBe("");
  });

  it("braces are filled in, and one with no value is left", () => {
    expect(tenkaSay(TENKA_STRINGS.en.moveIn, { n: 3 })).toBe("Move 3 in");
    expect(tenkaSay(TENKA_STRINGS.ja.moveTo, { n: 2, land: "日本" })).toBe("2部隊を日本へ移動");
    expect(tenkaSay("{a} and {b}", { a: 1 })).toBe("1 and {b}");
  });

  it("a locale picks its table, a page's own words lie over it, and anything else is English", () => {
    expect(tenkaStrings("ja").endTurn).toBe(TENKA_STRINGS.ja.endTurn);
    expect(tenkaStrings("ja-JP").endTurn).toBe(TENKA_STRINGS.ja.endTurn);
    expect(tenkaStrings("fr").endTurn).toBe("End turn");
    expect(tenkaStrings(undefined).endTurn).toBe("End turn");
    expect(tenkaStrings("en", { endTurn: "Terminar turno" }).endTurn).toBe("Terminar turno");
    expect(tenkaStrings("en", { endTurn: "Terminar turno" }).blitz).toBe("Blitz");
  });
});
