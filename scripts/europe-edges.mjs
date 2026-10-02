/**
 * THE GRAPH OF TENKA'S EUROPE, written down by hand: which territories there
 * are, which of them touch, and which are joined across the water. It is the
 * one thing the Europe map must equal, John's rule (2026-10-02): the Europe
 * map is the same board as the classic Europe board, as a graph — the same
 * forty-nine named areas, the same borders between them, the same dashed sea
 * routes. Only geography: no artwork, wording, logo or name of a published
 * game, and the names are the historical and geographic ones the areas are
 * known by.
 *
 * `scripts/map-europe.mjs` builds the shapes and holds what it builds to this
 * list (it refuses to write a map whose borders differ), and
 * `src/tenkaEurope.test.ts` holds the finished map to it again, written out a
 * second time by name there, so that a slip in one is caught by the other.
 *
 * THE REGIONS ARE TENKA'S OWN. The physical board has no regions (it has city
 * values and crowns, which are another game's rules); the eleven below are
 * this package's grouping for the bonus a held region brings, and
 * `src/tenkaMap.ts` sets what each is worth.
 */

/** The regions, in the order the territories run: each key, and the territories that belong to it are those listing it. */
export const EUROPE_REGION_KEYS = ["britishIsles", "scandinavia", "iberia", "maghreb", "france", "germany", "centralEurope", "italy", "balkans", "baltic", "easternEurope"];

/** The forty-nine territories, region by region: key, name and region. */
export const EUROPE_TERRITORY_LIST = [
  { key: "scotland", name: "Scotland", continent: "britishIsles" },
  { key: "england", name: "England", continent: "britishIsles" },
  { key: "wales", name: "Wales", continent: "britishIsles" },
  { key: "ireland", name: "Ireland", continent: "britishIsles" },

  { key: "norway", name: "Norway", continent: "scandinavia" },
  { key: "sweden", name: "Sweden", continent: "scandinavia" },
  { key: "finland", name: "Finland", continent: "scandinavia" },
  { key: "denmark", name: "Denmark", continent: "scandinavia" },

  { key: "portugal", name: "Portugal", continent: "iberia" },
  { key: "leonCastile", name: "León-Castile", continent: "iberia" },
  { key: "navarre", name: "Navarre", continent: "iberia" },
  { key: "barcelona", name: "Barcelona", continent: "iberia" },
  { key: "valencia", name: "Valencia", continent: "iberia" },
  { key: "granada", name: "Granada", continent: "iberia" },

  { key: "morocco", name: "Morocco", continent: "maghreb" },
  { key: "algeria", name: "Algeria", continent: "maghreb" },
  { key: "tunisia", name: "Tunisia", continent: "maghreb" },

  { key: "normandy", name: "Normandy", continent: "france" },
  { key: "brittany", name: "Brittany", continent: "france" },
  { key: "france", name: "France", continent: "france" },
  { key: "burgundy", name: "Burgundy", continent: "france" },

  { key: "friesland", name: "Friesland", continent: "germany" },
  { key: "saxony", name: "Saxony", continent: "germany" },
  { key: "lorraine", name: "Lorraine", continent: "germany" },
  { key: "franconia", name: "Franconia", continent: "germany" },
  { key: "swabia", name: "Swabia", continent: "germany" },

  { key: "bavaria", name: "Bavaria", continent: "centralEurope" },
  { key: "bohemia", name: "Bohemia", continent: "centralEurope" },
  { key: "highlands", name: "Highlands", continent: "centralEurope" },
  { key: "hungary", name: "Hungary", continent: "centralEurope" },

  { key: "lombardy", name: "Lombardy", continent: "italy" },
  { key: "rome", name: "Rome", continent: "italy" },
  { key: "kingdomOfSicily", name: "Kingdom of Sicily", continent: "italy" },
  { key: "sardinia", name: "Sardinia", continent: "italy" },

  { key: "venice", name: "Venice", continent: "balkans" },
  { key: "serbia", name: "Serbia", continent: "balkans" },
  { key: "greece", name: "Greece", continent: "balkans" },
  { key: "bulgaria", name: "Bulgaria", continent: "balkans" },
  { key: "turkey", name: "Turkey", continent: "balkans" },

  { key: "pomerania", name: "Pomerania", continent: "baltic" },
  { key: "prussia", name: "Prussia", continent: "baltic" },
  { key: "poland", name: "Poland", continent: "baltic" },
  { key: "lithuania", name: "Lithuania", continent: "baltic" },
  { key: "estonia", name: "Estonia", continent: "baltic" },

  { key: "novgorod", name: "Republic of Novgorod", continent: "easternEurope" },
  { key: "smolensk", name: "Smolensk", continent: "easternEurope" },
  { key: "polotsk", name: "Polotsk", continent: "easternEurope" },
  { key: "rusland", name: "Rusland", continent: "easternEurope" },
  { key: "galicia", name: "Galicia", continent: "easternEurope" },
];

/** Every pair of territories that share a border on land: eighty-two. */
export const EUROPE_LAND_EDGES = [
  // The British Isles
  ["scotland", "england"],
  ["england", "wales"],
  // Scandinavia, and Denmark's reach down into northern Germany
  ["norway", "sweden"],
  ["sweden", "finland"],
  ["denmark", "friesland"],
  ["denmark", "saxony"],
  ["denmark", "pomerania"],
  ["denmark", "poland"],
  ["denmark", "bohemia"],
  // Iberia
  ["portugal", "leonCastile"],
  ["leonCastile", "navarre"],
  ["leonCastile", "valencia"],
  ["leonCastile", "granada"],
  ["navarre", "barcelona"],
  ["navarre", "valencia"],
  ["barcelona", "valencia"],
  ["valencia", "granada"],
  ["navarre", "france"],
  ["barcelona", "france"],
  // The Maghreb
  ["morocco", "algeria"],
  ["algeria", "tunisia"],
  // France
  ["normandy", "brittany"],
  ["normandy", "france"],
  ["brittany", "france"],
  ["france", "burgundy"],
  ["france", "lorraine"],
  ["burgundy", "lorraine"],
  ["burgundy", "swabia"],
  ["burgundy", "lombardy"],
  // Germany and the Low Countries
  ["friesland", "saxony"],
  ["friesland", "lorraine"],
  ["saxony", "lorraine"],
  ["saxony", "franconia"],
  ["saxony", "bohemia"],
  ["lorraine", "franconia"],
  ["lorraine", "swabia"],
  ["franconia", "swabia"],
  ["franconia", "bavaria"],
  ["franconia", "bohemia"],
  ["swabia", "bavaria"],
  ["swabia", "lombardy"],
  // Central Europe
  ["bavaria", "bohemia"],
  ["bavaria", "highlands"],
  ["bavaria", "hungary"],
  ["bavaria", "venice"],
  ["bavaria", "lombardy"],
  ["bohemia", "highlands"],
  ["bohemia", "poland"],
  ["highlands", "poland"],
  ["highlands", "hungary"],
  ["hungary", "poland"],
  ["hungary", "galicia"],
  ["hungary", "venice"],
  ["hungary", "serbia"],
  ["hungary", "bulgaria"],
  // Italy
  ["lombardy", "rome"],
  ["rome", "kingdomOfSicily"],
  // The Balkans and Turkey
  ["venice", "serbia"],
  ["serbia", "greece"],
  ["serbia", "bulgaria"],
  ["greece", "bulgaria"],
  ["greece", "turkey"],
  ["bulgaria", "turkey"],
  ["bulgaria", "galicia"],
  // Poland and the Baltic
  ["pomerania", "prussia"],
  ["pomerania", "poland"],
  ["prussia", "poland"],
  ["prussia", "polotsk"],
  ["prussia", "lithuania"],
  ["poland", "polotsk"],
  ["poland", "rusland"],
  ["poland", "galicia"],
  ["lithuania", "polotsk"],
  ["lithuania", "estonia"],
  ["lithuania", "smolensk"],
  ["estonia", "novgorod"],
  ["estonia", "smolensk"],
  // The east
  ["novgorod", "smolensk"],
  ["polotsk", "smolensk"],
  ["polotsk", "rusland"],
  ["smolensk", "rusland"],
  ["rusland", "galicia"],
];

/** Every pair of territories joined by a dashed sea route across the water: nineteen. */
export const EUROPE_SEA_EDGES = [
  ["scotland", "norway"],
  ["scotland", "ireland"],
  ["ireland", "wales"],
  ["ireland", "brittany"],
  ["england", "normandy"],
  ["england", "lorraine"],
  ["norway", "denmark"],
  ["denmark", "sweden"],
  ["pomerania", "lithuania"],
  ["finland", "estonia"],
  ["finland", "novgorod"],
  ["brittany", "leonCastile"],
  ["leonCastile", "morocco"],
  ["valencia", "algeria"],
  ["barcelona", "burgundy"],
  ["sardinia", "rome"],
  ["sardinia", "tunisia"],
  ["venice", "kingdomOfSicily"],
  ["tunisia", "greece"],
];
