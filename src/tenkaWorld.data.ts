/*
 * WRITTEN BY scripts/map.mjs, NEVER BY HAND: run it again to change the map.
 * From Natural Earth's admin-0 countries and admin-1 provinces, states and regions at 1:50m, which is in the public domain
 * (naturalearthdata.com; https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson; https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_1_states_provinces.geojson).
 */
import type { TenkaTerritoryData } from "./tenka.types.ts";

/** Tenka's forty-two territories in continent order: each one's key, name, continent, and neighbours by land and by sea (indices into this list). */
export const TENKA_TERRITORY_DATA: readonly TenkaTerritoryData[] = [
  { key: "alaska", name: "Alaska", continent: "northAmerica", land: [1, 3], sea: [29] },
  { key: "northwestTerritory", name: "Northwest Territory", continent: "northAmerica", land: [0, 3, 4], sea: [2] },
  { key: "greenland", name: "Greenland", continent: "northAmerica", land: [], sea: [1, 4, 5, 13] },
  { key: "alberta", name: "Alberta", continent: "northAmerica", land: [0, 1, 4, 6], sea: [] },
  { key: "ontario", name: "Ontario", continent: "northAmerica", land: [1, 3, 5, 6, 7], sea: [2] },
  { key: "quebec", name: "Quebec", continent: "northAmerica", land: [4, 7], sea: [2] },
  { key: "westernUnitedStates", name: "Western United States", continent: "northAmerica", land: [3, 4, 7, 8], sea: [] },
  { key: "easternUnitedStates", name: "Eastern United States", continent: "northAmerica", land: [4, 5, 6, 8], sea: [] },
  { key: "centralAmerica", name: "Central America", continent: "northAmerica", land: [6, 7, 9], sea: [] },
  { key: "venezuela", name: "Venezuela", continent: "southAmerica", land: [8, 10, 11], sea: [] },
  { key: "peru", name: "Peru", continent: "southAmerica", land: [9, 11, 12], sea: [] },
  { key: "brazil", name: "Brazil", continent: "southAmerica", land: [9, 10, 12], sea: [20] },
  { key: "argentina", name: "Argentina", continent: "southAmerica", land: [10, 11], sea: [] },
  { key: "iceland", name: "Iceland", continent: "europe", land: [], sea: [2, 14, 15] },
  { key: "scandinavia", name: "Scandinavia", continent: "europe", land: [16, 19], sea: [13, 15] },
  { key: "greatBritain", name: "Great Britain", continent: "europe", land: [], sea: [13, 14, 16, 17] },
  { key: "northernEurope", name: "Northern Europe", continent: "europe", land: [14, 17, 18, 19], sea: [15] },
  { key: "westernEurope", name: "Western Europe", continent: "europe", land: [16, 18], sea: [15, 20] },
  { key: "southernEurope", name: "Southern Europe", continent: "europe", land: [16, 17, 19, 35], sea: [20, 21] },
  { key: "ukraine", name: "Ukraine", continent: "europe", land: [14, 16, 18, 26, 35], sea: [33] },
  { key: "northAfrica", name: "North Africa", continent: "africa", land: [21, 22, 23], sea: [11, 17, 18] },
  { key: "egypt", name: "Egypt", continent: "africa", land: [20, 22, 35], sea: [18] },
  { key: "eastAfrica", name: "East Africa", continent: "africa", land: [20, 21, 23, 24], sea: [25, 35] },
  { key: "congo", name: "Congo", continent: "africa", land: [20, 22, 24], sea: [] },
  { key: "southAfrica", name: "South Africa", continent: "africa", land: [22, 23], sea: [25] },
  { key: "madagascar", name: "Madagascar", continent: "africa", land: [], sea: [22, 24] },
  { key: "ural", name: "Ural", continent: "asia", land: [19, 27, 33, 34], sea: [] },
  { key: "siberia", name: "Siberia", continent: "asia", land: [26, 28, 30, 31, 34], sea: [] },
  { key: "yakutsk", name: "Yakutsk", continent: "asia", land: [27, 29, 30], sea: [] },
  { key: "kamchatka", name: "Kamchatka", continent: "asia", land: [28, 30, 31], sea: [0, 32] },
  { key: "irkutsk", name: "Irkutsk", continent: "asia", land: [27, 28, 29, 31], sea: [] },
  { key: "mongolia", name: "Mongolia", continent: "asia", land: [27, 29, 30, 34], sea: [32] },
  { key: "japan", name: "Japan", continent: "asia", land: [], sea: [29, 31] },
  { key: "afghanistan", name: "Afghanistan", continent: "asia", land: [26, 34, 35, 36], sea: [19] },
  { key: "china", name: "China", continent: "asia", land: [26, 27, 31, 33, 36, 37], sea: [] },
  { key: "middleEast", name: "Middle East", continent: "asia", land: [18, 19, 21, 33, 36], sea: [22] },
  { key: "india", name: "India", continent: "asia", land: [33, 34, 35, 37], sea: [] },
  { key: "siam", name: "Siam", continent: "asia", land: [34, 36], sea: [38] },
  { key: "indonesia", name: "Indonesia", continent: "australia", land: [], sea: [37, 39, 40] },
  { key: "newGuinea", name: "New Guinea", continent: "australia", land: [], sea: [38, 40, 41] },
  { key: "westernAustralia", name: "Western Australia", continent: "australia", land: [41], sea: [38, 39] },
  { key: "easternAustralia", name: "Eastern Australia", continent: "australia", land: [40], sea: [39] },
];
