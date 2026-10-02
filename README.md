<h1 align="center">Tenka <sub>天下</sub></h1>

<p align="center"><strong>A world conquest board game for two to six, on a map of the real world.</strong><br>
The rules as pure, seeded TypeScript, a computer player, a game that saves and replays, and a table to play on in React, Vue, Svelte, Angular or plain HTML.</p>

<p align="center">
  <a href="https://github.com/johnmorrisdotca/tenka/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/johnmorrisdotca/tenka/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://www.npmjs.com/package/@johnmorrisdotca/tenka"><img alt="npm" src="https://img.shields.io/npm/v/@johnmorrisdotca/tenka?color=2f5d4a"></a>
  <a href="./LICENSE"><img alt="MIT licence" src="https://img.shields.io/badge/licence-MIT-2f5d4a"></a>
  <img alt="No dependencies" src="https://img.shields.io/badge/dependencies-0-2f5d4a">
  <img alt="TypeScript" src="https://img.shields.io/badge/types-TypeScript-3178c6">
</p>

<p align="center"><a href="https://johnmorrisdotca.github.io/tenka/"><strong>Play a game →</strong></a> · <a href="https://johnmorrisdotca.github.io/tenka/api.html">API reference</a></p>

<p align="center">
  <img src="docs/desktop.jpg" alt="A game of three on the map of the world, under the demo's header with its language chooser, five cloth patches and Help switch: the set-up choices, an attack from Brazil begun, the players with their lands and armies, and the record of the game beside the map" width="720">
  <img src="docs/phone.jpg" alt="Europe close up on a phone in dark mode, in Japanese: the zoom buttons with Europe chosen, the map with its sea routes dashed, and under it the players and the record of the game" width="220">
</p>

A strategy board game engine for the game of world conquest: place armies,
attack your neighbours with dice, trade sets of cards for more armies, and
take the world, or hold the most of it when the last round is counted. People
who know Risk will know how to play.

- **What is different.** A game is a value, and every shuffle, deal and die is
  drawn from the game's own seed. So a whole game is its seed and its moves: a
  few kilobytes that replay exactly, on any machine, and that nobody can
  reload to roll again. The map is the real world, drawn from public-domain
  data, and the table is finished: continent views, sea routes, a computer
  player, a written record.
- **What it costs a project.** Nothing: no dependencies, and one import.

## Play in 30 seconds

```sh
npm install @johnmorrisdotca/tenka    # or pnpm add, or yarn add
```

```ts
import { playTenka, sensibleTenkaMove, startTenka, tenkaOver, tenkaToText } from "@johnmorrisdotca/tenka";

let game = startTenka(10, ["Ann", "Ben", "Cho"], 2026)!;   // ten rounds, three players, seed 2026
while (!tenkaOver(game)) game = playTenka(game, sensibleTenkaMove(game, Math.random))!;

game.phase; // → "over"
game.winners;        // the seats that won, such as [1]
tenkaToText(game);   // "Tenka: Ann, Ben, Cho; 10 rounds; seed 2026\nRound 1\nBen places 4 on …"
```

And a table to play on, against the computer, in a page:

```js
import { mountTenka } from "@johnmorrisdotca/tenka/ui";

mountTenka(document.getElementById("table"), { players: ["You", "Kaze", "Yama"], rounds: 10 });
```

Or with nothing to install, [play a game in the demo](https://johnmorrisdotca.github.io/tenka/).

## Who it is for

- **Games sites and apps.** A finished game of world conquest to put on a
  page: the table in one call, or the rules under a board of your own.
- **Anybody building a Risk-like game.** The turn structure, the dice, the
  cards and their rising value, knocking a player out and taking their cards,
  all tested, with every legal move listed for you.
- **Multiplayer and play by post.** A move is a short list (`["a", 0, 1, 3]`),
  and the dice come from the seed, so every device at a table plays the same
  game from the same moves and no server has to roll.
- **Writers of computer players.** `tenkaMoves(game)` lists what may be played,
  `playTenka` returns the next game and leaves the one it was given alone, and
  a seeded random makes a whole match repeatable.
- **Teaching.** Dice odds, pure functions, a state machine you can read, and a
  map drawn from real data.

Risk is a trademark of Hasbro, Inc. Tenka is not affiliated with or endorsed
by its owner. It is its own game: its own map, its own names, its own words,
and the numbers of play the genre shares.

## Use it in your project

Tenka is five things, each usable without the others: **the rules**, plain
functions over a plain game value; **the map's shapes**, as SVG paths; **a
table** you mount into any element; **the same table as a tag**,
`<tenka-table>`, for a page with no script of its own; and **React
components** for the map and the table.

### 1. The API alone

```ts
import { playTenka, startTenka, tenkaMoves, TENKA_TERRITORIES } from "@johnmorrisdotca/tenka";

const game = startTenka(10, ["Ann", "Ben", "Cho"], 2026)!;
game.toPlay; // → 1
game.phase; // → "reinforce"
game.reserve; // → 4
tenkaMoves(game).length; // → 28

TENKA_TERRITORIES[1]!.name; // → "Northwest Territory"
game.owners[1]; // → 1
const next = playTenka(game, { kind: "place", territory: 1, armies: 4 })!;
next.armies[1]; // → 7
next.phase; // → "attack"
game.armies[1]; // → 3

playTenka(next, { kind: "attack", from: 0, to: 1, dice: 3 }); // → null
```

Seat 1, Ben, drew the first turn. The game given is never changed: `next` is a
new game, and `game` still has three armies on Northwest Territory. A move the
rules refuse is `null`: Alaska is not Ben's to attack from.

### 2. The table, in plain HTML

```html
<div id="table"></div>
<p id="moves">0</p>
<script type="module">
  import { mountTenka } from "@johnmorrisdotca/tenka/ui";

  mountTenka(document.getElementById("table"), {
    players: ["You", "Kaze", "Yama"],
    rounds: 10,
    onChange: (game) => (document.getElementById("moves").textContent = game.moves.length),
  });
</script>
```

Without a bundler, import from the files as they are published:
`./node_modules/@johnmorrisdotca/tenka/dist/ui.js`, or a copy of `dist/`.

### 3. As a tag

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/tenka@1/dist/element-define.js"></script>

<tenka-table players="You, Kaze, Yama" rounds="10" seed="2026"></tenka-table>
<tenka-table players="Ann, Ben, Cho" computers="none" map="europe"></tenka-table>
```

The first is a game against two computers, dealt from a seed; the second is
three people taking turns on one device, on the map of Europe. A table in a
tag needs no framework and no bundler, and a page with a framework can use it
the same way. Every attribute is listed under [The element](#the-element); the
table fires `tenka-change` after each move.

### 4. React

```jsx
import { useState } from "react";
import { TenkaTable } from "@johnmorrisdotca/tenka/react";

export function App() {
  const [moves, setMoves] = useState(0);
  return (
    <>
      <TenkaTable players={["You", "Kaze", "Yama"]} rounds={10} onChange={(game) => setMoves(game.moves.length)} />
      <p id="moves">{moves}</p>
    </>
  );
}
```

`TenkaTable` takes the table's options as props, plus any attribute for its
`<div>`. It mounts in the browser after the first render, so server rendering
draws an empty box and nothing needs a provider. In Next.js, use it from a
client component (`"use client"`). `TenkaMap` is the map alone, for a table of
your own: see [The React components](#the-react-components).

### 5. Vue

```vue
<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { mountTenka } from "@johnmorrisdotca/tenka/ui";

const box = ref(null);
const moves = ref(0);
let table;
onMounted(() => {
  table = mountTenka(box.value, { players: ["You", "Kaze", "Yama"], rounds: 10, onChange: (game) => (moves.value = game.moves.length) });
});
onBeforeUnmount(() => table?.destroy());
</script>

<template>
  <div ref="box"></div>
  <p id="moves">{{ moves }}</p>
</template>
```

### 6. Svelte

```svelte
<script>
  import { onMount } from "svelte";
  import { mountTenka } from "@johnmorrisdotca/tenka/ui";

  let box;
  let moves = $state(0);
  onMount(() => {
    const table = mountTenka(box, { players: ["You", "Kaze", "Yama"], rounds: 10, onChange: (game) => (moves = game.moves.length) });
    return () => table.destroy();
  });
</script>

<div bind:this={box}></div>
<p id="moves">{moves}</p>
```

### 7. Angular

```typescript
import { Component, ElementRef, OnDestroy, afterNextRender, provideZonelessChangeDetection, signal, viewChild } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { mountTenka, type TenkaTableHandle } from "@johnmorrisdotca/tenka/ui";

@Component({
  selector: "app-root",
  template: `<div #box></div><p id="moves">{{ moves() }}</p>`,
})
class App implements OnDestroy {
  private box = viewChild.required<ElementRef<HTMLElement>>("box");
  private table?: TenkaTableHandle;
  moves = signal(0);
  constructor() {
    afterNextRender(() => {
      this.table = mountTenka(this.box().nativeElement, { players: ["You", "Kaze", "Yama"], rounds: 10, onChange: (game) => this.moves.set(game.moves.length) });
    });
  }
  ngOnDestroy() {
    this.table?.destroy();
  }
}

bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] });
```

Each of the six is taken from this page as it is written, built from the
packed tarball in a project of its own, and played by a tap on the map in
Chromium and WebKit, by `scripts/check-frameworks.mjs`, before a release names
it.

### What a developer gets

- **Typed results.** TypeScript types for everything, with a doc comment on
  every export, which a test holds.
- **A game you can keep.** `tenkaToJSON` and `tenkaFromJSON`, plain text and
  CSV; what is read back is played through the rules again, never trusted.
- **No dependencies**, ES modules, a `default` export condition so that
  `require()` loads it too (Node 22 and later), and a `sideEffects` list that
  names only the file that defines the tag, so a bundler drops what you do not
  import.
- **Sizes.** The rules, the computer player and keeping a game are about 17 kB
  minified (6 kB gzipped) once a bundler has shaken the rest out; the whole
  main entry, with both languages and the exports, is 37 kB (12 kB). The
  table is 120 kB (39 kB), of which the map's outlines are 69 kB (21 kB). The
  outlines are their own entry, `/shapes`, so code that only plays the rules
  never carries them.
- **Where it runs.** Current Chrome, Edge, Firefox and Safari, on a desk or a
  phone. The rules have no DOM in them and run in Node 22 and later, Deno,
  Bun and web workers.

## Architecture

The rules, the map and the computer player are plain functions over plain data
with no DOM: a game is a value, and every move returns the next one. Drawing
the map is its own entry (`/ui` for plain DOM, `/element` for a tag, `/react`
for React, `/shapes` for the outlines), so a page that only wants the rules loads none of it.

```text
src/
├── element-define.ts          the "/element/define" entry: defines <tenka-table> on the page by being imported
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
    ├── mapModel.ts  which outlines draw which map, and which territory an arrow key moves to
    ├── mount.ts     the table itself: mounting it on a page, and the options it takes
    ├── style.ts     the table's own styles, every colour a CSS variable so a page can re-colour it
    └── svg.ts       small helpers that build the map's SVG
```

Tests sit beside the code they test (`*.test.ts`). `scripts/` makes the map
data from public-domain outlines, builds the demo and checks the package as
npm packs it, `demo/` is the page published on GitHub Pages, and `table/`
taps it in real browsers.

## The name

*Tenka* (天下) is Japanese for "all under heaven": the whole realm, the world.
It is written with the characters for heaven (天) and below (下), and said in
two beats, *ten-ka*. *Tenka-tori* (天下取り), "taking the realm", is what the
warlords of Japan's sixteenth century set out to do, and it is the aim of the
game.

## Where it comes from, and where it is used

Tenka was built for [Itsutsu](https://itsutsu.com), a site for board games,
puzzles, card games and dice games played at your own pace. *Itsutsu* (五つ) is
Japanese for "five", after five in a row, the game the site began with. Its
party games wanted one that a table of six could play round one phone, and
across several, and this is [the Tenka played there](https://itsutsu.com/games/tenka).

### Used by

- [Itsutsu](https://itsutsu.com), for its game of Tenka: its rules, its
  computer player and its map.

That is the whole list so far. Using Tenka in something? Open an
[*Add my project*](https://github.com/johnmorrisdotca/tenka/issues/new?template=add-my-project.md)
issue and we will add you.

### The family

<!-- family:start (made by scripts/family-readme.mjs from scripts/family-template.mjs; change those, not this) -->
Tenka is one of nineteen packages, each made for the same site, each at
[github.com/johnmorrisdotca](https://github.com/johnmorrisdotca). The code of every one is MIT.

- [Korokoro](https://github.com/johnmorrisdotca/korokoro) (コロコロ): dice, with notation, exact odds, real sounds and the dice of many games. [Demo](https://johnmorrisdotca.github.io/korokoro/).
- [Kyuubu](https://github.com/johnmorrisdotca/kyuubu) (キューブ): a turning cube for the browser, 2×2 to 7×7, with record solves to replay. [Demo](https://johnmorrisdotca.github.io/kyuubu/).
- [Hitotsu](https://github.com/johnmorrisdotca/hitotsu) (一つ): a colour-card shedding game for two to eight, with the house rules people play. [Demo](https://johnmorrisdotca.github.io/hitotsu/).
- [Toranpu](https://github.com/johnmorrisdotca/toranpu) (トランプ): a deck of playing cards, card games with computer players, and solitaires. [Demo](https://johnmorrisdotca.github.io/toranpu/).
- [Tane](https://github.com/johnmorrisdotca/tane) (種): seeded random numbers and daily seeds, the same in every browser and on every server. [Demo](https://johnmorrisdotca.github.io/tane/).
- [Narabe](https://github.com/johnmorrisdotca/narabe) (並べ): one rules engine for abstract board games, from gomoku and Reversi to Go and checkers. [Demo](https://johnmorrisdotca.github.io/narabe/).
- [Tenka](https://github.com/johnmorrisdotca/tenka) (天下): world conquest for two to six, on a map of the real world. [Demo](https://johnmorrisdotca.github.io/tenka/).
- [Kumimoji](https://github.com/johnmorrisdotca/kumimoji) (組み文字): a crossword tile race, in English and Japanese kana. [Demo](https://johnmorrisdotca.github.io/kumimoji/).
- [Tsunagi](https://github.com/johnmorrisdotca/tsunagi) (繋ぎ): a line-joining logic puzzle whose every level has exactly one answer. [Demo](https://johnmorrisdotca.github.io/tsunagi/).
- [Jarajara](https://github.com/johnmorrisdotca/jarajara) (ジャラジャラ): mahjong tiles drawn as SVG, stacked layouts, and the matching solitaire Awase. [Demo](https://johnmorrisdotca.github.io/jarajara/).
- [Suido](https://github.com/johnmorrisdotca/suido) (水道): a pipe puzzle: turn the pieces until the water reaches every drain. [Demo](https://johnmorrisdotca.github.io/suido/).
- [Domino](https://github.com/johnmorrisdotca/domino) (ドミノ): dominoes and Mexican Train. [Demo](https://johnmorrisdotca.github.io/domino/).
- [Kotoba](https://github.com/johnmorrisdotca/kotoba) (言葉): word lists and word-game rules in English, French, German and Japanese. [Demo](https://johnmorrisdotca.github.io/kotoba/).
- [Sugoroku](https://github.com/johnmorrisdotca/sugoroku) (双六): backgammon and its variants, with the doubling cube and match play. [Demo](https://johnmorrisdotca.github.io/sugoroku/).
- [Kazu](https://github.com/johnmorrisdotca/kazu) (数): grid number puzzles: Sudoku and its variants, Futoshiki and Skyscrapers. [Demo](https://johnmorrisdotca.github.io/kazu/).
- [Meikyuu](https://github.com/johnmorrisdotca/meikyuu) (迷宮): mazes on squares, hexagons, triangles and circles, made from a seed and drawn through with a finger or the mouse. [Demo](https://johnmorrisdotca.github.io/meikyuu/).
- [Hikidashi](https://github.com/johnmorrisdotca/hikidashi) (引き出し): a drawer of small Japanese text tools: era dates, kanji numerals, readings and sentence difficulty. [Demo](https://johnmorrisdotca.github.io/hikidashi/).
- [Chizu](https://github.com/johnmorrisdotca/chizu) (地図): maps of the world and of countries' regions, in English and Japanese, with a quiz and callouts. [Demo](https://johnmorrisdotca.github.io/chizu/).
- [Bushu](https://github.com/johnmorrisdotca/bushu) (部首): find a kanji by the parts it is made of. [Demo](https://johnmorrisdotca.github.io/bushu/).

**This package is Tenka.** The demos of all nineteen share one header and footer, so each links the rest.
<!-- family:end -->

## Features

- **The rules as plain functions.** `startTenka` deals a game, `playTenka`
  makes a move and returns the next game, or `null` for a move the rules
  refuse. Nothing is changed in place, and nothing touches the DOM, a clock or
  `Math.random`.
- **Seeded.** Every shuffle, deal and die is drawn from the game's own random,
  so a game replays exactly from its seed and its moves.
- **Two to six players.** A game of two is joined by a neutral army that holds
  a third of the world and only defends.
- **Three lengths.** Ten rounds, twenty, or the whole world: played to the
  last player standing, and counted after sixty rounds if nobody is.
- **A computer player.** `sensibleTenkaMove` trades when it can, piles armies
  on a border, attacks only with the odds and fortifies to the front.
- **Every move listed.** `tenkaMoves(game)` is what the player to move may do.
- **A map of the real world.** Forty-two territories in six continents,
  drawn from Natural Earth, joined as the classic board joins them: the same
  eighty-three pairs, by land and by sea, and the same continent bonuses. The
  crossing from Alaska to Kamchatka is drawn off both edges.
- **A table to play on.** The whole world or one continent at a tap, sea
  routes dashed, the dice of the last throw, the players and their cards, and
  the record of the game. Against the computer, or passed round one device.
- **A tag.** `<tenka-table>` is the whole table in one element, with no
  framework.
- **One game a day.** `tenkaDailySeed(new Date())` is the same seed for
  everybody, worldwide.
- **Played from a keyboard.** Arrow keys between territories, Enter or Space to
  tap; see [Accessibility](#accessibility).
- **Export and import.** JSON that reads back in, plain text, and CSV.
- **English and Japanese**, and any other language by a table of your own.
- **Themeable.** Every colour is a CSS variable, light and dark.

## The rules it plays

A turn has three parts. **Reinforce**: take one army for every three
territories you hold, never fewer than three, plus the bonus of every
continent you hold whole, and place them on your territories. **Attack**, as
often as you like: from a territory of yours with two armies or more, on a
neighbour somebody else holds. The attacker throws up to three dice (one
fewer than the armies there), the defender up to two; the highest of each
side are compared, then the next highest; the higher die wins its pair and a
tie goes to the defender; each lost pair is one army. Take a territory and you
move in at least as many armies as the dice you threw. **Fortify**: one move
of armies between two of your territories joined through your own land, or
none.

A turn that took a territory ends with a card. Three cards that make a set
(three of a kind, one of each kind, or any two with a wild card) are traded
for armies while reinforcing, and the sets rise in value as the game goes on.
With five cards or more you must trade. Take a player's last territory and
they are out, and their cards are yours.

The game ends when one player holds the world, or at the end of its last
round, when the player holding the most territories wins, the most armies
breaking a tie, and a tie on both shared.

| Rule | Value | Constant |
| --- | --- | --- |
| Players | 2 to 6 | `TENKA_FEWEST_PLAYERS`, `TENKA_MOST_PLAYERS` |
| Starting armies, for 2, 3, 4, 5 and 6 players | 40, 35, 30, 25, 20 | `TENKA_STARTING_ARMIES` |
| Armies a turn brings | 1 for every 3 territories, 3 at least | `TENKA_TERRITORIES_PER_ARMY`, `TENKA_LEAST_REINFORCEMENT` |
| Dice | up to 3 attacking, up to 2 defending | `TENKA_ATTACK_DICE`, `TENKA_DEFEND_DICE` |
| Cards | 42, one for each territory, and 2 wild | `TENKA_DECK`, `TENKA_WILD_CARDS` |
| What a set is worth | 4, 6, 8, 10, 12, 15, then 5 more each time | `TENKA_TRADE_VALUES`, `TENKA_TRADE_STEP` |
| A card of the set showing a territory you hold | 2 more armies, placed there | `TENKA_TERRITORY_CARD_BONUS` |
| You must trade with | 5 cards or more | `TENKA_MUST_TRADE_AT` |
| Lengths of game, in rounds | 10, 20, 60 | `TENKA_LENGTHS`: `TENKA_SHORT_ROUNDS`, `TENKA_MEDIUM_ROUNDS`, `TENKA_WORLD_ROUNDS` |

### The continents

| Continent | Territories | Ways in | Armies for holding it | Key |
| --- | --- | --- | --- | --- |
| North America | 9 | 3 | 5 | `northAmerica` |
| South America | 4 | 2 | 2 | `southAmerica` |
| Europe | 7 | 4 | 5 | `europe` |
| Africa | 6 | 3 | 3 | `africa` |
| Asia | 12 | 5 | 7 | `asia` |
| Australia | 4 | 1 | 2 | `australia` |

```ts
import { TENKA_CONTINENTS, areNeighbours, tenkaNeighbours, TENKA_TERRITORIES } from "@johnmorrisdotca/tenka";

TENKA_CONTINENTS.map((continent) => continent.bonus); // → [5, 2, 5, 3, 7, 2]
TENKA_CONTINENTS.map((continent) => continent.territories.length); // → [9, 4, 7, 6, 12, 4]
TENKA_TERRITORIES.length; // → 42
tenkaNeighbours(0); // → [1, 3, 29]
TENKA_TERRITORIES[29]!.name; // → "Kamchatka"
areNeighbours(0, 29); // → true
```

Alaska's neighbours are the Northwest Territory and Alberta by land and
Kamchatka by sea: the world wraps round.

### Europe

A second map, played by the same rules: forty-nine territories in eleven
regions, from Scotland to Turkey and from Norway to Morocco. It is the board
of the classic game of Europe as a graph, exactly: the same named areas
(Scotland, Normandy, Lombardy, the Kingdom of Sicily, the Republic of
Novgorod, Rusland, Galicia and the rest), the same eighty-two borders on land,
and the same nineteen routes across the water. Start a game on it with
`startTenka(rounds, players, seed, placing, "europe")`; the game says
`map: "europe"`, and every rule reads that map.

The list of what touches what is `scripts/europe-edges.mjs`, written out by
hand; `pnpm map europe` draws the territories from real geography so that
they have exactly those borders, and refuses to write if they do not, and
`tenkaEurope.test.ts` holds the finished map to the list again, written out a
second time there by name.

The regions are Tenka's own, since that board has none; each is worth what its
size and the ways into it say:

| Region | Territories | Ways in | Armies for holding it | Key |
| --- | --- | --- | --- | --- |
| Britain and Ireland | 4 | 4 | 2 | `britishIsles` |
| The Nordic Countries | 4 | 8 | 3 | `scandinavia` |
| Iberia | 6 | 5 | 3 | `iberia` |
| The Maghreb | 3 | 4 | 2 | `maghreb` |
| France | 4 | 8 | 3 | `france` |
| Germany and the Low Countries | 5 | 7 | 4 | `germany` |
| Central Europe | 4 | 10 | 3 | `centralEurope` |
| Italy | 4 | 5 | 2 | `italy` |
| The Balkans and Turkey | 5 | 5 | 3 | `balkans` |
| Poland and the Baltic | 5 | 10 | 4 | `baltic` |
| Eastern Europe | 5 | 7 | 4 | `easternEurope` |

```ts
import { TENKA_MAPS, startTenka, tenkaMapOf } from "@johnmorrisdotca/tenka";

TENKA_MAPS.europe.territories.length; // → 49
const game = startTenka(10, ["Ann", "Ben", "Cho"], 2026, "auto", "europe")!;
game.map; // → "europe"
tenkaMapOf(game).continents.length; // → 11
```

The territories are historical areas, not modern countries: Denmark runs on
down the German coast to Poland's border, Venice is the Adriatic's far shore,
and Rusland is the Ukraine. Each is made of the provinces of its place, drawn
from Natural Earth. A game saved before the maps were the board's (version 1 of
the kept text, format 1 of the JSON) is refused on either map, because its moves
mean other territories now.

### What a game is

A `TenkaGame` holds everything, as plain data:

| Field | What it is |
| --- | --- |
| `seed`, `players`, `rounds`, `placing` | The table: all that is ever kept, with `moves` |
| `moves` | Every move made, in order: the game's whole record |
| `round`, `toPlay`, `phase`, `first` | Where the game is: the round from 1, the seat to move, the part of the turn, who plays first each round |
| `owners`, `armies` | For each territory, who holds it (a seat, or `TENKA_NEUTRAL`) and with how many armies |
| `hands`, `deck`, `discards`, `trades` | The cards in each seat's hand, those still to draw and those traded in, and how many sets have been traded |
| `reserve`, `setUpLeft` | Armies waiting to be placed this turn, and starting armies still to place by hand |
| `occupying`, `shifting` | The territory just taken and the least that must move in; the two territories of a fortifying move waiting for a number |
| `lastRoll`, `lastTrade`, `lastDraw`, `lastOut` | What just happened, for a table to show |
| `conquered`, `out`, `winners` | Whether this turn has taken a territory, who is out, and on a finished game who won |
| `rng` | The random's state after everything drawn so far |

A territory is a number, its place in `TENKA_TERRITORIES` (0 to 41). A card is
a number too: 0 to 41 the card of that territory, 42 and 43 the wild cards. A
seat is 0 for the first name given.

### Moves

| Move | When |
| --- | --- |
| `{ kind: "place", territory, armies }` | Reinforcing: one army, or all still waiting. Setting up by hand: one army |
| `{ kind: "trade", cards }` | Reinforcing: three cards that make a set (`setsIn(hand)`) |
| `{ kind: "attack", from, to, dice }` | Attacking: one throw, of one to three dice |
| `{ kind: "blitz", from, to }` | Attacking: throw every die allowed until it is decided |
| `{ kind: "occupy", armies }` | After taking a territory: how many move in |
| `{ kind: "endAttack" }` | Stop attacking and fortify |
| `{ kind: "fortify", from, to }` then `{ kind: "shift", armies }` | One move between joined territories, which ends the turn |
| `{ kind: "endTurn" }` | Fortifying: end the turn without moving |

```ts
import { battleLosses, cardKind, setsIn, tradeValue } from "@johnmorrisdotca/tenka";

battleLosses([6, 3, 2], [5, 3]); // → { attackerLost: 1, defenderLost: 1 }
[cardKind(0), cardKind(1), cardKind(2), cardKind(43)]; // → ["land", "sea", "air", "wild"]
setsIn([0, 1, 2, 43]).length; // → 4
[tradeValue(0), tradeValue(5), tradeValue(6)]; // → [4, 15, 20]
```

## Taps on a map

`tapTerritory(game, choice, territory)` says what a press on a territory means
now, and returns the next choice and the move to make, if the press is one.
`marksFor(game, choice)` says what to light up. That is all a board needs to
be played by touch, and it is what the table itself uses.

```ts
import { NO_CHOICE, marksFor, playTenka, startTenka, tapTerritory } from "@johnmorrisdotca/tenka";

const start = startTenka(10, ["Ann", "Ben", "Cho"], 2026)!;
const attacking = playTenka(start, { kind: "place", territory: 1, armies: 4 })!;

const tapped = tapTerritory(attacking, NO_CHOICE, 1);
tapped.move; // → null
tapped.choice.from; // → 1
marksFor(attacking, tapped.choice); // → { chosen: 1, reach: [0, 3, 4, 2], target: null }
```

Ben taps the Northwest Territory to attack from: no move yet, and the four neighbours
he could attack light up.

## Keeping a game, export and import

A game is kept as its table and its moves, never the world: the moves make
the world again, dice and all, from the seed.

```ts
import { playTenka, startTenka, tenkaFromJSON, tenkaToCSV, tenkaToJSON, tenkaToText, TENKA_STRINGS } from "@johnmorrisdotca/tenka";

const dealt = startTenka(10, ["Ann", "Ben", "Cho"], 2026)!;
const game = playTenka(dealt, { kind: "place", territory: 1, armies: 4 })!;

const text = tenkaToJSON(game);
JSON.parse(text).moves; // → [["p", 1, 4]]
tenkaFromJSON(text)!.armies[1]; // → 7
tenkaFromJSON(text.replace('["p",1,4]', '["p",0,4]')); // → null
tenkaFromJSON("not a game"); // → null

tenkaToText(game); // → "Tenka: Ann, Ben, Cho; 10 rounds; seed 2026\nRound 1\nBen places 4 on Northwest Territory.\n"
tenkaToText(game, TENKA_STRINGS.ja).split("\n")[2]; // → "Benがノースウェスト準州に4部隊を置く。"
tenkaToCSV(game).split("\r\n")[1]; // → "1,1,2,Ben,place,,northwestTerritory,4,,,,,,,,,,"
```

The JSON, as `tenkaToJSON` writes it:

```json
{
  "format": 2,
  "game": "tenka",
  "generator": "tenka 1.3.0",
  "seed": 2026,
  "players": [
    "Ann",
    "Ben",
    "Cho"
  ],
  "rounds": 10,
  "placing": "auto",
  "moves": [
    ["p",1,4]
  ],
  "state": {"round":1,"phase":"attack","toPlay":1,"winners":[]}
}
```

- **The JSON reads back in, and nothing in it is trusted.** `tenkaFromJSON`
  deals the game again from the seed and plays every move through the rules.
  A move that could not have been made, a later `format`, another game's
  file or anything that is not JSON is `null`. `state` is there for people
  and for listings, and is never read: the moves say where the game stands.
- **`format`** is `TENKA_EXPORT_FORMAT`, and goes up only when a reader of
  the old shape would be wrong about the new one.
- **A move is a short list**, its kind's letter first. `writeTenkaMove` and
  `readTenkaMove` turn one move into its list and back, for sending a move to
  the other devices at a table.

  | List | Move |
  | --- | --- |
  | `["p", territory, armies]` | place |
  | `["x", card, card, card]` | trade three cards |
  | `["a", from, to, dice]` | attack, one throw |
  | `["b", from, to]` | attack until it is decided |
  | `["o", armies]` | move in |
  | `["e"]` | stop attacking |
  | `["f", from, to]` | fortify from, to |
  | `["s", armies]` | how many move |
  | `["t"]` | end the turn |

- **The text** is a line to a move under a line for each round, in English or
  in any table of strings. `tenkaRecord(game)` is the same record as data: each
  move with its dice, its trade, who it knocked out and how the game ended.
- **The CSV** is a row to a move: `move`, `round`, `seat`, `player`, `kind`,
  `from`, `to`, `armies`, `dice`, `attack`, `defend`, `attackerLost`,
  `defenderLost`, `throws`, `took`, `cards`, `out`, `winners`
  (`TENKA_CSV_COLUMNS`). Territories are written by key, seats from 1. Lines
  end CRLF, as RFC 4180 has them, and a player's name that a spreadsheet would
  run as a formula is given a leading apostrophe.
- **For a browser's storage**, `encodeTenka(game)` is the same table and
  moves on one line, and `decodeTenka(text)` reads it back or returns `null`.
  `tenkaFromJSON` reads both.
- **In the table** it is *Record of the game*, under the players: the text as
  the game goes, and buttons to save as JSON, text or CSV and to load a saved
  game back.

## The map

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

## API

The [API reference](https://johnmorrisdotca.github.io/tenka/api.html) lists every export of every entry point with its signature and its doc comment. It is made from the source by `pnpm site`, so it cannot fall behind the code.

Every function, type and constant has a doc comment, so an editor shows this
as you type. The entries:

| Entry | What it holds |
| --- | --- |
| `@johnmorrisdotca/tenka` | The rules, the map's facts, the computer player, keeping and export, taps, and the words |
| `@johnmorrisdotca/tenka/shapes` | `TENKA_SHAPES`, the outline of every territory |
| `@johnmorrisdotca/tenka/ui` | `mountTenka`, the whole table in plain DOM, and the map as SVG |
| `@johnmorrisdotca/tenka/element` | `TenkaTable`, the `<tenka-table>` element's class, to extend or to define under another name |
| `@johnmorrisdotca/tenka/element/define` | Defines `<tenka-table>` on the page by being imported; exports nothing |
| `@johnmorrisdotca/tenka/react` | `TenkaMap` and `TenkaTable` |

### Playing

| Export | What it does |
| --- | --- |
| `startTenka(rounds, players, seed, placing?, map?)` | A new game, all of it drawn from the seed; `null` for a table the game is not offered for. `placing` is `"auto"` (starting armies scattered) or `"hand"` (placed one at a time round the table); `map` is `"world"` (the default) or `"europe"` |
| `playTenka(game, move)` | The game after the move, or `null` when the rules refuse it |
| `tenkaMoves(game)` | Every move the player to move may make now |
| `attacksOpen(game)` | Every attack open now, with each number of dice, and each as a blitz |
| `sensibleTenkaMove(game, random)` | The computer player's move; `random` is `Math.random` or a seeded function |
| `tenkaOver(game)` | Whether the game is over |
| `mustTrade(game)` | Whether the player to move must trade cards first |
| `tenkaAgain(game, seed)` | The same table again with a new seed |
| `isTenkaTable(rounds, count)`, `isTenkaSeed(seed)` | Whether a table or a seed is one `startTenka` takes |
| `reinforcementFor(owners, seat)` | The armies a turn brings |
| `territoriesHeld(owners, owner)`, `armiesHeld(game, owner)` | How many territories, and armies, an owner has |
| `tenkaPlayerName(game, seat)`, `cleanTenkaName(name)` | A seat's name as the table reads it; a name tidied and cut to 20 characters |
| `nextSeatIn(game, seat)` | The next player still in |
| `beginTurn`, `endOfTurn`, `counted`, `finished` | The steps every move passes through, for rules built on these |

### The map's facts

| Export | What it is |
| --- | --- |
| `TENKA_MAPS`, `TENKA_MAP_LIST` | Every map, by key (`world`, `europe`): its `territories`, `continents` and each territory's `neighbours` |
| `tenkaMapOf(game)` | The map a game is played on: the world for a game that names none |
| `boardOf(map)` | The map an argument names, and the world for anything else (an array's index, handed in by `map`) |
| `TENKA_TERRITORIES`, `TENKA_TERRITORY_COUNT` | The world's forty-two territories: `key`, `name`, `continent`, and neighbours by `land` and by `sea` |
| `TENKA_CONTINENTS`, `tenkaContinent(key)` | The six continents: `key`, `name`, `kanji`, `bonus`, `territories` |
| `tenkaNeighbours(territory)`, `areNeighbours(a, b)` | Where an army may go from a territory |
| `isTerritory(n)` | Whether a number is a territory's |
| `continentsHeld(owners, seat)` | The continents a player holds whole |
| `connectedOwn(owners, from)` | Where one fortifying move may take armies |

Each of these takes the map as a last argument, the world when it is left out:
`tenkaNeighbours(5, tenkaMapOf(game))`.

### Cards and dice

| Export | What it does |
| --- | --- |
| `TENKA_DECK` | Every card of the world: 0 to 41 the territories', 42 and 43 wild |
| `tenkaDeckFor(map)` | Every card of a game on that map: one for each territory, then the two wild |
| `cardKind(card, map?)`, `cardTerritory(card, map?)`, `isWild(card, map?)` | What a card shows |
| `isSet(cards, map?)`, `setsIn(hand, map?)` | Whether three cards make a set; every set in a hand |
| `tradeValue(trades)` | What the next set is worth |
| `throwDice(state, count)` | Dice from the game's random, highest first, and the state after them |
| `battleLosses(attack, defend)` | Who loses what |
| `mostAttackDice(armies)`, `defendDice(armies)` | The dice each side may throw |
| `nextRandom(state)`, `randomBelow(state, below)`, `shuffled(state, items)` | The game's random: Mulberry32, one 32-bit number of state |

### Keeping and export

| Export | What it does |
| --- | --- |
| `tenkaToJSON(game)`, `tenkaFromJSON(text)` | A game as JSON, and back, or `null` |
| `tenkaExported(game)` | The JSON export's object (`TenkaExported`) |
| `tenkaToText(game, strings?)` | A game as plain text, a line to a move |
| `tenkaToCSV(game)`, `TENKA_CSV_COLUMNS` | A game as CSV, a row to a move |
| `tenkaRecord(game)` | Each move with what came of it (`TenkaRecordEntry[]`) |
| `encodeTenka(game)`, `decodeTenka(text)` | A game on one line for a browser's storage, and back |
| `replayTenka(table, moves)` | A game made again from its table and its moves |
| `writeTenkaMove(move)`, `readTenkaMove(list)` | One move as a short list, and back |
| `TENKA_EXPORT_FORMAT`, `TENKA_VERSION` | The JSON's format number, and this package's version |

### The day's seed

| Export | What it does |
| --- | --- |
| `tenkaDay(date)` | The day a moment falls on, in UTC, written `YYYY-MM-DD` |
| `tenkaDailySeed(date)` | That day's seed: the date as a number, so 2026-10-01 is `20261001` |

```ts
import { startTenka, tenkaDailySeed } from "@johnmorrisdotca/tenka";

tenkaDailySeed(new Date("2026-10-01T12:00:00Z")); // → 20261001
startTenka(10, ["Ann", "Ben"], tenkaDailySeed(new Date("2026-10-01T23:00:00Z")))!.toPlay; // → startTenka(10, ["Ann", "Ben"], 20261001)!.toPlay
```

The day is the UTC date, so it changes at one moment for the whole world, and
everybody who starts from it with the same players and length is dealt the same
game. It is the same number as Tane's `dailySeed`, so a page that uses both
agrees; Tenka does not need Tane. What a player does with the deal is their own.

### Taps and words

| Export | What it does |
| --- | --- |
| `tapTerritory(game, choice, territory)` | What a press means now: the next choice, and a move if it is one |
| `marksFor(game, choice)` | What the map lights up |
| `choiceNow(game, choice)`, `NO_CHOICE` | A choice read against the game as it now stands; nothing chosen |
| `TENKA_STRINGS`, `tenkaStrings(locale, own?)` | Every word in English and Japanese; a table for a locale with your own laid over it |
| `tenkaSay(line, values)` | A line with its braces filled in |
| `territoryNameIn(strings, key)`, `continentNameIn(strings, key)` | A territory's or a continent's name in a table of strings |

The constants are in the tables under [The rules it plays](#the-rules-it-plays)
and [Limits](#limits), with `TENKA_PHASES`, `TENKA_MOVES`, `TENKA_PLACING`,
`TENKA_CARD_KINDS`, `TENKA_WILD` and `TENKA_NEUTRAL` for comparing by name.
The types are `TenkaGame`, `TenkaMove`, `TenkaMoveKind`, `TenkaPhase`,
`TenkaPlacing`, `TenkaSeat`, `TenkaOwner`, `TenkaCard`, `TenkaCardKind`,
`TenkaRoll`, `TenkaTrade`, `TenkaChoice`, `TenkaMapMarks`, `TenkaContinent`,
`TenkaContinentKey`, `TenkaTerritoryData`, `TenkaShapes`, `TenkaExported`,
`TenkaRecordEntry`, `TenkaStrings` and `TenkaLocale`.

### The table

`mountTenka(element, options?)` from `@johnmorrisdotca/tenka/ui` draws and
plays a whole game in the element, and returns a handle.

| Option | Default | What it does |
| --- | --- | --- |
| `players` | You, Kaze, Yama | The names round the table, in seat order: two to six |
| `computers` | every seat but the first | Which seats the computer plays. All `false` passes one device round |
| `rounds` | `60` | Rounds before the count: 10, 20, or 60 for the whole world |
| `seed` | a new one each game | The seed every deal and die is drawn from |
| `map` | `"world"` | The map: `"world"` or `"europe"` |
| `colours` | `TENKA_SEAT_COLOURS` | A CSS colour for each seat |
| `computerDelayMs` | `450` | How long the computer waits before each of its moves |
| `onChange` | | Called with the game after every move |
| `locale` | the page's `lang` | `"en"` or `"ja"` |
| `strings` | | Words of your own, laid over the locale's |
| `theme` | | CSS variables set on the table itself |
| `record` | `true` | Whether the record of the game, with saving and loading, is shown |

| Handle | What it does |
| --- | --- |
| `game()` | The game as it stands |
| `newGame(options?)` | A new game at the same table; `players`, `computers`, `rounds`, `seed` and `map` may change |
| `setGame(game, computers?)` | Put a game on the table: one read back by `tenkaFromJSON` |
| `setLocale(locale, strings?)` | Change the table's language |
| `destroy()` | Take the table off the page and stop its timers |

To draw the map yourself, the same entry has `tenkaMapModel(game, marks?,
colours?)`, which works out every territory's colour, counter and ring;
`tenkaMapSvg(model, { label?, view?, pixels?, describe?, keys? })`, which draws
it as an `<svg>` whose shapes and counters carry `data-territory` and whose
territories are named buttons for a screen reader (`describe` words what is
read for each, `keys` is the drawing's description);
`landInDirection(territory, arrow, map?, view?)`, the territory an arrow key
moves to; `continentView(key)`, the
part of the map that frames a continent; `nearestLand(x, y, reach)`, for a
press on the sea beside an island (each of the two takes the map's key last);
`TENKA_MAP_SHAPES` and `tenkaShapesOf(map)`, how each map is drawn; and `TENKA_SEAT_COLOURS`,
`TENKA_NEUTRAL_COLOUR`, `ownerColour(owner, colours?)`, `NO_MARKS` and
`TENKA_STYLE`, the table's stylesheet as a string.

### The element

`<tenka-table>` is `mountTenka` as a tag: `@johnmorrisdotca/tenka/element/define`
defines it, and `@johnmorrisdotca/tenka/element` holds the class alone. Each
attribute is read again when it changes, and a change to any but `lang` deals a
new game. A table the rules do not offer (one player, say, or 15 rounds) draws
nothing.

| Attribute | Default | What it does |
| --- | --- | --- |
| `players` | You, Kaze, Yama | The names round the table, in seat order, separated by commas: two to six |
| `computers` | every seat but the first | `true` or `false` for each seat, separated by commas, or `none` for people taking turns on one device, or `all` |
| `rounds` | `60` | 10, 20, or 60 for the whole world |
| `seed` | a new one each game | A whole number to deal from, or `daily` for the day's seed |
| `map` | `world` | `world` or `europe` |
| `lang` | the page's | `en` or `ja` |
| `record` | on | `off` leaves the record of the game out |
| `delay` | `450` | How long the computer waits before each of its moves, in milliseconds |

It fires `tenka-change` after every move, with the game as `event.detail.game`
(a bubbling `CustomEvent`), and has `game`, `table` (the handle `mountTenka`
returns), `newGame(options?)` and `setGame(game, computers?)`. To style it,
set the table's variables on `tenka-table .tk-root`: see [Theming](#theming).

### The React components

```jsx
import { useState } from "react";
import { NO_CHOICE, marksFor, playTenka, startTenka, tapTerritory } from "@johnmorrisdotca/tenka";
import { TenkaMap } from "@johnmorrisdotca/tenka/react";

export function Board() {
  const [game, setGame] = useState(() => startTenka(10, ["Ann", "Ben", "Cho"], 2026));
  const [choice, setChoice] = useState(NO_CHOICE);
  const press = (territory) => {
    const tapped = tapTerritory(game, choice, territory);
    setChoice(tapped.choice);
    if (tapped.move !== null) setGame(playTenka(game, tapped.move) ?? game);
  };
  return <TenkaMap game={game} marks={marksFor(game, choice)} onTerritory={press} style={{ width: "100%" }} />;
}
```

| `TenkaMap` prop | What it does |
| --- | --- |
| `game` | The game to draw: `owners` and `armies` are read |
| `marks` | What to light up: from `marksFor(game, choice)` |
| `colours` | A colour for each seat |
| `onTerritory` | Called with a territory's number when it or its counter is pressed, or when Enter or Space is pressed on a territory reached by Tab. Without it the map is a picture |
| `label` | The map's accessible name |
| anything else | Passed to the `<svg>` |

`TenkaTable` takes every option of `mountTenka` as a prop, and anything else
for its `<div>`. Options are read when it mounts; give it a new `key` to start
over with different ones.

## Accessibility

- **A keyboard plays it.** On the table, each territory is a button, named for
  a screen reader with its holder and its armies ("Brazil, Ann, armies 4").
  Tab lands on one of them, the arrow keys move to the nearest territory in
  that direction among those on the screen, and Enter or Space taps it, as a
  finger would. The keyboard stays where it was after each move, and the map's
  description says so. The choice buttons, the slider and the record are
  ordinary controls.
- **What is happening is said.** The line above the map, which says whose turn
  it is and what to do, is a polite live region, so each turn is read out
  without moving focus.
- **Targets are big enough.** Every button, slider and summary is at least 44
  pixels each way, which a test holds at a phone's width.
- **Colour is not the only mark.** The armies on a territory are numbers, and
  a player's marble sits beside their name.
- **Motion.** There is none to reduce: the table has no animation. The
  computer's pause between moves is `computerDelayMs`, and 0 plays without it.
- **Not yet.** The arrow keys go by where territories lie on the screen, not
  by the neighbours the rules count, so a sea route is not followed by a key.
  The focus ring is drawn in `--tk-accent`; a page that re-colours it should
  check its contrast.

## Theming

Every colour is a CSS variable on `.tk-root`. Set them in your stylesheet on
`.tk-root` with a selector more specific than the table's own, such as
`#table .tk-root`, or pass them as `theme`, which sets them
on the table itself and so wins in light and dark alike. The seats' colours
are the `colours` option.

| Variable | What it colours | Light | Dark |
| --- | --- | --- | --- |
| `--tk-sea` | The sea, and the board behind the map | `#b9d3dc` | `#22343b` |
| `--tk-ink` | Text | `#1f2320` | `#ece8dc` |
| `--tk-panel` | Buttons, the players' rows, cards and the record | `#f7f3ea` | `#1d201e` |
| `--tk-line` | Territory outlines and button edges | `rgba(20,20,20,.55)` | the same |
| `--tk-border` | The borders between continents | `rgba(10,10,10,.8)` | the same |
| `--tk-link` | The dashed sea routes | `#1d3440` | `#e8eef0` |
| `--tk-accent`, `--tk-accent-ink` | The main button, the view chosen, the player to move | `#2f5d4a`, `#fff` | `#6fb08f`, `#10150f` |
| `--tk-ring`, `--tk-ring-target` | The ring round the territory chosen and those it can reach; round the target | `#111`, `#fff` | the same |
| `--tk-counter-edge`, `--tk-counter-ink` | The edge of an army counter, and its number | `#111`, `#fff` | the same |
| `--tk-attack`, `--tk-attack-ink` | The attacker's dice | `#c8463d`, `#fff` | the same |
| `--tk-defend`, `--tk-defend-ink` | The defender's dice | `#f4efe4`, `#1f2320` | the same |
| `--tk-radius` | The map's corners | `10px` | the same |
| `--tk-font` | The table's typeface | `system-ui, …` | the same |

A night-sea table with six colours of its own:

```js
import { mountTenka } from "@johnmorrisdotca/tenka/ui";

mountTenka(document.getElementById("table"), {
  theme: { "--tk-sea": "#16283a", "--tk-link": "#d7e3ee", "--tk-accent": "#d4a017", "--tk-accent-ink": "#1a1405", "--tk-panel": "#f1ead9" },
  colours: ["#b5452c", "#2f5d4a", "#d4a017", "#3a6fb5", "#7a4e9c", "#4a4a44"],
});
```

Drawing the map yourself, the same classes are there to style: `.tk-map`,
`.tk-sea`, `.tk-land`, `.tk-borders`, `.tk-sea-link`, `.tk-ring`,
`.tk-ring-chosen`, `.tk-ring-reach`, `.tk-ring-target` and `.tk-counter`.

## Languages

English and Japanese, chosen by `locale` or by the page's `lang`, and changed
at any time with `setLocale`. The demo has a chooser of its own, follows the
browser's language on a first visit, and takes `?lang=ja` or `?lang=en` in the
address. **Japanese: included; not yet reviewed by a native reader.
Corrections welcome.** Every Japanese string is listed beside its English in
[docs/strings-ja.md](./docs/strings-ja.md), and there is an
[issue template](https://github.com/johnmorrisdotca/tenka/issues/new?template=fix-a-translation.md)
for fixing one. Any other language is a table of your own passed as `strings`:

```ts
import { TENKA_STRINGS, tenkaSay, tenkaStrings, territoryNameIn } from "@johnmorrisdotca/tenka";

tenkaSay(TENKA_STRINGS.ja.moveIn, { n: 3 }); // → "3部隊を進める"
territoryNameIn(TENKA_STRINGS.ja, "japan"); // → "日本"
tenkaStrings("en", { endTurn: "Terminar turno" }).endTurn; // → "Terminar turno"
```

The names players type are kept as typed, in any script.

## Limits

| Limit | Value | Constant |
| --- | --- | --- |
| Players | 2 to 6 | `TENKA_FEWEST_PLAYERS`, `TENKA_MOST_PLAYERS` |
| Rounds | 10, 20 or 60 | `TENKA_LENGTHS` |
| A seed | a whole number from 0 to 4,294,967,295 | `TENKA_SEED_MOST` |
| A player's name | 20 characters, spaces run together | `TENKA_NAME_MOST` |
| Territories | 42 | `TENKA_TERRITORY_COUNT` |
| Cards | 44 | `TENKA_DECK` |

`startTenka` returns `null` for anything outside them. One map, and one set of
rules: see the roadmap.

## Browser support

Any current browser: Chrome, Edge, Firefox and Safari, on a desk or a phone.
It needs ES2020 and, for the table, inline SVG and `ResizeObserver` (without
which the map is drawn once and not again on a change of width). The table is
tested in Chromium and in WebKit, Safari's engine, at phone size with touch
and on a desktop. The rules run in Node 22 and later, Deno, Bun and web
workers, and load by `import` and by `require()`.

## The command line

There is none, on purpose. A game of Tenka is made at a table, by taps on a
map, and a terminal has nothing to add to it that two lines of Node do not:

```ts
import { tenkaFromJSON, tenkaToJSON, tenkaToText, startTenka } from "@johnmorrisdotca/tenka";

const saved = tenkaToJSON(startTenka(10, ["Ann", "Ben"], 3)!);   // in life, a file's text
const game = tenkaFromJSON(saved);
game === null ? "not a game these rules can replay" : tenkaToText(game); // → "Tenka: Ann, Ben; 10 rounds; seed 3\n"
```

## Roadmap

- Other rule sets as options: secret missions, capitals, and a fixed card
  bonus.
- Maps of your own: the map as data, with a tool to draw one.
- A stronger computer player that plans a whole turn.
- The throw of the dice and armies moving in, animated on the table.
- A Vue wrapper, beside the React one and the tag.

Left out on purpose: play between devices, which needs a server (the moves
are made to be sent, and Itsutsu sends them; the sending is yours); a command
line; and any name, art or wording of a published game. Tenka runs from a
static page and costs nothing to host.

Ideas and pull requests are welcome.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). In short:

```sh
pnpm install
pnpm check        # lint, types and tests
pnpm test:table   # the demo in real browsers, by taps
pnpm site         # build the demo into ./site, then serve it
pnpm pictures     # take the README's two pictures from the built demo
```

Please follow the [code of conduct](./CODE_OF_CONDUCT.md). A way to make a game, a saved game or the map take far too long, or markup that gets out of the drawing, is for the [security policy](./SECURITY.md), not a public issue.

## Changes

See [CHANGELOG.md](./CHANGELOG.md).

## Licence

[MIT](./LICENSE) © John Morris. The map is drawn from
[Natural Earth](https://www.naturalearthdata.com/), which is in the public
domain.
