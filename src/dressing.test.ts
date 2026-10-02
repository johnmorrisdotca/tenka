import { readdirSync, readFileSync } from "node:fs";

import { roll } from "@johnmorrisdotca/korokoro";
import { cardBackSvg } from "@johnmorrisdotca/toranpu/card-backs";
import { cardFaceSvg } from "@johnmorrisdotca/toranpu/card-faces";
import { describe, expect, it } from "vitest";

import { TENKA_BACK, tenkaCardDesign, tenkaCardId, tenkaCardOfId, tenkaThrownDie } from "./dressing.ts";
import { TENKA_STRINGS, tenkaSay, territoryNameIn } from "./strings.ts";
import { TENKA_MAP_LIST, tenkaMapOf } from "./tenkaMap.ts";
import { cardKind, tenkaDeckFor } from "./tenkaCards.ts";
import { tenkaShapesOf } from "./ui/mapModel.ts";

/** Tenka's table dressed in Korokoro's dice and Toranpu's cards: only what can be checked without a page. The page is tapped in table/dressed.table.mjs. */

describe("a die made to land on the face the game threw", () => {
  it("lands Korokoro's d6 on every face, through Korokoro's own roll", () => {
    for (let face = 1; face <= 6; face += 1) {
      const thrown = roll({ count: 1, sides: 6 }, tenkaThrownDie(face));
      expect(thrown.faces, `face ${face}`).toEqual([face]);
    }
  });

  it("is a way of drawing only: the dressing reaches nothing that plays the game or throws its dice", () => {
    const text = readFileSync("src/dressing.ts", "utf8") + readFileSync("src/dressingCards.ts", "utf8");
    for (const file of ["tenka.ts", "tenkaDice.ts", "tenkaTurn.ts", "tenkaMoves.ts", "tenkaPolicy.ts", "tenkaStart.ts", "tenkaKeep.ts"]) expect(text, file).not.toContain(`./${file}`);
    expect(text).not.toMatch(/Math\.random/);
  });
});

describe("a card's id", () => {
  it("names a map and a territory, or the wild card, and nothing else", () => {
    for (const map of TENKA_MAP_LIST) {
      const count = tenkaMapOf(map).territories.length;
      for (let territory = 0; territory < count; territory += 1) expect(tenkaCardOfId(tenkaCardId(map, territory))).toEqual({ map, territory });
      expect(tenkaCardOfId(tenkaCardId(map, count))).toBeNull();
    }
    expect(tenkaCardId("world", null)).toBe("tenka-wild");
    expect(tenkaCardOfId("tenka-wild")).toEqual({ wild: true });
    for (const junk of ["KS", "tenka-mars-3", "tenka-world-", "tenka-world-x", "", "tenka-world-3-4"]) expect(tenkaCardOfId(junk), junk).toBeNull();
  });
});

describe("Tenka's cards as a Toranpu design", () => {
  const design = tenkaCardDesign();

  it("draws every card of every map in both languages, and each shows its own territory", () => {
    for (const map of TENKA_MAP_LIST) {
      const board = tenkaMapOf(map);
      const shapes = tenkaShapesOf(map);
      for (const language of ["en", "ja"] as const) {
        const words = TENKA_STRINGS[language];
        board.territories.forEach((data, territory) => {
          const svg = cardFaceSvg(tenkaCardId(map, territory), { design, language, title: "" });
          expect(svg, `${map} ${territory}`).not.toBeNull();
          // The outline on the card is the map's outline for this territory, and no other.
          expect(svg).toContain(`d="${shapes.outlines[territory]}"`);
          const name = territoryNameIn(words, data.key) || data.name;
          // The name is written on one line or two, ahead of the picture.
          const written = [...svg!.matchAll(/<text [^>]*>([^<]*)<\/text>/g)].map((found) => found[1]!.replace(/&amp;/g, "&"));
          expect(written.slice(0, 2).join(" ").startsWith(name), `${map} ${territory} ${language}: ${written.slice(0, 2)}`).toBe(true);
        });
      }
    }
  });

  it("shows the symbol of the card's kind: a castle, a ship or a plane, and the wild card all three", () => {
    const symbols = { land: "M3 21V8h4", sea: "M11 2.5V15H3.5z", air: "M12 1.5c1 0 1.6" };
    for (const map of TENKA_MAP_LIST) {
      tenkaMapOf(map).territories.forEach((_, territory) => {
        const kind = cardKind(territory, tenkaMapOf(map)) as keyof typeof symbols;
        const svg = cardFaceSvg(tenkaCardId(map, territory), { design, title: "" })!;
        for (const [other, path] of Object.entries(symbols)) expect(svg.includes(path), `${map} ${territory} ${other}`).toBe(other === kind);
      });
    }
    const wild = cardFaceSvg("tenka-wild", { design, title: "" })!;
    for (const path of Object.values(symbols)) expect(wild).toContain(path);
    expect(wild).toContain(">Wild</text>");
    expect(cardFaceSvg("tenka-wild", { design, language: "ja", title: "" })).toContain(">ワイルド</text>");
  });

  it("names a card the way the table's own cards are named, for a screen reader", () => {
    for (const language of ["en", "ja"] as const) {
      const words = TENKA_STRINGS[language];
      const kinds = { land: words.kindLand, sea: words.kindSea, air: words.kindAir, wild: words.wild };
      for (const map of TENKA_MAP_LIST) {
        const board = tenkaMapOf(map);
        board.territories.forEach((data, territory) => {
          const want = tenkaSay(words.card, { kind: kinds[cardKind(territory, board)], land: territoryNameIn(words, data.key) || data.name });
          expect(design.label!(tenkaCardId(map, territory), language)).toBe(want);
        });
      }
      expect(design.label!("tenka-wild", language)).toBe(words.wild);
    }
    expect(design.label!("KS", "en")).toBeNull();
  });

  it("draws a card for every card of a deck and for nothing else", () => {
    for (const map of TENKA_MAP_LIST) {
      const deck = tenkaDeckFor(tenkaMapOf(map));
      const territories = tenkaMapOf(map).territories.length;
      expect(deck.length).toBe(territories + 2);
      expect(design.draw!(tenkaCardId(map, territories), { language: "en" })).toBeNull();
    }
    expect(design.draw!("KS", { language: "en" })).toBeNull();
    // The design is a plain value: its name is its own, and none of Toranpu's.
    expect(design.name).toBe("tenka");
    expect(design.box).toEqual([100, 140]);
  });
});

describe("Tenka's own back", () => {
  it("is Toranpu's classic back in the table's green with the character 天 in the middle", () => {
    const svg = cardBackSvg("classic-blue", TENKA_BACK);
    expect(svg).toContain("#2f5d4a");
    expect(svg).toContain("天");
  });
});

describe("where the other packages are reached", () => {
  const sources = (readdirSync("src", { recursive: true }) as string[]).filter((path) => /\.(ts|tsx)$/.test(path) && !/\.test\./.test(path));
  const peers = /"@johnmorrisdotca\/(korokoro|toranpu)/;

  it("only the dressing entry and its cards reach Korokoro or Toranpu: the rules, the map and the plain table need neither", () => {
    const importing = sources.filter((path) => peers.test(readFileSync(`src/${path}`, "utf8").split("\n").filter((line) => /^(import|export)\b.*\bfrom\b/.test(line)).join("\n"))).sort();
    expect(importing).toEqual(["dressing.ts", "dressingCards.ts"]);
  });

  it("both are optional peers and nothing is a dependency", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    expect(pkg.dependencies).toBeUndefined();
    for (const name of ["@johnmorrisdotca/korokoro", "@johnmorrisdotca/toranpu"]) {
      expect(pkg.peerDependencies[name], name).toBeDefined();
      expect(pkg.peerDependenciesMeta[name], name).toEqual({ optional: true });
      // The version this is built and tested against satisfies the range it asks of a user.
      expect(pkg.devDependencies[name], name).toMatch(/^\d+\.\d+\.\d+$/);
    }
  });
});
