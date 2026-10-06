# How the map is made

How Tenka's map is built from public-domain data, moved here from [the README](../README.md#the-map) to keep it under the length npm shows.

Forty-two territories, their names, their neighbours and their outlines are
built from [Natural Earth](https://www.naturalearthdata.com/)'s admin-0
countries and, for the countries too big to be one territory (the United
States, Canada, Russia, China and Australia), admin-1 provinces, states and
regions, all at 1:50m and all in the public domain, by `pnpm map`
(`scripts/map.mjs`; `scripts/map-world.mjs` lays out the territories). The map
is the classic board's as a graph: the same forty-two territories in the same
six continents, the same eighty-three pairs that touch by land or are joined
across the water, and the same continent bonuses (`scripts/classic-edges.mjs`
is the list, and the script refuses to write a map that differs from it).
Where the real world does not touch and the classic board says it does, the
two are joined by a dashed sea link, such as the Caspian, the Atlantic
(Brazil to North Africa) and the Red Sea. It is drawn in Miller's projection
from 170°W round to 192°E, 2000 by 984 units, so that Alaska and Kamchatka sit
at opposite edges with their crossing drawn off both. `src/tenkaWorld.data.ts`
and `src/tenkaShapes.data.ts` are written by that script and never by hand.
