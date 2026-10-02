import type { CardDesign } from "@johnmorrisdotca/toranpu/card-faces";

import { TENKA_STRINGS, continentNameIn, tenkaSay, territoryNameIn, type TenkaLocale } from "./strings.ts";
import type { TenkaCardKind, TenkaMapKey } from "./tenka.types.ts";
import { cardKind } from "./tenkaCards.ts";
import { TENKA_MAP_LIST, tenkaMapOf } from "./tenkaMap.ts";
import { tenkaShapesOf } from "./ui/mapModel.ts";

/**
 * TENKA'S CARDS, DRAWN FOR TORANPU: each territory's card is its own shape on
 * the map, its name, and the symbol of the army it stands for, land, sea or
 * air; the two wild cards show all three. Toranpu lays the card out and
 * frames it on its paper; this file only says what is on it, from the map's
 * own outlines, so a card cannot show a territory other than the one it is.
 */

const BOX_WIDTH = 100;
const BOX_HEIGHT = 140;

/** The ink and the symbol of each kind of army. */
const KIND_INK: Readonly<Record<TenkaCardKind, string>> = { land: "#7b5b2e", sea: "#1f5f8b", air: "#7a4e9c", wild: "#2f5d4a" };

/** The symbols, each drawn in a box 24 by 24: a castle for land, a ship for the sea, a plane for the air. */
const SYMBOL_PATHS: Readonly<Record<Exclude<TenkaCardKind, "wild">, string>> = {
  land: "M3 21V8h4v2.5h3V8h4v2.5h3V8h4v13h-6v-4.5a2 2 0 0 0-4 0V21z",
  sea: "M11 2.5V15H3.5zM13 5.5V15h7.5zM2 17h20l-3.5 4.5h-13z",
  air: "M12 1.5c1 0 1.6 1.2 1.6 2.6V9l8.4 5.4v2.4l-8.4-2.4V19l2.4 1.8v1.7L12 21.4l-4 1.1v-1.7l2.4-1.8v-4.6L2 16.8v-2.4L10.4 9V4.1C10.4 2.7 11 1.5 12 1.5z",
};

/** The colours the continents are filled with on a card: a muted, distinct run, taken in the order the map lists them. */
const CONTINENT_FILLS = ["#e1bd63", "#d0766b", "#7b9bcf", "#c99458", "#8dba7b", "#b08dc3", "#8cc1c1", "#d9a0b2", "#aab36a", "#c58c8c", "#8f9ec9", "#b9b08a"] as const;

const escapeXml = (text: string): string => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The id of a card in Toranpu's hands: `tenka-world-12` for the world's twelfth territory, `tenka-wild` for a wild card. */
export function tenkaCardId(map: TenkaMapKey, territory: number | null): string {
  return territory === null ? "tenka-wild" : `tenka-${map}-${territory}`;
}

/** The map and territory an id of `tenkaCardId` names, or null for a wild card (`wild: true`) or anything else. */
export function tenkaCardOfId(id: string): { map: TenkaMapKey; territory: number } | { wild: true } | null {
  if (id === "tenka-wild") return { wild: true };
  const found = /^tenka-(\w+)-(\d+)$/.exec(id);
  if (found === null || !(TENKA_MAP_LIST as readonly string[]).includes(found[1]!)) return null;
  const map = found[1] as TenkaMapKey;
  const territory = Number(found[2]);
  return territory < tenkaMapOf(map).territories.length ? { map, territory } : null;
}

/** A symbol at a place on the card, `size` units across. */
function symbol(kind: Exclude<TenkaCardKind, "wild">, cx: number, cy: number, size: number): string {
  const scale = size / 24;
  return `<path d="${SYMBOL_PATHS[kind]}" fill="${KIND_INK[kind]}" transform="translate(${cx - size / 2} ${cy - size / 2}) scale(${scale})"/>`;
}

/** A name on one line or two, as large as fits the card's width. */
function nameLines(name: string, language: TenkaLocale): string {
  const wide = language === "ja" ? 1 : 0.56;
  const words = name.split(" ");
  let lines = [name];
  if (words.length > 1 && name.length * wide * 12 > 84) {
    // Break at the space nearest the middle.
    let best = 1;
    for (let at = 1; at < words.length; at += 1) if (Math.abs(words.slice(0, at).join(" ").length - name.length / 2) < Math.abs(words.slice(0, best).join(" ").length - name.length / 2)) best = at;
    lines = [words.slice(0, best).join(" "), words.slice(best).join(" ")];
  }
  const longest = Math.max(...lines.map((line) => line.length));
  const size = Math.min(language === "ja" ? 13 : 12.5, 86 / (longest * wide + 0.001));
  const top = lines.length === 1 ? 24 : 17.5;
  return lines.map((line, at) => `<text x="50" y="${round(top + at * (size + 1.5))}" text-anchor="middle" font-size="${round(size)}" font-weight="700" font-family="system-ui, -apple-system, 'Hiragino Sans', 'Yu Gothic', sans-serif" fill="#1f2320">${escapeXml(line)}</text>`).join("");
}

const round = (value: number): number => Math.round(value * 100) / 100;

/** The name of the continent or region under the picture, small, and smaller still where it is long. */
function areaLine(name: string, language: TenkaLocale): string {
  const size = Math.min(7.5, 84 / (name.length * (language === "ja" ? 1 : 0.56)));
  return `<text x="50" y="109" text-anchor="middle" font-size="${round(size)}" font-weight="600" font-family="system-ui, -apple-system, 'Hiragino Sans', 'Yu Gothic', sans-serif" fill="#1f2320" fill-opacity=".7">${escapeXml(name)}</text>`;
}

/** The part of the map to show for a territory: its extent with a margin, and for one whose extent crosses the seam of the map, the part round its counter. */
function frameOf(map: TenkaMapKey, territory: number): readonly [number, number, number, number] {
  const shapes = tenkaShapesOf(map);
  const box = shapes.boxes[territory]!;
  let [left, top, right, bottom] = [box[0]!, box[1]!, box[2]!, box[3]!];
  if (right - left > shapes.width / 2) {
    const [x, y] = shapes.labels[territory]!;
    [left, top, right, bottom] = [x! - 80, y! - 80, x! + 80, y! + 80];
  }
  const pad = Math.max(right - left, bottom - top) * 0.06 + 3;
  return [left - pad, top - pad, right - left + 2 * pad, bottom - top + 2 * pad];
}

/** The territory's card, as what goes inside Toranpu's 100 by 140 box. */
function territoryCard(map: TenkaMapKey, territory: number, language: TenkaLocale): string {
  const board = tenkaMapOf(map);
  const data = board.territories[territory]!;
  const kind = cardKind(territory, board) as Exclude<TenkaCardKind, "wild">;
  const words = TENKA_STRINGS[language];
  const name = territoryNameIn(words, data.key) || data.name;
  const continent = Math.max(0, board.continents.findIndex((one) => one.key === data.continent));
  const fill = CONTINENT_FILLS[continent % CONTINENT_FILLS.length]!;
  const [vx, vy, vw, vh] = frameOf(map, territory);
  const outline = tenkaShapesOf(map).outlines[territory]!;
  const ink = KIND_INK[kind];
  return [
    `<rect x="3.5" y="3.5" width="93" height="133" rx="6" fill="none" stroke="${ink}" stroke-width="1.6"/>`,
    nameLines(name, language),
    `<svg x="9" y="40" width="82" height="58" viewBox="${round(vx)} ${round(vy)} ${round(vw)} ${round(vh)}" preserveAspectRatio="xMidYMid meet" overflow="hidden"><rect x="${round(vx - vw)}" y="${round(vy - vh)}" width="${round(vw * 3)}" height="${round(vh * 3)}" fill="#cfe0e6"/><path d="${outline}" fill="${fill}" stroke="#1f2320" stroke-width="1.4" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`,
    `<rect x="9" y="40" width="82" height="58" rx="2" fill="none" stroke="#1f2320" stroke-opacity=".45" stroke-width=".8"/>`,
    areaLine(continentNameIn(words, data.continent) || data.continent, language),
    symbol(kind, 50, 122, 19),
  ].join("");
}

/** The wild card: the three armies together, over the character for Tenka. */
function wildCard(language: TenkaLocale): string {
  const word = TENKA_STRINGS[language].wild;
  return [
    `<rect x="3.5" y="3.5" width="93" height="133" rx="6" fill="none" stroke="${KIND_INK.wild}" stroke-width="1.6"/>`,
    `<text x="50" y="26" text-anchor="middle" font-size="14" font-weight="700" font-family="system-ui, -apple-system, 'Hiragino Sans', 'Yu Gothic', sans-serif" fill="#1f2320">${escapeXml(word)}</text>`,
    `<rect x="9" y="40" width="82" height="58" rx="2" fill="#cfe0e6" stroke="#1f2320" stroke-opacity=".45" stroke-width=".8"/>`,
    `<text x="50" y="86" text-anchor="middle" font-size="50" font-weight="700" font-family="'Hiragino Mincho ProN', 'Yu Mincho', 'Songti SC', serif" fill="${KIND_INK.wild}" fill-opacity=".85">天</text>`,
    symbol("land", 27, 122, 19),
    symbol("sea", 50, 122, 19),
    symbol("air", 73, 122, 19),
  ].join("");
}

/**
 * Tenka's cards as a Toranpu design: ask Toranpu for `tenkaCardId(map, territory)` in this design and it draws the
 * territory's shape and name with its army's symbol, on its paper and in its frame. Register it
 * (`registerCardDesign(tenkaCardDesign())`) for `<toranpu-card design="tenka">` and the rest of Toranpu's elements to
 * draw Tenka's cards by id.
 */
export function tenkaCardDesign(): CardDesign {
  return {
    name: "tenka",
    box: [BOX_WIDTH, BOX_HEIGHT],
    art: {},
    draw: (id, { language }) => {
      const found = tenkaCardOfId(id);
      if (found === null) return null;
      return "wild" in found ? wildCard(language) : territoryCard(found.map, found.territory, language);
    },
    label: (id, language) => {
      const found = tenkaCardOfId(id);
      if (found === null) return null;
      const words = TENKA_STRINGS[language];
      if ("wild" in found) return words.wild;
      const data = tenkaMapOf(found.map).territories[found.territory]!;
      const kinds = { land: words.kindLand, sea: words.kindSea, air: words.kindAir, wild: words.wild };
      return tenkaSay(words.card, { kind: kinds[cardKind(found.territory, tenkaMapOf(found.map))], land: territoryNameIn(words, data.key) || data.name });
    },
  };
}
