/**
 * TENKA'S WORLD, as `scripts/map.mjs` builds it: forty-two territories in six
 * continents, laid out as the classic world-conquest board lays out the world
 * (John, 2026-10-02: "I only want equal to the original"). The names are
 * places, and who borders whom is geography, so nothing here belongs to any
 * published game; its art, wording and name are not used.
 *
 * Drawn from Natural Earth (public domain): the 1:50m admin-0 countries, and
 * for the countries too big to be one territory (the United States, Canada,
 * Russia, China, Australia) the 1:50m admin-1 provinces, states and regions,
 * so that each territory is a run of real regions with a real border to its
 * neighbours. A country this file does not list is an error; one set to `null`
 * is left off the map.
 *
 * Where the world does not touch and the classic board says it does, the two
 * are joined by a sea link (`WORLD_SEA_LINKS`): the Caspian, the Atlantic,
 * the straits. `scripts/classic-edges.mjs` is the graph itself, and the map
 * script fails when the borders drawn here and the sea links named here do not
 * make exactly that graph.
 */

/** The continents, in order. */
export const WORLD_CONTINENTS = ["northAmerica", "southAmerica", "europe", "africa", "asia", "australia"];

/** The forty-two territories in continent order. `label` places the army counter by hand, in longitude and latitude. */
export const WORLD_TERRITORIES = [
  { key: "alaska", name: "Alaska", continent: "northAmerica", label: [-152, 64.5] },
  { key: "northwestTerritory", name: "Northwest Territory", continent: "northAmerica", label: [-118, 66] },
  { key: "greenland", name: "Greenland", continent: "northAmerica" },
  { key: "alberta", name: "Alberta", continent: "northAmerica", label: [-117, 54] },
  { key: "ontario", name: "Ontario", continent: "northAmerica", label: [-88, 51.5] },
  { key: "quebec", name: "Quebec", continent: "northAmerica", label: [-71, 52] },
  { key: "westernUnitedStates", name: "Western United States", continent: "northAmerica", label: [-111, 41] },
  { key: "easternUnitedStates", name: "Eastern United States", continent: "northAmerica", label: [-88, 36] },
  { key: "centralAmerica", name: "Central America", continent: "northAmerica", label: [-100, 21] },

  { key: "venezuela", name: "Venezuela", continent: "southAmerica", label: [-66, 5] },
  { key: "peru", name: "Peru", continent: "southAmerica", label: [-71, -11] },
  { key: "brazil", name: "Brazil", continent: "southAmerica" },
  { key: "argentina", name: "Argentina", continent: "southAmerica", label: [-66, -35] },

  { key: "iceland", name: "Iceland", continent: "europe" },
  { key: "scandinavia", name: "Scandinavia", continent: "europe", label: [15, 63] },
  { key: "greatBritain", name: "Great Britain", continent: "europe", label: [-2, 53.5] },
  { key: "northernEurope", name: "Northern Europe", continent: "europe", label: [14, 50.5] },
  { key: "westernEurope", name: "Western Europe", continent: "europe", label: [1.5, 46] },
  { key: "southernEurope", name: "Southern Europe", continent: "europe", label: [21, 42.5] },
  { key: "ukraine", name: "Ukraine", continent: "europe", label: [34, 53] },

  { key: "northAfrica", name: "North Africa", continent: "africa", label: [5, 20] },
  { key: "egypt", name: "Egypt", continent: "africa", label: [30, 21] },
  { key: "eastAfrica", name: "East Africa", continent: "africa", label: [38, 3] },
  { key: "congo", name: "Congo", continent: "africa", label: [21, -2] },
  { key: "southAfrica", name: "South Africa", continent: "africa", label: [25, -20] },
  { key: "madagascar", name: "Madagascar", continent: "africa" },

  { key: "ural", name: "Ural", continent: "asia", label: [67, 55] },
  { key: "siberia", name: "Siberia", continent: "asia", label: [90, 62] },
  { key: "yakutsk", name: "Yakutsk", continent: "asia", label: [128, 65] },
  { key: "kamchatka", name: "Kamchatka", continent: "asia", label: [150, 60] },
  { key: "irkutsk", name: "Irkutsk", continent: "asia", label: [108, 55] },
  { key: "mongolia", name: "Mongolia", continent: "asia", label: [105, 46] },
  { key: "japan", name: "Japan", continent: "asia", label: [139, 36.5] },
  { key: "afghanistan", name: "Afghanistan", continent: "asia", label: [66, 39] },
  { key: "china", name: "China", continent: "asia", label: [101, 33] },
  { key: "middleEast", name: "Middle East", continent: "asia", label: [48, 31] },
  { key: "india", name: "India", continent: "asia", label: [78, 22] },
  { key: "siam", name: "Siam", continent: "asia", label: [101, 16] },

  { key: "indonesia", name: "Indonesia", continent: "australia", label: [114, -1] },
  { key: "newGuinea", name: "New Guinea", continent: "australia", label: [145, -6] },
  { key: "westernAustralia", name: "Western Australia", continent: "australia", label: [122, -25] },
  { key: "easternAustralia", name: "Eastern Australia", continent: "australia", label: [141, -26] },
];

/**
 * The countries that are cut by their own provinces, states and regions (Natural Earth's admin-1, by the country's
 * three-letter code): each region's name is given to a territory, or to null to leave it off. A function is asked of
 * each of a region's polygons by its centre (`lon`, `lat`).
 */
const names = (territory, list) => Object.fromEntries(list.map((name) => [name, territory]));
export const WORLD_REGIONS = {
  USA: {
    ...names("alaska", ["Alaska"]),
    Hawaii: null,
    // Texas and Oklahoma go with the East, so that both halves of the country touch Mexico, as the classic board has it.
    ...names("westernUnitedStates", ["Washington", "Oregon", "California", "Idaho", "Nevada", "Utah", "Arizona", "Montana", "Wyoming", "Colorado", "New Mexico", "North Dakota", "South Dakota", "Nebraska", "Kansas"]),
    default: "easternUnitedStates",
  },
  CAN: {
    ...names("northwestTerritory", ["Yukon", "Northwest Territories", "Nunavut"]),
    ...names("alberta", ["Alberta", "British Columbia", "Saskatchewan"]),
    ...names("ontario", ["Manitoba", "Ontario"]),
    ...names("quebec", ["Québec", "New Brunswick", "Nova Scotia", "Prince Edward Island", "Newfoundland and Labrador"]),
  },
  RUS: {
    ...names("ural", ["Bashkortostan", "Chelyabinsk", "Kurgan", "Yamal-Nenets", "Sverdlovsk", "Khanty-Mansiy", "Tyumen'", "Perm'", "Orenburg"]),
    ...names("siberia", ["Tomsk", "Omsk", "Altay", "Gorno-Altay", "Kemerovo", "Khakass", "Novosibirsk", "Krasnoyarsk", "Tuva"]),
    ...names("irkutsk", ["Irkutsk", "Buryat", "Chita"]),
    ...names("yakutsk", ["Sakha (Yakutia)"]),
    ...names("kamchatka", ["Kamchatka", "Chukchi Autonomous Okrug", "Maga Buryatdan", "Khabarovsk", "Amur", "Primor'ye", "Yevrey", "Sakhalin"]),
    // Everything else is European Russia, with the Caucasus: the Ukraine of this map.
    default: "ukraine",
  },
  // Manchuria and Inner Mongolia go with Mongolia and Korea, the coast across from Japan.
  CHN: { ...names("mongolia", ["Heilongjiang", "Jilin", "Liaoning", "Inner Mongol"]), default: "china" },
  AUS: { ...names("westernAustralia", ["Western Australia"]), default: "easternAustralia" },
};

/** Every other country, by its ISO code (Natural Earth's ADM0_A3 where there is none), whole to one territory, or null. A function is asked of each polygon. */
export const WORLD_COUNTRIES = {
  // North America
  GL: "greenland",
  MX: "centralAmerica", GT: "centralAmerica", BZ: "centralAmerica", HN: "centralAmerica", SV: "centralAmerica", NI: "centralAmerica", CR: "centralAmerica", PA: "centralAmerica",
  CU: "centralAmerica", JM: "centralAmerica", HT: "centralAmerica", DO: "centralAmerica", PR: "centralAmerica", BS: "centralAmerica", TT: "centralAmerica",
  // South America
  CO: "venezuela", VE: "venezuela", GY: "venezuela", SR: "venezuela",
  EC: "peru", PE: "peru", BO: "peru",
  BR: "brazil",
  AR: "argentina", CL: "argentina", UY: "argentina", PY: "argentina", FK: "argentina",
  // Europe
  GB: "greatBritain", IE: "greatBritain",
  IS: "iceland",
  NO: "scandinavia", SE: "scandinavia", FI: "scandinavia", DK: "scandinavia", AX: "scandinavia",
  FR: ({ lon, lat }) => (lon > -10 && lat > 40 ? "westernEurope" : lon < -50 && lat < 10 ? "venezuela" : null),
  ES: "westernEurope", PT: "westernEurope", BE: "westernEurope", NL: "westernEurope", LU: "westernEurope", AD: "westernEurope", MC: "westernEurope",
  DE: "northernEurope", PL: "northernEurope", CZ: "northernEurope", SK: "northernEurope", AT: "northernEurope", CH: "northernEurope", HU: "northernEurope", LI: "northernEurope",
  IT: "southernEurope", SI: "southernEurope", HR: "southernEurope", BA: "southernEurope", RS: "southernEurope", ME: "southernEurope", XK: "southernEurope",
  AL: "southernEurope", MK: "southernEurope", GR: "southernEurope", BG: "southernEurope", RO: "southernEurope", SM: "southernEurope", VA: "southernEurope", MT: "southernEurope",
  UA: "ukraine", BY: "ukraine", MD: "ukraine", LT: "ukraine", LV: "ukraine", EE: "ukraine",
  // Africa
  MA: "northAfrica", EH: "northAfrica", DZ: "northAfrica", TN: "northAfrica", LY: "northAfrica", MR: "northAfrica", ML: "northAfrica", NE: "northAfrica", TD: "northAfrica",
  CF: "northAfrica", SN: "northAfrica", GM: "northAfrica", GW: "northAfrica", GN: "northAfrica", SL: "northAfrica", LR: "northAfrica", CI: "northAfrica", BF: "northAfrica",
  GH: "northAfrica", TG: "northAfrica", BJ: "northAfrica", NG: "northAfrica",
  EG: "egypt", SD: "egypt",
  ET: "eastAfrica", ER: "eastAfrica", DJ: "eastAfrica", SO: "eastAfrica", SOL: "eastAfrica", KE: "eastAfrica", UG: "eastAfrica", RW: "eastAfrica", BI: "eastAfrica", TZ: "eastAfrica", SS: "eastAfrica",
  CM: "congo", GQ: "congo", GA: "congo", CG: "congo", CD: "congo",
  AO: "southAfrica", ZM: "southAfrica", MW: "southAfrica", MZ: "southAfrica", ZW: "southAfrica", NA: "southAfrica", BW: "southAfrica", ZA: "southAfrica", LS: "southAfrica", SZ: "southAfrica",
  MG: "madagascar",
  // Asia
  KZ: "ural",
  AF: "afghanistan", UZ: "afghanistan", TM: "afghanistan", TJ: "afghanistan", KG: "afghanistan",
  TR: "middleEast", CY: "middleEast", CYN: "middleEast", SY: "middleEast", LB: "middleEast", IL: "middleEast", PS: "middleEast", JO: "middleEast", IQ: "middleEast", IR: "middleEast",
  GE: "middleEast", AM: "middleEast", AZ: "middleEast", SA: "middleEast", YE: "middleEast", OM: "middleEast", AE: "middleEast", QA: "middleEast", KW: "middleEast", BH: "middleEast",
  IN: "india", PK: "india", NP: "india", BT: "india", BD: "india", LK: "india", KAS: "india",
  MN: "mongolia", KP: "mongolia", KR: "mongolia",
  TW: "china", HK: "china", MO: "china",
  JP: "japan",
  MM: "siam", TH: "siam", LA: "siam", KH: "siam", VN: "siam", SG: "siam",
  MY: ({ lon }) => (lon < 105 ? "siam" : "indonesia"),
  // Australia
  ID: ({ lon, lat }) => (lon >= 129.5 && lat > -9.7 ? "newGuinea" : "indonesia"),
  TL: "indonesia", BN: "indonesia", PH: "indonesia",
  PG: "newGuinea", SB: "newGuinea", VU: "newGuinea", NC: "newGuinea", FJ: "newGuinea",
  NZ: "easternAustralia",
  // Left off: a continent of ice, the far south, and the specks of ocean.
  AQ: null, TF: null, AU: null, HM: null, NF: null, GS: null, IO: null, SH: null, PN: null,
  AI: null, KY: null, BM: null, VG: null, TC: null, MS: null, VI: null, AW: null, CW: null, SX: null, MF: null, BL: null, PM: null, WF: null, PF: null,
  AG: null, DM: null, GD: null, KN: null, LC: null, VC: null, BB: null,
  JE: null, GG: null, IM: null, FO: null,
  CV: null, ST: null, KM: null, MU: null, SC: null, MV: null,
  FM: null, MH: null, MP: null, GU: null, AS: null, TO: null, WS: null, KI: null, NU: null, CK: null, NR: null, PW: null, TV: null,
};

/**
 * THE SEA LINKS: the crossings that join territories no border joins. Every
 * one is named here, so none is an accident of how two coastlines were drawn;
 * `wrap` goes off one edge of the map and on at the other, across the Bering
 * Strait, and the board tags both ends with the territory waiting on the other
 * side. Left alone, a line is drawn across the strait between the two
 * nearest coasts, lengthened to be seen. `from` and `to` pin a line's ends in
 * longitude and latitude where the nearest two coasts would draw it badly.
 * `anchors` draws the line from one territory's counter to the other's, for a
 * crossing so short that coast to coast would be a stub. `also` adds further
 * lines for the same link.
 */
export const WORLD_SEA_LINKS = [
  ["alaska", "kamchatka", { wrap: true }],
  ["northwestTerritory", "greenland"],
  ["ontario", "greenland", { from: [-87, 57], to: [-52, 61] }],
  ["quebec", "greenland"],
  ["greenland", "iceland", { from: [-26, 68.5], to: [-20, 65.5] }],
  ["iceland", "greatBritain", { from: [-14, 64.5], to: [-5.5, 58.5] }],
  ["iceland", "scandinavia", { from: [-13, 65], to: [5, 62] }],
  ["greatBritain", "scandinavia", { from: [-3, 58], to: [6, 60] }],
  ["greatBritain", "northernEurope"],
  ["greatBritain", "westernEurope"],
  ["westernEurope", "northAfrica"],
  ["southernEurope", "northAfrica"],
  ["southernEurope", "egypt"],
  ["brazil", "northAfrica"],
  ["eastAfrica", "middleEast"],
  ["madagascar", "southAfrica", { anchors: true }],
  ["madagascar", "eastAfrica", { anchors: true }],
  ["ukraine", "afghanistan"],
  ["kamchatka", "japan"],
  ["mongolia", "japan"],
  ["siam", "indonesia"],
  ["indonesia", "newGuinea", { anchors: true }],
  ["indonesia", "westernAustralia", { anchors: true }],
  ["newGuinea", "westernAustralia", { anchors: true }],
  ["newGuinea", "easternAustralia", { anchors: true }],
];

/** No meridian cuts a country here: the provinces already do. */
export const WORLD_CUT_MERIDIANS = [];
