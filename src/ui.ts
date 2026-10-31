/**
 * Tenka drawn and played in the browser, in plain DOM: a whole table against
 * the computer (`mountTenka`), and the map on its own (`tenkaMapSvg`, drawn
 * from `tenkaMapModel`). Its own entry, so the rules never carry the map.
 */

export {
  continentNameIn,
  TENKA_STRINGS,
  type TenkaLocale,
  type TenkaStrings,
  tenkaSay,
  tenkaStrings,
  territoryNameIn,
} from "./strings.ts";
export { ownerColour, TENKA_NEUTRAL_COLOUR, TENKA_SEAT_COLOURS } from "./ui/colours.ts";
export type { TenkaBackHow, TenkaCardHow, TenkaDieHow, TenkaDrawn, TenkaDressing } from "./ui/dressing.types.ts";
export {
  continentView,
  landInDirection,
  NO_MARKS,
  nearestLand,
  TENKA_MAP_SHAPES,
  type TenkaArrow,
  type TenkaLand,
  type TenkaMapModel,
  type TenkaRing,
  type TenkaView,
  tenkaMapModel,
  tenkaShapesOf,
} from "./ui/mapModel.ts";
export { mountTenka, type TenkaTableHandle, type TenkaTableOptions } from "./ui/mount.ts";
export { TENKA_STYLE } from "./ui/style.ts";
export { tenkaMapSvg } from "./ui/svg.ts";
