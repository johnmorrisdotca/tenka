/*
 * WRITTEN BY scripts/map.mjs, NEVER BY HAND: run it again to change the map.
 * From Natural Earth's admin-0 countries at 1:50m, which is in the public domain
 * (naturalearthdata.com; https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson).
 */
import type { TenkaTerritoryData } from "./tenka.types.ts";

/** Tenka's Europe, thirty-seven territories in region order: each one's key, name, region, and neighbours by land and by sea (indices into this list). */
export const TENKA_EUROPE_TERRITORY_DATA: readonly TenkaTerritoryData[] = [
  { key: "iceland", name: "Iceland", continent: "britishIsles", land: [], sea: [2, 3] },
  { key: "ireland", name: "Ireland", continent: "britishIsles", land: [], sea: [2] },
  { key: "greatBritain", name: "Great Britain", continent: "britishIsles", land: [], sea: [0, 1, 3, 6, 13, 15] },
  { key: "norway", name: "Norway", continent: "scandinavia", land: [4, 5, 32], sea: [0, 2, 6] },
  { key: "sweden", name: "Sweden", continent: "scandinavia", land: [3, 5], sea: [6, 18, 28] },
  { key: "finland", name: "Finland", continent: "scandinavia", land: [3, 4, 32], sea: [28] },
  { key: "denmark", name: "Denmark", continent: "scandinavia", land: [16], sea: [2, 3, 4, 17] },
  { key: "portugal", name: "Portugal", continent: "iberia", land: [8], sea: [] },
  { key: "westernSpain", name: "Western Spain", continent: "iberia", land: [7, 9], sea: [10] },
  { key: "easternSpain", name: "Eastern Spain", continent: "iberia", land: [8, 13, 14], sea: [11, 21] },
  { key: "morocco", name: "Morocco", continent: "maghreb", land: [11], sea: [8] },
  { key: "algeria", name: "Algeria", continent: "maghreb", land: [10, 12], sea: [9] },
  { key: "tunisia", name: "Tunisia and Libya", continent: "maghreb", land: [11], sea: [21] },
  { key: "westernFrance", name: "Western France", continent: "france", land: [9, 14], sea: [2] },
  { key: "easternFrance", name: "Eastern France", continent: "france", land: [9, 13, 15, 16, 20, 21], sea: [] },
  { key: "lowCountries", name: "The Low Countries", continent: "france", land: [14, 16], sea: [2] },
  { key: "westernGermany", name: "Western Germany", continent: "centralEurope", land: [6, 14, 15, 17, 20], sea: [] },
  { key: "easternGermany", name: "Eastern Germany", continent: "centralEurope", land: [16, 18, 19, 20], sea: [6] },
  { key: "poland", name: "Poland", continent: "centralEurope", land: [17, 19, 28, 29, 30], sea: [4] },
  { key: "czechSlovakia", name: "Czechia and Slovakia", continent: "centralEurope", land: [17, 18, 20, 25, 30], sea: [] },
  { key: "alps", name: "The Alps", continent: "centralEurope", land: [14, 16, 17, 19, 21, 22, 25], sea: [] },
  { key: "italy", name: "Italy", continent: "italyBalkans", land: [14, 20, 22], sea: [9, 12, 24] },
  { key: "westernBalkans", name: "The Western Balkans", continent: "italyBalkans", land: [20, 21, 23, 24, 25], sea: [] },
  { key: "centralBalkans", name: "Serbia and North Macedonia", continent: "italyBalkans", land: [22, 24, 25, 26, 27], sea: [] },
  { key: "greece", name: "Greece", continent: "italyBalkans", land: [22, 23, 27, 35], sea: [21] },
  { key: "hungary", name: "Hungary", continent: "danube", land: [19, 20, 22, 23, 26, 30], sea: [] },
  { key: "romania", name: "Romania and Moldova", continent: "danube", land: [23, 25, 27, 30], sea: [35] },
  { key: "bulgaria", name: "Bulgaria", continent: "danube", land: [23, 24, 26, 35], sea: [] },
  { key: "baltics", name: "The Baltic States", continent: "easternEurope", land: [18, 29, 32], sea: [4, 5] },
  { key: "belarus", name: "Belarus", continent: "easternEurope", land: [18, 28, 30, 32], sea: [] },
  { key: "westernUkraine", name: "Western Ukraine", continent: "easternEurope", land: [18, 19, 25, 26, 29, 31, 32], sea: [] },
  { key: "easternUkraine", name: "Eastern Ukraine", continent: "easternEurope", land: [30, 32], sea: [35] },
  { key: "westernRussia", name: "Western Russia", continent: "russia", land: [3, 5, 28, 29, 30, 31, 33, 36], sea: [] },
  { key: "centralRussia", name: "Central Russia", continent: "russia", land: [32, 34, 36], sea: [] },
  { key: "volga", name: "The Volga and the Urals", continent: "russia", land: [33], sea: [] },
  { key: "anatolia", name: "Anatolia", continent: "anatolia", land: [24, 27, 36], sea: [26, 31] },
  { key: "caucasus", name: "The Caucasus", continent: "anatolia", land: [32, 33, 35], sea: [] },
];
