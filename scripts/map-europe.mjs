/**
 * TENKA'S EUROPE, as `scripts/map.mjs europe` builds it: thirty-seven
 * territories in eleven regions, from Iceland to the Urals and from the
 * North Cape to the Maghreb, drawn from Natural Earth's admin-0 countries at
 * 1:50m (public domain), finer than the world's 1:110m because Europe is drawn
 * at about four times the scale.
 *
 * The territories are modern names for real stretches of the map, laid out
 * here for this game: a whole country where it is about the size of the
 * others, two countries together where they are small, and a large country cut
 * along a meridian where it would otherwise dwarf its neighbours. A country
 * this map does not list is left off it.
 */

/** The regions, by key, in the order the territories run. */
export const EUROPE_REGIONS = ["britishIsles", "scandinavia", "iberia", "maghreb", "france", "centralEurope", "italyBalkans", "danube", "easternEurope", "russia", "anatolia"];

/** The territories in region order. `label` places the army counter by hand, in longitude and latitude, where the middle of the largest piece would sit badly. */
export const EUROPE_TERRITORIES = [
  { key: "iceland", name: "Iceland", continent: "britishIsles" },
  { key: "ireland", name: "Ireland", continent: "britishIsles", label: [-8, 53.2] },
  { key: "greatBritain", name: "Great Britain", continent: "britishIsles", label: [-1.8, 53] },
  { key: "norway", name: "Norway", continent: "scandinavia", label: [9, 61] },
  { key: "sweden", name: "Sweden", continent: "scandinavia", label: [15, 62] },
  { key: "finland", name: "Finland", continent: "scandinavia", label: [26, 63] },
  { key: "denmark", name: "Denmark", continent: "scandinavia", label: [9.3, 56] },
  { key: "portugal", name: "Portugal", continent: "iberia", label: [-8.1, 39.5] },
  { key: "westernSpain", name: "Western Spain", continent: "iberia", label: [-5.2, 41.6] },
  { key: "easternSpain", name: "Eastern Spain", continent: "iberia", label: [-1.5, 40] },
  { key: "morocco", name: "Morocco", continent: "maghreb", label: [-5.6, 34.6] },
  { key: "algeria", name: "Algeria", continent: "maghreb", label: [3, 35.2] },
  { key: "tunisia", name: "Tunisia and Libya", continent: "maghreb", label: [9.5, 35] },
  { key: "westernFrance", name: "Western France", continent: "france", label: [0, 47] },
  { key: "easternFrance", name: "Eastern France", continent: "france", label: [4.6, 46.4] },
  { key: "lowCountries", name: "The Low Countries", continent: "france", label: [5.4, 52.3] },
  { key: "westernGermany", name: "Western Germany", continent: "centralEurope", label: [8.6, 49.9] },
  { key: "easternGermany", name: "Eastern Germany", continent: "centralEurope", label: [12.6, 52] },
  { key: "poland", name: "Poland", continent: "centralEurope" },
  { key: "czechSlovakia", name: "Czechia and Slovakia", continent: "centralEurope", label: [16.5, 49.5] },
  { key: "alps", name: "The Alps", continent: "centralEurope", label: [12.5, 47.4] },
  { key: "italy", name: "Italy", continent: "italyBalkans", label: [12.5, 42.6] },
  { key: "westernBalkans", name: "The Western Balkans", continent: "italyBalkans", label: [16.6, 44.8] },
  { key: "centralBalkans", name: "Serbia and North Macedonia", continent: "italyBalkans", label: [21.2, 43.0] },
  { key: "greece", name: "Greece", continent: "italyBalkans", label: [22, 39.5] },
  { key: "hungary", name: "Hungary", continent: "danube" },
  { key: "romania", name: "Romania and Moldova", continent: "danube", label: [25, 45.8] },
  { key: "bulgaria", name: "Bulgaria", continent: "danube" },
  { key: "baltics", name: "The Baltic States", continent: "easternEurope", label: [24.5, 56.5] },
  { key: "belarus", name: "Belarus", continent: "easternEurope" },
  { key: "westernUkraine", name: "Western Ukraine", continent: "easternEurope", label: [28, 49.3] },
  { key: "easternUkraine", name: "Eastern Ukraine", continent: "easternEurope", label: [36.5, 48.8] },
  { key: "westernRussia", name: "Western Russia", continent: "russia", label: [33, 58] },
  { key: "centralRussia", name: "Central Russia", continent: "russia", label: [46, 57] },
  { key: "volga", name: "The Volga and the Urals", continent: "russia", label: [55, 56] },
  { key: "anatolia", name: "Anatolia", continent: "anatolia", label: [33, 39] },
  { key: "caucasus", name: "The Caucasus", continent: "anatolia", label: [44.5, 41.6] },
];

/** Russia's cuts: Western Russia west of 42°E, Central Russia to 50°E, the Volga and the Urals to the map's east edge at 60°E; nothing east of it. */
const RUSSIA_CUTS = [42, 50, 60];

/**
 * Every country on this map, by its ISO code (Natural Earth's ADM0_A3 where
 * the ISO code is missing): a territory for the whole country, a function
 * asked of each polygon by its centre and whether it is the largest (`main`),
 * or a CUT (`{ at: [meridians], into: [territories west to east, null for a
 * piece left off] }`).
 */
export const EUROPE_COUNTRIES = {
  IS: "iceland",
  IE: "ireland",
  // The territories are the two islands, so Northern Ireland goes with the rest of Ireland.
  GB: ({ lon, lat, main }) => (main ? "greatBritain" : lat < 50 ? null : lon < -5.4 && lat > 54 && lat < 55.4 ? "ireland" : "greatBritain"),
  IM: "greatBritain",
  GG: "westernFrance",
  JE: "westernFrance",
  // Svalbard is north of the map, and Jan Mayen far out to sea: both left off.
  NO: ({ lon, lat }) => (lat > 71.5 || lon < 0 ? null : "norway"),
  SE: "sweden",
  FI: "finland",
  AX: "finland",
  DK: ({ lon, lat }) => (lat > 60 || lon < -10 ? null : "denmark"),
  FO: null,
  PT: ({ lon }) => (lon < -12 ? null : "portugal"),
  ES: ({ lon, lat, main }) => (main ? { at: [-3.7], into: ["westernSpain", "easternSpain"] } : lat < 30 || lon < -10 ? null : lat < 36.5 ? "easternSpain" : "easternSpain"),
  AD: "easternSpain",
  GI: "westernSpain",
  MA: "morocco",
  EH: null,
  DZ: "algeria",
  TN: "tunisia",
  LY: "tunisia",
  FR: ({ lon, lat, main }) => (main ? { at: [2.5], into: ["westernFrance", "easternFrance"] } : lon < -10 || lon > 15 || lat < 40 ? (lon > 8 && lon < 10 && lat > 41 && lat < 43.2 ? "easternFrance" : null) : "westernFrance"),
  MC: "easternFrance",
  BE: "lowCountries",
  NL: ({ lon, lat }) => (lon < -10 || lat < 40 ? null : "lowCountries"),
  LU: "lowCountries",
  DE: ({ main }) => (main ? { at: [10.5], into: ["westernGermany", "easternGermany"] } : "easternGermany"),
  PL: "poland",
  CZ: "czechSlovakia",
  SK: "czechSlovakia",
  AT: "alps",
  CH: "alps",
  LI: "alps",
  IT: "italy",
  SM: "italy",
  VA: "italy",
  MT: "italy",
  SI: "westernBalkans",
  HR: "westernBalkans",
  BA: "westernBalkans",
  ME: "westernBalkans",
  AL: "westernBalkans",
  RS: "centralBalkans",
  XK: "centralBalkans",
  MK: "centralBalkans",
  GR: "greece",
  HU: "hungary",
  RO: "romania",
  MD: "romania",
  BG: "bulgaria",
  EE: "baltics",
  LV: "baltics",
  LT: "baltics",
  BY: "belarus",
  UA: ({ main }) => (main ? { at: [33], into: ["westernUkraine", "easternUkraine"] } : "easternUkraine"),
  // Kaliningrad goes with the Baltic States it sits among; Crimea, which Natural Earth draws as Russia's, with Ukraine,
  // the country it is recognised as part of.
  RU: ({ lon, lat, main }) =>
    main
      ? { at: RUSSIA_CUTS, into: ["westernRussia", "centralRussia", "volga", null] }
      : lon < 25 && lat < 56
        ? "baltics"
        : lon > 32 && lon < 37 && lat < 46.5
          ? "easternUkraine"
          : lat > 71.5 || lon > 60
            ? null
            : lon < 42
              ? "westernRussia"
              : lon < 50
                ? "centralRussia"
                : "volga",
  TR: "anatolia",
  CY: "anatolia",
  CYN: "anatolia",
  GE: "caucasus",
  AM: "caucasus",
  AZ: "caucasus",
};

/** The sea crossings, by the two territories' keys; `from` and `to` (longitude and latitude) draw one where the nearest two coasts would draw it badly. */
export const EUROPE_SEA_LINKS = [
  ["iceland", "greatBritain"],
  ["iceland", "norway"],
  ["ireland", "greatBritain"],
  ["greatBritain", "norway"],
  ["greatBritain", "lowCountries"],
  ["greatBritain", "westernFrance"],
  ["greatBritain", "denmark"],
  ["norway", "denmark"],
  ["sweden", "denmark"],
  ["sweden", "baltics"],
  ["sweden", "poland"],
  ["finland", "baltics"],
  ["denmark", "easternGermany"],
  ["westernSpain", "morocco"],
  ["easternSpain", "algeria"],
  ["easternSpain", "italy", { from: [3.5, 40], to: [8.5, 40] }],
  ["italy", "tunisia"],
  ["italy", "greece"],
  ["romania", "anatolia", { from: [29.5, 44], to: [31.5, 41.6] }],
  ["easternUkraine", "anatolia", { from: [34, 44.6], to: [34.5, 42.2] }],
];

/** Every meridian some mainland of this map is cut along. */
export const EUROPE_CUT_MERIDIANS = [-3.7, 2.5, 10.5, 33, ...RUSSIA_CUTS];
