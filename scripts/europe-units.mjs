/**
 * WHERE EACH TERRITORY OF TENKA'S EUROPE LIES, as Natural Earth's first-level
 * units (the provinces, départements, counties and Länder of its admin-1 file,
 * public domain) given to the territory they make up. `scripts/map-europe.mjs`
 * reads this and refuses to write a map whose borders differ from the graph in
 * `scripts/europe-edges.mjs`, so every choice below is held to it.
 *
 * The territories are historical areas sized and placed as the classic Europe
 * board draws them, not modern countries: Denmark runs on down the German
 * coast to Poland's border, Venice is the Adriatic's far shore, the Kingdom of
 * Sicily is the boot, Rusland is the Ukraine. Where a modern unit is cut by an
 * area's edge, the unit is split along a straight line (`CUTS`).
 */

/** The frame of the map in longitude and latitude: what lies outside it is not drawn. The board's own edge runs from Ireland's west coast to the Caucasus, and from Africa's coast to the Arctic Circle's neighbourhood. */
export const FRAME = { west: -12, east: 44, north: 66.5, south: 31 };

/**
 * Straight cuts through a unit, each a directed line through two points
 * (longitude, latitude): what lies to its left (as the line runs from the first
 * point to the second) goes to one territory, what lies to its right to the
 * other. The coordinates are not round on purpose, so that a line never runs
 * exactly through a vertex of the data.
 */
export const CUTS = {
  /** Bavaria north of the Danube is Franconia, south of it Bavaria. */
  bavaria: { line: [[8.6013, 48.6173], [14.4017, 49.1033]], left: "franconia", right: "bavaria" },
  /** Lower Saxony west of Hamburg's longitude is Friesland's, east of it Saxony's. */
  lowerSaxony: { line: [[9.9013, 51.0011], [9.9013, 54.5013]], left: "friesland", right: "saxony" },
  /** The Karelian Isthmus and everything north of it, which would touch Finland, is left off; Leningrad's south is Novgorod's. */
  leningrad: { line: [[26.0013, 59.8011], [37.0017, 62.1013]], left: null, right: "novgorod" },
};

/** A unit's name for matching: lower case, no accents, no punctuation. */
export const plain = (name) => (name ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");

/** Sets of unit names, plain, for the countries that are shared out by name. */
const names = (list) => new Set(list.map(plain));

const GERMANY = {
  denmark: names(["Schleswig-Holstein", "Mecklenburg-Vorpommern", "Brandenburg", "Berlin"]),
  friesland: names(["Bremen", "Hamburg"]),
  saxony: names(["Sachsen-Anhalt", "Thüringen"]),
  bohemia: names(["Sachsen"]),
  lorraine: names(["Nordrhein-Westfalen", "Hessen", "Rheinland-Pfalz", "Saarland"]),
  franconia: names(["Baden-Württemberg"]),
};

const FRANCE = {
  lorraine: names(["Nord", "Pas-de-Calais", "Aisne", "Ardennes", "Marne", "Aube", "Haute-Marne", "Meuse", "Meurthe-et-Moselle", "Moselle", "Vosges", "Bas-Rhin", "Haute-Rhin"]),
  normandy: names(["Manche", "Calvados", "Orne", "Eure", "Seine-Maritime"]),
  brittany: names(["Finistère", "Côtes-d'Armor", "Morbihan", "Ille-et-Vilaine"]),
  burgundy: names([
    "Yonne", "Côte-d'Or", "Saône-et-Loire", "Nièvre", "Jura", "Doubs", "Haute-Saône", "Territoire de Belfort", "Ain", "Rhône", "Loire", "Isère", "Savoie", "Haute-Savoie",
    "Drôme", "Ardèche", "Hautes-Alpes", "Alpes-de-Haute-Provence", "Alpes-Maritimes", "Var", "Vaucluse", "Bouches-du-Rhône", "Gard", "Haute-Corse", "Corse-du-Sud",
  ]),
};

const SPAIN = {
  navarre: names(["Navarra", "Gipuzkoa", "Bizkaia", "Álava", "La Rioja", "Huesca", "Zaragoza", "Teruel"]),
  barcelona: names(["Lérida", "Gerona", "Barcelona", "Tarragona", "Baleares"]),
  valencia: names(["Castellón", "Valencia", "Alicante", "Murcia", "Albacete", "Cuenca"]),
  granada: names(["Granada", "Almería", "Málaga", "Jaén"]),
  /** Spain in Africa: left off. */
  off: names(["Ceuta", "Melilla"]),
};

const ITALY = {
  lombardy: names(["Valle d'Aosta", "Piemonte", "Lombardia", "Trentino-Alto Adige", "Liguria", "Emilia-Romagna", "Veneto"]),
  bavaria: names(["Friuli-Venezia Giulia"]),
  rome: names(["Toscana", "Umbria", "Lazio", "Marche"]),
  kingdomOfSicily: names(["Abruzzo", "Molise", "Campania", "Apulia", "Basilicata", "Calabria", "Sicily"]),
  sardinia: names(["Sardegna"]),
};

const CZECHIA = {
  highlands: names(["Vysočina", "Jihomoravský", "Olomoucký", "Zlínský", "Moravskoslezský"]),
};

const POLAND = {
  pomerania: names(["West Pomeranian", "Pomeranian", "Kuyavian-Pomeranian"]),
  prussia: names(["Warmian-Masurian", "Podlachian"]),
};

const LIBYA = {
  /** Libya beyond the Gulf of Sidra, which would be a piece of Tunisia cut off from the rest by the sea. */
  off: names(["Surt", "Ajdabiya", "Al Jabal al Akhdar", "Al Marj", "Benghazi", "Al Butnan", "Al Qubbah", "Al Kufrah"]),
};

const ROMANIA = {
  galicia: names(["Botosani", "Iasi", "Vaslui", "Galati", "Braila", "Tulcea", "Constanta", "Neamt", "Bacau", "Vrancea", "Suceava"]),
};

const UKRAINE = {
  hungary: names(["Transcarpathia"]),
  galicia: names(["L'viv", "Ivano-Frankivs'k", "Ternopil'", "Chernivtsi", "Khmel'nyts'kyy", "Vinnytsya"]),
};

const RUSSIA = {
  off: names(["Murmansk", "Karelia"]),
  prussia: names(["Kaliningrad"]),
  novgorod: names(["City of St. Petersburg", "Novgorod", "Vologda", "Arkhangel'sk", "Nenets", "Komi", "Kostroma"]),
  rusland: names(["Rostov", "Krasnodar", "Adygey", "Karachay-Cherkess", "Kabardin-Balkar", "North Ossetia", "Ingush", "Chechnya", "Dagestan", "Stavropol'", "Kalmyk", "Astrakhan'", "Volgograd", "Crimea", "Sevastopol"]),
};

/** Whichever of the sets in `table` holds the unit's name, or `fallback`. */
const inTable = (table, unit, fallback) => Object.keys(table).find((key) => table[key].has(plain(unit))) ?? fallback;

/** Countries given whole to a territory, by Natural Earth's ADM0_A3 code. */
const WHOLE = {
  IRL: "ireland", NOR: "norway", SWE: "sweden", FIN: "finland", DNK: "denmark", NLD: "friesland", BEL: "lorraine", LUX: "lorraine", PRT: "portugal",
  SMR: "rome", VAT: "rome", MLT: "kingdomOfSicily", CHE: "swabia", LIE: "swabia", AUT: "bavaria", SVK: "hungary", HUN: "hungary", MDA: "galicia",
  BLR: "polotsk", LTU: "lithuania", LVA: "lithuania", EST: "estonia", TUR: "turkey", CYP: "turkey", CYN: "turkey", GRC: "greece", BGR: "bulgaria",
  SRB: "serbia", KOS: "serbia", MKD: "serbia", ALB: "serbia", MNE: "serbia", BIH: "venice", HRV: "venice", SVN: "venice",
  MAR: "morocco", DZA: "algeria", TUN: "tunisia", AND: "barcelona", MCO: "burgundy",
};

/** Every country the map draws. */
export const COUNTRIES = new Set([...Object.keys(WHOLE), "GBR", "DEU", "FRA", "ESP", "ITA", "CZE", "POL", "LBY", "ROU", "UKR", "RUS"]);

/**
 * What one first-level unit goes to: a territory's key, `null` to leave it off the map, or `{ cut }` (a key of `CUTS`)
 * where the unit is split between two. `unit` is the unit's name, `region` its region as Natural Earth gives it and `subunit` the code of the country within a country (England, Scotland, Wales and Northern Ireland).
 */
export function territoryOf(code, unit, region, subunit) {
  if (code in WHOLE) return WHOLE[code];
  switch (code) {
    case "GBR":
      return { ENG: "england", SCT: "scotland", WLS: "wales", NIR: "ireland" }[subunit] ?? null;
    case "DEU":
      return plain(unit) === plain("Bayern") ? { cut: "bavaria" } : plain(unit) === plain("Niedersachsen") ? { cut: "lowerSaxony" } : inTable(GERMANY, unit, "lorraine");
    case "FRA":
      return inTable(FRANCE, unit, "france");
    case "ESP":
      return SPAIN.off.has(plain(unit)) ? null : inTable(SPAIN, unit, "leonCastile");
    case "ITA":
      return inTable(ITALY, region, "lombardy");
    case "CZE":
      return inTable(CZECHIA, unit, "bohemia");
    case "POL":
      return inTable(POLAND, unit, "poland");
    case "LBY":
      return LIBYA.off.has(plain(unit)) ? null : "tunisia";
    case "ROU":
      return inTable(ROMANIA, unit, "hungary");
    case "UKR":
      return inTable(UKRAINE, unit, "rusland");
    case "RUS":
      if (plain(unit) === plain("Leningrad")) return { cut: "leningrad" };
      if (RUSSIA.off.has(plain(unit))) return null;
      return inTable(RUSSIA, unit, "smolensk");
    default:
      return undefined;
  }
}
