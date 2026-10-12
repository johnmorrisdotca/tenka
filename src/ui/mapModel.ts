import { tenkaMapOf } from "../tenkaMap.ts";
import { TENKA_EUROPE_SHAPES } from "../tenkaEuropeShapes.data.ts";
import { TENKA_SHAPES } from "../tenkaShapes.data.ts";
import type { TenkaContinentKey, TenkaGame, TenkaMapKey, TenkaMapMarks, TenkaShapes } from "../tenka.types.ts";

/** How each map is drawn.
 *
 * @example
 * ```ts
 * import { TENKA_MAP_SHAPES } from "@johnmorrisdotca/tenka/ui";
 * console.log(TENKA_MAP_SHAPES);
 * ```
 */
export const TENKA_MAP_SHAPES: Readonly<Record<TenkaMapKey, TenkaShapes>> = { world: TENKA_SHAPES, europe: TENKA_EUROPE_SHAPES };

/** How a game's map is drawn: the world unless the game says otherwise.
 *
 * @param map - The native world or Europe map to use.
 * @returns How a game's map is drawn: the world unless the game says otherwise.
 * @example
 * ```ts
 * import { tenkaShapesOf } from "@johnmorrisdotca/tenka/ui";
 *
 * console.log(tenkaShapesOf("europe").outlines.length);
 * ```
 */
export function tenkaShapesOf(map: TenkaMapKey | undefined): TenkaShapes {
  return TENKA_MAP_SHAPES[map ?? "world"] ?? TENKA_SHAPES;
}
import { ownerColour } from "./colours.ts";

/** How a territory is ringed: the one chosen, one it can reach, or the target.
 *
 * @example
 * ```ts
 * import type { TenkaRing } from "@johnmorrisdotca/tenka/ui";
 *
 * const value: TenkaRing = "chosen";
 * console.log(value);
 * ```
 */
export type TenkaRing = "chosen" | "reach" | "target" | null;

/** One territory as a drawing needs it.
 *
 * @example
 * ```ts
 * import { startTenka } from "@johnmorrisdotca/tenka";
 * import type { TenkaLand } from "@johnmorrisdotca/tenka/ui";
 * import { tenkaMapModel } from "@johnmorrisdotca/tenka/ui";
 *
 * const game = startTenka(10,["Seat 1","Seat 2"],42)!;
 * const value: TenkaLand = tenkaMapModel(game).lands[0];
 * console.log(value);
 * ```
 */
export type TenkaLand = {
  /** Its number. */
  territory: number;
  /** Its key, such as `"alaska"`. */
  key: string;
  /** Its name in English. */
  name: string;
  /** Its outline, one SVG path in map units. */
  outline: string;
  /** The colour of whoever holds it. */
  fill: string;
  /** How it is ringed, if it is. */
  ring: TenkaRing;
  /** Where its counter stands, in map units. */
  at: readonly [number, number];
  /** The armies standing on it. */
  armies: number;
  /** The seat that holds it, or `TENKA_NEUTRAL`. */
  owner: number;
};

/** The whole world as a drawing needs it, in map units: `tenkaMapModel` makes one, `tenkaMapSvg` and `TenkaMap` draw it.
 *
 * @example
 * ```ts
 * import { startTenka } from "@johnmorrisdotca/tenka";
 * import type { TenkaMapModel } from "@johnmorrisdotca/tenka/ui";
 * import { tenkaMapModel } from "@johnmorrisdotca/tenka/ui";
 *
 * const game = startTenka(10,["Seat 1","Seat 2"],42)!;
 * const value: TenkaMapModel = tenkaMapModel(game);
 * console.log(value);
 * ```
 */
export type TenkaMapModel = {
  width: number;
  height: number;
  lands: readonly TenkaLand[];
  seaLines: readonly (readonly number[])[];
  continentBorders: string;
};

/** Nothing lit up.
 *
 * @example
 * ```ts
 * import { NO_MARKS } from "@johnmorrisdotca/tenka/ui";
 * console.log(NO_MARKS);
 * ```
 */
export const NO_MARKS: TenkaMapMarks = { chosen: null, reach: [], target: null };

/**
 * EVERYTHING A DRAWING OF THE WORLD NEEDS, for one game: each territory's
 * outline in its owner's colour, its counter's place and armies, and its
 * ring. Shared by the plain-DOM table and the React map, so both draw the
 * same world from the same few rules.
 *
 * @param game - The current native game state.
 * @param marks - The chosen, reachable and target territory highlights.
 * @param colours - The seat colour palette.
 * @returns EVERYTHING A DRAWING OF THE WORLD NEEDS, for one game: each territory's outline in its owner's colour, its counter's place and armies, and its ring. Shared by the plain-DOM table and the React map, so both draw the same world from the same few rules.
 * @example
 * ```ts
 * import { startTenka } from "@johnmorrisdotca/tenka";
 * import { tenkaMapModel } from "@johnmorrisdotca/tenka/ui";
 *
 * const game = startTenka(10,["Seat 1","Seat 2"],42)!;
 * console.log(tenkaMapModel(game).lands.length);
 * ```
 */
export function tenkaMapModel(game: Pick<TenkaGame, "owners" | "armies" | "map">, marks: TenkaMapMarks = NO_MARKS, colours?: readonly string[]): TenkaMapModel {
  const reach = new Set(marks.reach);
  const shapes = tenkaShapesOf(game.map);
  const { territories } = tenkaMapOf(game.map);
  const lands = shapes.outlines.map((outline, territory): TenkaLand => {
    const owner = game.owners[territory] ?? -1;
    const ring: TenkaRing = marks.target === territory ? "target" : marks.chosen === territory ? "chosen" : reach.has(territory) ? "reach" : null;
    const label = shapes.labels[territory]!;
    return {
      territory,
      key: territories[territory]!.key,
      name: territories[territory]!.name,
      outline,
      fill: ownerColour(owner, colours),
      ring,
      at: [label[0]!, label[1]!],
      armies: game.armies[territory] ?? 0,
      owner,
    };
  });
  return { width: shapes.width, height: shapes.height, lands, seaLines: shapes.seaLines, continentBorders: shapes.continentBorders };
}

/** The territory whose counter is nearest a point of the map, within `reach` map units, or null.
 *
 * @param x - The horizontal map-unit coordinate.
 * @param y - The vertical map-unit coordinate.
 * @param reach - The maximum map-unit distance to consider.
 * @param map - The native world or Europe map to use.
 * @returns The nearest territory within reach, or null when none qualifies.
 * @example
 * ```ts
 * import { nearestLand } from "@johnmorrisdotca/tenka/ui";
 *
 * console.log(nearestLand(200,200,100));
 * ```
 */
export function nearestLand(x: number, y: number, reach: number, map: TenkaMapKey = "world"): number | null {
  let best: number | null = null;
  let bestDistance = reach;
  tenkaShapesOf(map).labels.forEach(([lx, ly], territory) => {
    const distance = Math.hypot(lx! - x, ly! - y);
    if (distance <= bestDistance) {
      best = territory;
      bestDistance = distance;
    }
  });
  return best;
}

/** A part of the map to show, in map units: left, top, width, height (an SVG viewBox).
 *
 * @example
 * ```ts
 * import type { TenkaView } from "@johnmorrisdotca/tenka/ui";
 * import { continentView } from "@johnmorrisdotca/tenka/ui";
 *
 * const value: TenkaView = continentView(null);
 * console.log(value);
 * ```
 */
export type TenkaView = readonly [number, number, number, number];

/** A way to move between territories from a keyboard.
 *
 * @example
 * ```ts
 * import type { TenkaArrow } from "@johnmorrisdotca/tenka/ui";
 *
 * const value: TenkaArrow = "right";
 * console.log(value);
 * ```
 */
export type TenkaArrow = "left" | "right" | "up" | "down";

/**
 * The territory a key moves to from another: the nearest counter in that
 * direction, a little straighter being better than a little nearer, and only
 * among those inside `view` (the whole map when none is given), so that the
 * focus never leaves what is on the screen. Null when nothing lies that way.
 *
 * @param from - The source territory index.
 * @param arrow - The keyboard navigation direction.
 * @param map - The native world or Europe map to use.
 * @param view - The visible map bounds; the full map when omitted.
 * @returns The nearest territory in the direction and view, or null when none is available.
 * @example
 * ```ts
 * import { landInDirection } from "@johnmorrisdotca/tenka/ui";
 *
 * console.log(landInDirection(0,"right"));
 * ```
 */
export function landInDirection(from: number, arrow: TenkaArrow, map: TenkaMapKey = "world", view?: TenkaView): number | null {
  const labels = tenkaShapesOf(map).labels;
  const start = labels[from];
  if (start === undefined) return null;
  const [dx, dy] = arrow === "left" ? [-1, 0] : arrow === "right" ? [1, 0] : arrow === "up" ? [0, -1] : [0, 1];
  let best: number | null = null;
  let bestScore = Infinity;
  labels.forEach(([x, y], territory) => {
    if (territory === from) return;
    if (view !== undefined && (x! < view[0] || x! > view[0] + view[2] || y! < view[1] || y! > view[1] + view[3])) return;
    const along = (x! - start[0]!) * dx! + (y! - start[1]!) * dy!;
    if (along <= 0) return;
    const across = Math.abs((x! - start[0]!) * dy! - (y! - start[1]!) * dx!);
    const score = along + 2 * across;
    if (score < bestScore) {
      best = territory;
      bestScore = score;
    }
  });
  return best;
}

/**
 * The part of the map that frames a continent, with a margin, widened to the
 * map's own shape so it fills the same box; the whole world for null.
 *
 * @param key - The continent identifier, or null to show the whole map.
 * @param map - The native world or Europe map to use.
 * @returns The part of the map that frames a continent, with a margin, widened to the map's own shape so it fills the same box; the whole world for null.
 * @example
 * ```ts
 * import { continentView } from "@johnmorrisdotca/tenka/ui";
 *
 * console.log(continentView("europe"));
 * ```
 */
export function continentView(key: TenkaContinentKey | null, map: TenkaMapKey = "world"): TenkaView {
  const shapes = tenkaShapesOf(map);
  const { width, height, boxes } = shapes;
  if (key === null) return [0, 0, width, height];
  const continent = tenkaMapOf(map).continents.find((one) => one.key === key);
  if (continent === undefined) return [0, 0, width, height];
  // A territory whose extent crosses the map's seam (an island far out, the east of Russia) is framed by its counter instead.
  const areas = continent.territories.map((territory) => {
    const box = boxes[territory]!;
    if (box[2]! - box[0]! <= width / 2) return box;
    const [x, y] = shapes.labels[territory]!;
    return [x! - 60, y! - 60, x! + 60, y! + 60];
  });
  const left = Math.min(...areas.map((area) => area[0]!));
  const top = Math.min(...areas.map((area) => area[1]!));
  const right = Math.max(...areas.map((area) => area[2]!));
  const bottom = Math.max(...areas.map((area) => area[3]!));
  const pad = 40;
  let w = right - left + pad * 2;
  let h = bottom - top + pad * 2;
  if (w / h < width / height) w = h * (width / height);
  else h = w / (width / height);
  const cx = (left + right) / 2;
  const cy = (top + bottom) / 2;
  return [cx - w / 2, cy - h / 2, w, h];
}
