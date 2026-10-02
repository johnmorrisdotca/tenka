import type { TenkaContinent, TenkaContinentKey, TenkaGame, TenkaMap, TenkaMapKey, TenkaOwner, TenkaTerritoryData } from "./tenka.types.ts";
import { TENKA_EUROPE_TERRITORY_DATA } from "./tenkaEurope.data.ts";
import { TENKA_TERRITORY_DATA } from "./tenkaWorld.data.ts";

/**
 * TENKA'S WORLD, as the rules read it: forty-two territories, their
 * neighbours by land and by sea, and six continents with what holding each
 * is worth. The graph is the classic world-conquest board's, exactly: the
 * same forty-two territories, the same eighty-three pairs that touch or are
 * joined by a sea link (`scripts/classic-edges.mjs`, which `tenkaClassic.test.ts`
 * holds the map to), the same six continents and bonuses. The territories,
 * their names and their neighbours are written by `scripts/map.mjs` from
 * Natural Earth (`tenkaWorld.data.ts`); the continents' bonuses are the classic
 * ones, set here by hand:
 *
 *   North America   9 territories   5
 *   South America   4 territories   2
 *   Europe          7 territories   5
 *   Africa          6 territories   3
 *   Asia           12 territories   7
 *   Australia       4 territories   2
 */
const WORLD_CONTINENTS: readonly Omit<TenkaContinent, "territories">[] = [
  { key: "northAmerica", name: "North America", kanji: "北米", bonus: 5 },
  { key: "southAmerica", name: "South America", kanji: "南米", bonus: 2 },
  { key: "europe", name: "Europe", kanji: "欧州", bonus: 5 },
  { key: "africa", name: "Africa", kanji: "阿州", bonus: 3 },
  { key: "asia", name: "Asia", kanji: "亜州", bonus: 7 },
  { key: "australia", name: "Australia", kanji: "豪州", bonus: 2 },
];

/**
 * EUROPE'S ELEVEN REGIONS, the continents of the Europe map (`scripts/map-europe.mjs`), each worth what the world's
 * continents are worth for their size and the ways into them:
 *
 *   Britain and Ireland            3 territories   2
 *   The Nordic Countries           4 territories   3
 *   Iberia                         3 territories   2
 *   The Maghreb                    3 territories   2
 *   France and the Low Countries   3 territories   3
 *   Central Europe                 5 territories   4
 *   Italy and the Balkans          4 territories   3
 *   The Danube                     3 territories   2
 *   Eastern Europe                 4 territories   3
 *   Russia                         3 territories   3
 *   Anatolia and the Caucasus      2 territories   2
 */
const EUROPE_REGIONS: readonly Omit<TenkaContinent, "territories">[] = [
  { key: "britishIsles", name: "Britain and Ireland", kanji: "英愛", bonus: 2 },
  { key: "scandinavia", name: "The Nordic Countries", kanji: "北欧", bonus: 3 },
  { key: "iberia", name: "Iberia", kanji: "イベリア", bonus: 2 },
  { key: "maghreb", name: "The Maghreb", kanji: "マグリブ", bonus: 2 },
  { key: "france", name: "France and the Low Countries", kanji: "西欧", bonus: 3 },
  { key: "centralEurope", name: "Central Europe", kanji: "中欧", bonus: 4 },
  { key: "italyBalkans", name: "Italy and the Balkans", kanji: "南欧", bonus: 3 },
  { key: "danube", name: "The Danube", kanji: "ドナウ", bonus: 2 },
  { key: "easternEurope", name: "Eastern Europe", kanji: "東欧", bonus: 3 },
  { key: "russia", name: "Russia", kanji: "露", bonus: 3 },
  { key: "anatolia", name: "Anatolia and the Caucasus", kanji: "小亜細亜", bonus: 2 },
];

/** A map as the rules read it, made from its territories and its continents' names and bonuses. */
function mapOf(key: TenkaMapKey, name: string, kanji: string, territories: readonly TenkaTerritoryData[], rows: readonly Omit<TenkaContinent, "territories">[]): TenkaMap {
  const continents = rows.map((row) => ({ ...row, territories: territories.flatMap((territory, at) => (territory.continent === row.key ? [at] : [])) }));
  return { key, name, kanji, territories, continents, neighbours: territories.map((territory) => [...territory.land, ...territory.sea]) };
}

/** Every map a game may be played on, by key. */
export const TENKA_MAPS: Readonly<Record<TenkaMapKey, TenkaMap>> = {
  world: mapOf("world", "The World", "世界", TENKA_TERRITORY_DATA, WORLD_CONTINENTS),
  europe: mapOf("europe", "Europe", "欧州", TENKA_EUROPE_TERRITORY_DATA, EUROPE_REGIONS),
};

/** The maps in the order a set-up offers them: the world first, the usual one. */
export const TENKA_MAP_LIST: readonly TenkaMapKey[] = ["world", "europe"];

/** The map a game is played on: the one it was started on, and the world for a game saved before there was a choice. */
export function tenkaMapOf(game: Pick<TenkaGame, "map"> | TenkaMapKey | undefined): TenkaMap {
  const key = typeof game === "string" ? game : game?.map;
  return TENKA_MAPS[key ?? "world"] ?? TENKA_MAPS.world;
}

const WORLD = TENKA_MAPS.world;

/**
 * The map an argument names, and the world for anything that is not one: these functions are handed to an
 * array's `map` and `filter` (`deck.map(cardKind)`), which pass an index where the map would go.
 */
export function boardOf(map: unknown): TenkaMap {
  return typeof map === "object" && map !== null && "territories" in map && "neighbours" in map ? (map as TenkaMap) : WORLD;
}

/** The world's territories: the map a game is played on unless it says otherwise. */
export const TENKA_TERRITORIES = WORLD.territories;

/** How many territories the world has: forty-two. */
export const TENKA_TERRITORY_COUNT = TENKA_TERRITORIES.length;

/** The world's six continents, each with the territories in it. */
export const TENKA_CONTINENTS: readonly TenkaContinent[] = WORLD.continents;

/** A continent of a map by its key. */
export function tenkaContinent(key: TenkaContinentKey, map: TenkaMap = WORLD): TenkaContinent {
  return boardOf(map).continents.find((continent) => continent.key === key)!;
}

/** A territory's neighbours, by land and by sea. */
export function tenkaNeighbours(territory: number, map: TenkaMap = WORLD): readonly number[] {
  return boardOf(map).neighbours[territory] ?? [];
}

/** Whether two territories are neighbours, by land or by sea. */
export function areNeighbours(a: number, b: number, map: TenkaMap = WORLD): boolean {
  return tenkaNeighbours(a, map).includes(b);
}

/** Whether a number is a territory of the map. */
export function isTerritory(territory: number, map: TenkaMap = WORLD): boolean {
  return Number.isInteger(territory) && territory >= 0 && territory < boardOf(map).territories.length;
}

/** The continents a seat holds every territory of. */
export function continentsHeld(owners: readonly TenkaOwner[], seat: TenkaOwner, map: TenkaMap = WORLD): TenkaContinent[] {
  return boardOf(map).continents.filter((continent) => continent.territories.every((territory) => owners[territory] === seat));
}

/** Every territory of the same owner reachable from this one through that owner's own territories, in order; never the territory itself. */
export function connectedOwn(owners: readonly TenkaOwner[], from: number, map: TenkaMap = WORLD): number[] {
  const seat = owners[from];
  const seen = new Set<number>([from]);
  const queue = [from];
  while (queue.length > 0) {
    const at = queue.shift()!;
    for (const next of tenkaNeighbours(at, map)) {
      if (!seen.has(next) && owners[next] === seat) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  seen.delete(from);
  return [...seen].sort((a, b) => a - b);
}
