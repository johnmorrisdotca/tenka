# The map

Forty-two territories, their names, their neighbours and their outlines are built from [Natural Earth](https://www.naturalearthdata.com/)'s public-domain 1:50m data by `pnpm map` (`scripts/map.mjs`), and are the classic board's graph: the same forty-two territories in six continents, the same eighty-three pairs that touch by land or are joined across the water, and the same continent bonuses. It is drawn in Miller's projection, 2000 by 984 units, so that Alaska and Kamchatka sit at opposite edges with their crossing drawn off both. How it is built, and the list the script holds it to, are in [docs/MAP.md](./MAP.md).

The outlines are their own entry, so code that only plays the rules never
carries them:

```ts
import { TENKA_SHAPES } from "@johnmorrisdotca/tenka/shapes";

[TENKA_SHAPES.width, TENKA_SHAPES.height]; // → [2000, 984]
TENKA_SHAPES.outlines.length; // → 42
TENKA_SHAPES.labels[0]; // → [99, 216]
```

Europe's are `TENKA_EUROPE_SHAPES`, built by `pnpm map europe` from Natural
Earth's provinces and states at 1:10m, because its territories are made of
them (`scripts/europe-units.mjs` gives each province to its territory, and
`scripts/map-europe.mjs` draws them), into `src/tenkaEurope.data.ts` and
`src/tenkaEuropeShapes.data.ts`.

`TENKA_SHAPES` has each territory's `outlines` (one SVG path), where its
counter stands (`labels`), its extent (`boxes`), the dashed `seaLines`, the
links that go off one edge and on at the other (`wraps`), and the
`continentBorders`, one path drawn heavier.

