# Architecture: the source tree

The file-by-file tree of Tenka's source, from [the README's Architecture section](../README.md#architecture). A test holds this tree to the files under `src/`, so it cannot fall behind the code.

The rules, the map and the computer player are plain functions over plain data
with no DOM: a game is a value, and every move returns the next one. Drawing
the map is its own entry (`/ui` for plain DOM, `/element` for a tag, `/react`
for React, `/shapes` for the outlines), so a page that only wants the rules loads none of it.
Drawing the table's dice and cards with Korokoro and Toranpu is `/dressing`, the one entry that imports another package.
Dressing the table's dice and cards in the family's own is `/dressing`, the one entry that reaches another package.

```text
src/
├── element-define.ts          the "/element/define" entry: defines <tenka-table> on the page by being imported
├── dressing.ts                the "/dressing" entry: the table's dice drawn by Korokoro and its cards by Toranpu, the one place either is imported
├── dressingCards.ts           Tenka's cards as a Toranpu design: a territory's own outline, its name and its army's symbol
├── element.ts                 the "/element" entry: the <tenka-table> element, a whole table in a tag
├── index.ts                   the main entry: the rules, the map, saving and the computer player, with no DOM
├── react.tsx                  the "/react" entry: a map to draw in React
├── shapes.ts                  the "/shapes" entry: how the world and Europe are drawn, as outlines
├── strings.ts                 every word Tenka shows a person, in English and Japanese
├── tenka.constants.ts         the numbers Tenka is played by: armies, trades, lengths of a game
├── tenka.ts                   the rules, nothing else: the classic world-conquest game for two to six players
├── tenka.types.ts             the game, its moves and its map, as the rules speak of them
├── tenkaCards.ts              the cards won by a conquest, and the sets that trade for armies
├── tenkaDaily.ts              one seed a day, the same for everybody
├── tenkaDice.ts               the dice and the seeded random they are thrown with
├── tenkaEurope.data.ts        Europe's forty-nine territories and neighbours, written by scripts/map-europe.mjs
├── tenkaEuropeShapes.data.ts  Europe's outlines, written by scripts/map-europe.mjs
├── tenkaExport.ts             a game written out as JSON, plain text or CSV
├── tenkaKeep.ts               a game as short text to keep, and read back by playing its moves again
├── tenkaMap.ts                the world as the rules read it: territories, neighbours, continents and their bonuses
├── tenkaMoves.ts              every move the player to move may make now
├── tenkaPolicy.ts             the computer player: a sensible random one, which a test plays whole games with
├── tenkaShapes.data.ts        the world's outlines, written by scripts/map.mjs
├── tenkaStart.ts              dealing a new game from a seed, and which tables are offered
├── tenkaTaps.ts               what a tap on the map means in each part of a turn, and what it lights up
├── tenkaTurn.ts               how a turn begins and ends, and how a game is counted
├── tenkaWorld.data.ts         the world's territories and neighbours, written by scripts/map.mjs from public-domain map data
├── ui.ts                      the "/ui" entry: Tenka drawn and played in the browser, in plain DOM
├── version.ts                 the version of this package, as package.json has it
└── ui/  the table that draws and plays a game
    ├── colours.ts   the colours a table is drawn in
    ├── dressing.types.ts  what a table asks a dressing for, and what it gets back: a die, a card, a back
    ├── mapModel.ts  which outlines draw which map, and which territory an arrow key moves to
    ├── mount.ts     the table itself: mounting it on a page, and the options it takes
    ├── style.ts     the table's own styles, every colour a CSS variable so a page can re-colour it
    └── svg.ts       small helpers that build the map's SVG
```

Tests sit beside the code they test (`*.test.ts`). `scripts/` makes the map
data from public-domain outlines, builds the demo and checks the package as
npm packs it, `demo/` is the page published on GitHub Pages, and `table/`
taps it in real browsers.
