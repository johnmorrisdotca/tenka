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

<p align="center"><a href="https://johnmorrisdotca.github.io/tenka/"><strong>Play a game →</strong></a> · <a href="https://johnmorrisdotca.github.io/tenka/api.html">API reference</a> · <a href="docs/API.md">Every export</a></p>

<table align="center">
<tr>
<td align="center" valign="top">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/tenka/main/docs/images/hero-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/tenka/main/docs/images/hero-desk-light.webp" alt="A game of three on the map of the world, on a desk, under the demo's header with its language chooser and cloth swatches: the set-up choices, the map in the players' colours with a count of armies on each territory and an attack from one territory begun, the players with their lands and armies at the side, and the record of the game under the map." width="720">
</picture>
<br><em>A game of three on the world map, an attack begun, on a desk.</em>
</td>
<td align="center" valign="top">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/tenka/main/docs/images/hero-phone-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/tenka/main/docs/images/hero-phone-light.webp" alt="Europe close up on a phone, in Japanese: the zoom buttons with Europe chosen, the map with its sea routes dashed, and under it the players and the record of the game." width="220">
</picture>
<br><em>Europe close up, on a phone, in Japanese, in the device's light or dark.</em>
</td>
</tr>
</table>

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
- **What it costs a project.** Nothing: no dependencies, and one import. The
  dice and cards on the table can be drawn by two sibling packages, Korokoro
  and Toranpu, if you install them ([below](#dice-and-cards-from-korokoro-and-toranpu));
  nothing else in Tenka ever asks for them.

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

```js no-run
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
- **Dice and cards from the family.** Korokoro's dice tumble onto the faces the
  game threw, and Toranpu draws each card with its territory's own outline,
  name and army, and the deck face down in Tenka's own back: see
  [below](#dice-and-cards-from-korokoro-and-toranpu).
- **A tag.** `<tenka-table>` is the whole table in one element, with no
  framework.
- **One game a day.** `tenkaDailySeed(new Date())` is the same seed for
  everybody, worldwide.
- **Played from a keyboard.** Arrow keys between territories, Enter or Space to
  tap; see [Accessibility](#accessibility).
- **Export and import.** JSON that reads back in, plain text, and CSV.
- **English and Japanese**, and any other language by a table of your own.
- **Themeable.** Every colour is a CSS variable, light and dark.

### What's in it

Each picture is the table the package draws (`mountTenka`), taken from [the demo](https://johnmorrisdotca.github.io/tenka/) with `pnpm screenshots:readme`, in light and dark. The game is a seed (`?seed=7`) and the computers move at once, so the same pictures come again.

<table>
<tr>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/tenka/main/docs/images/world-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/tenka/main/docs/images/world-desk-light.webp" alt="The world map in three players' colours, red, blue and yellow, with a count of armies in a circle on each territory and one outlined as the start of an attack." width="400">
</picture>
<br><em><strong>The world</strong>: forty-two territories, the classic board's graph, drawn from public-domain data.</em>
</td>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/tenka/main/docs/images/europe-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/tenka/main/docs/images/europe-desk-light.webp" alt="The map of Europe, from Scotland to Turkey, its territories in the players' colours with armies on each and dashed lines for the sea routes." width="400">
</picture>
<br><em><strong>Europe</strong>: a second map of forty-nine territories, played by the same rules.</em>
</td>
</tr>
<tr>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/tenka/main/docs/images/asia-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/tenka/main/docs/images/asia-desk-light.webp" alt="The continent of Asia close up, its territories in the players' colours with armies on each." width="400">
</picture>
<br><em><strong>A continent view</strong>: each continent can be looked at close up.</em>
</td>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/tenka/main/docs/images/record-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/tenka/main/docs/images/record-desk-light.webp" alt="The record of the game, opened: a list of what each player has done, such as armies placed and attacks made, with their results." width="400">
</picture>
<br><em><strong>The record</strong>: every move of the game, written.</em>
</td>
</tr>
<tr>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/tenka/main/docs/images/players-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/tenka/main/docs/images/players-desk-light.webp" alt="The players beside the map: a coloured marble, a name, and lands and armies for each of three players, the one to move marked." width="400">
</picture>
<br><em><strong>The players</strong>: lands and armies, the one to move marked.</em>
</td>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/tenka/main/docs/images/dressed-with-dice-and-cards-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/tenka/main/docs/images/dressed-with-dice-and-cards-desk-light.webp" alt="The table dressed in Korokoro's dice and Toranpu's cards: an attack thrown as three red dice against one cream die, a card in hand and the deck face down in green." width="400">
</picture>
<br><em><strong>Dressed</strong>: with Korokoro's dice and Toranpu's cards, if installed.</em>
</td>
</tr>
</table>

## Use it in your project

### Install

```sh
npm install @johnmorrisdotca/tenka
```

```sh
pnpm add @johnmorrisdotca/tenka
```

```sh
yarn add @johnmorrisdotca/tenka
```

A page with no bundler loads the table as a tag from a CDN, naming the major version so that a release that changes what you use is one you choose:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/tenka@2/dist/element-define.js"></script>
```

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
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/tenka@2/dist/element-define.js"></script>

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

```ts no-check
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
- **Optional peers, for one entry only.** `@johnmorrisdotca/korokoro` and
  `@johnmorrisdotca/toranpu` are optional peer dependencies of
  `@johnmorrisdotca/tenka/dressing` and of nothing else. The rules, the map,
  saving, the computer player and the plain table never import them.
- **Sizes.** The rules, the computer player and keeping a game are about 17 kB
  minified (6 kB gzipped) once a bundler has shaken the rest out; the whole
  main entry, with both languages and the exports, is 37 kB (12 kB). The
  table is 120 kB (39 kB), of which the map's outlines are 69 kB (21 kB). The
  outlines are their own entry, `/shapes`, so code that only plays the rules
  never carries them. Dressing the table in Korokoro's dice and Toranpu's cards
  adds about 190 kB (70 kB gzipped), nearly all of it Korokoro, to a page that
  asks for it; Tenka's own part of that is under 10 kB.
- **Where it runs.** Current Chrome, Edge, Firefox and Safari, on a desk or a
  phone. The rules have no DOM in them and run in Node 22 and later, Deno,
  Bun and web workers.

The cookbook, with the output of each example, is under [Examples](#examples).

## Examples

Every TypeScript and JavaScript block that can run is type-checked against the built package and run by `pnpm test:readme`, so the output after `// →` is what the code prints. The rules need no page, no network and no clock: a game is a seed and its moves.

### A page with nothing else

Save this as a file and open it: one script and one tag, and a game of three at a table, against the computer. The seed deals the same game to everybody who opens the address:

```html
<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>World conquest</title>
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/tenka@2/dist/element-define.js"></script>
<tenka-table seed="2026" rounds="10"></tenka-table>
```

### Play a whole game, by the computer

`sensibleTenkaMove(game, random)` is the computer player's move; give it a seeded random and a whole match is repeatable. Here three computer players play ten rounds to the end:

```ts
import { playTenka, sensibleTenkaMove, startTenka, tenkaOver } from "@johnmorrisdotca/tenka";

let seed = 1;
const random = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);   // a seeded random: the same game every run
let game = startTenka(10, ["Ann", "Ben", "Cho"], 2026)!;
let moves = 0;
while (!tenkaOver(game)) {
  game = playTenka(game, sensibleTenkaMove(game, random))!;
  moves += 1;
}
moves; // → 363
game.phase; // → "over"
game.winners; // → [1]
```

### What may be played now

`tenkaMoves(game)` lists every move the player to move may make; `playTenka` returns the next game, or `null` when the rules refuse a move, and leaves the game it was given alone:

```ts
import { continentsHeld, playTenka, reinforcementFor, startTenka, tenkaMoves, territoriesHeld } from "@johnmorrisdotca/tenka";

const game = startTenka(10, ["Ann", "Ben", "Cho"], 2026)!;
tenkaMoves(game).length; // → 28
territoriesHeld(game.owners, 0); // → 14
reinforcementFor(game.owners, 0); // → 4
continentsHeld(game.owners, 0); // → []
playTenka(game, { kind: "place", territory: 0, armies: 99 }); // → null
```

### A whole game is its seed and its moves

A game is kept as its settings and its moves, which replay exactly, on any machine, and nobody can reload to roll again. `encodeTenka` writes one line; `decodeTenka` replays it, and reads `null` for anything that is not a game these rules can play:

```ts
import { decodeTenka, encodeTenka, playTenka, startTenka } from "@johnmorrisdotca/tenka";

const game = playTenka(startTenka(10, ["Ann", "Ben", "Cho"], 2026)!, { kind: "place", territory: 1, armies: 4 })!;
const kept = encodeTenka(game);
decodeTenka(kept)?.armies[1]; // → 7
decodeTenka("not a game"); // → null
```

### Write a game as text, JSON or CSV

The record of a game is a list of sentences in English or Japanese; the JSON is the settings and the moves; the CSV is a row to a move, for a spreadsheet:

```ts
import { playTenka, startTenka, tenkaToCSV, tenkaToJSON, tenkaToText } from "@johnmorrisdotca/tenka";

const game = playTenka(startTenka(10, ["Ann", "Ben", "Cho"], 2026)!, { kind: "place", territory: 1, armies: 4 })!;
tenkaToText(game).split("\n").slice(0, 3); // → ["Tenka: Ann, Ben, Cho; 10 rounds; seed 2026", "Round 1", "Ben places 4 on Northwest Territory."]
JSON.parse(tenkaToJSON(game)).seed; // → 2026
tenkaToCSV(game).split("\r\n")[0]; // → "move,round,seat,player,kind,from,to,armies,dice,attack,defend,attackerLost,defenderLost,throws,took,cards,out,winners"
```

### The day's game

`tenkaDailySeed(date)` is the date as a number, so everybody who plays today deals the same game, worldwide; the same number as Tane's `dailySeed`:

```ts
import { startTenka, tenkaDailySeed, tenkaDay } from "@johnmorrisdotca/tenka";

const at = new Date("2026-10-06T10:00:00Z");
tenkaDay(at); // → "2026-10-06"
tenkaDailySeed(at); // → 20261006
startTenka(10, ["Ann", "Ben"], tenkaDailySeed(at))?.seed; // → 20261006
```

### The second map

Europe is played by the same rules on forty-nine territories in eleven regions. Name the map when a game starts, and every rule reads it:

```ts
import { startTenka, tenkaMapOf } from "@johnmorrisdotca/tenka";

const game = startTenka(10, ["Ann", "Ben"], 5, "auto", "europe")!;
game.map; // → "europe"
tenkaMapOf(game).territories.length; // → 49
tenkaMapOf(game).continents.length; // → 11
```

### Press a territory

`tapTerritory` says what a press on a territory means now and what to light up, so a board of your own can be played by touch without knowing a rule:

```ts
import { NO_CHOICE, marksFor, playTenka, startTenka, tapTerritory } from "@johnmorrisdotca/tenka";

const attacking = playTenka(startTenka(10, ["Ann", "Ben", "Cho"], 2026)!, { kind: "place", territory: 1, armies: 4 })!;
const tapped = tapTerritory(attacking, NO_CHOICE, 1);
tapped.choice.from; // → 1
marksFor(attacking, tapped.choice).reach; // → [0, 3, 4, 2]
```

### Mount the table with options

`mountTenka` plays a whole game against the computer in one element, keeps it in the page, and lets a host name the players and the length:

```ts no-run
import { mountTenka } from "@johnmorrisdotca/tenka/ui";

const table = mountTenka(document.getElementById("table")!, {
  players: ["You", "Kaze", "Yama"],
  rounds: 20,
  seed: 2026,
  onChange: (game) => console.log(game.round, game.phase),
});
table.destroy();
```

### Dice and cards of their own

If Korokoro and Toranpu are installed, the table can draw its dice and cards with theirs (see [Dice and cards from Korokoro and Toranpu](#dice-and-cards-from-korokoro-and-toranpu)); the game plays the same either way:

```ts no-run
import { mountTenka } from "@johnmorrisdotca/tenka/ui";
import { tenkaDressing } from "@johnmorrisdotca/tenka/dressing";

mountTenka(document.getElementById("table")!, { dressing: tenkaDressing({ sound: true }) });
```

### A look of your own

Every colour of the table is a CSS variable (the table is under [Theming](#theming)):

```css
tenka-table .tk-root { --tk-sea: #a9c7d3; --tk-ink: #14201c; }
```

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
  "generator": "tenka 2.1.2",
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

Forty-two territories, their names, their neighbours and their outlines are built from [Natural Earth](https://www.naturalearthdata.com/)'s public-domain 1:50m data by `pnpm map` (`scripts/map.mjs`), and are the classic board's graph: the same forty-two territories in six continents, the same eighty-three pairs that touch by land or are joined across the water, and the same continent bonuses. It is drawn in Miller's projection, 2000 by 984 units, so that Alaska and Kamchatka sit at opposite edges with their crossing drawn off both. How it is built, and the list the script holds it to, are in [docs/MAP.md](docs/MAP.md).

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

## Dice and cards from Korokoro and Toranpu

The table draws its own dice and cards, plainly, with nothing to install. If
[Korokoro](https://github.com/johnmorrisdotca/korokoro) and
[Toranpu](https://github.com/johnmorrisdotca/toranpu) are installed it can
draw them with theirs: Korokoro's dice, with pips, tumbling onto the faces the
game threw (and, if you ask, the sound of real dice), and Toranpu's cards,
each showing its own territory's outline from the map, its name, and the
symbol of its army (a castle for land, a ship for sea, a plane for air), with
the deck beside the hand face down in Tenka's own green back with the
character 天. The two wild cards show all three symbols.

<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/tenka/main/docs/images/dressed-with-dice-and-cards-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/tenka/main/docs/images/dressed-with-dice-and-cards-desk-light.webp" alt="The table dressed in Korokoro and Toranpu: an attack from Venezuela thrown as three red dice against one cream die, and beside the players a hand of one card, Siberia, with its outline, its name and a castle for land, next to the deck face down in a green back with the character 天 and the number left in it." width="720">
</picture>
<br><em>The table dressed in Korokoro's dice and Toranpu's cards.</em>

```sh
npm install @johnmorrisdotca/tenka @johnmorrisdotca/korokoro @johnmorrisdotca/toranpu
```

```js no-run
import { mountTenka } from "@johnmorrisdotca/tenka/ui";
import { tenkaDressing } from "@johnmorrisdotca/tenka/dressing";

mountTenka(document.getElementById("table"), { dressing: tenkaDressing() });
```

```jsx no-check
<TenkaTable dressing={tenkaDressing()} />
```

```html
<tenka-table id="tag"></tenka-table>
<script type="module">
  import { tenkaDressing } from "@johnmorrisdotca/tenka/dressing";
  document.getElementById("tag").dressing = tenkaDressing();
</script>
```

| Option of `tenkaDressing` | What it does |
| --- | --- |
| `sound` | `true` for the sound of dice with each throw. Off unless asked |
| `tumbleMs` | How long the dice tumble, in milliseconds: `600` unless said. `0` lands them at once. A device that asks for reduced motion lands them at once whatever this says |
| `back` | The deck's back, Toranpu's `CardBackOptions` laid over Tenka's own (`TENKA_BACK`): a `colour`, an `ink`, a `mark`, your own `art`, `image` or `logo` |

**It only draws.** The dice are thrown by the game's own seeded random, as
they always were, and Korokoro is handed the face that came up
(`tenkaThrownDie(face)` is the source it throws from, so a die tumbles and
lands on exactly that face); the cards are the game's hands and deck. A game
plays and replays move for move, to the same dice, whether it is dressed or
not. A die tumbles only when a move has just thrown it, never when the table
is drawn again for any other reason. Every die, card and the deck is a
picture with a name a screen reader reads ("Attacker's die: 4", "Land:
Brazil", "Deck: 41"), and none can be selected.

**What is needed, and what is not.** `@johnmorrisdotca/korokoro` (1.15 or
later) and `@johnmorrisdotca/toranpu` (2.14 or later) are *optional* peer
dependencies, imported by `@johnmorrisdotca/tenka/dressing` and by nothing
else: a project that never imports that entry never loads them, and Tenka
still has no dependencies. A page with no bundler needs an import map to find
them, as the demo's has.

Your own look is a function. A `TenkaDressing` is `{ die?, card?, back? }`,
each given what the game decided and returning an element to show (with
`destroy` if it has a timer to stop); anything left out is drawn plainly. The
cards are also a plain Toranpu design, for Toranpu's own elements:

```ts
import { roll } from "@johnmorrisdotca/korokoro";
import { cardFaceSvg } from "@johnmorrisdotca/toranpu/card-faces";
import { tenkaCardDesign, tenkaCardId, tenkaCardOfId, tenkaThrownDie } from "@johnmorrisdotca/tenka/dressing";

tenkaCardId("world", 11); // → "tenka-world-11"
tenkaCardOfId("tenka-europe-7"); // → { map: "europe", territory: 7 }
tenkaCardOfId("tenka-wild"); // → { wild: true }
roll({ count: 1, sides: 6 }, tenkaThrownDie(5)).faces; // → [5]
cardFaceSvg(tenkaCardId("world", 11), { design: tenkaCardDesign() })?.includes(">Brazil</text>"); // → true
```

`registerCardDesign(tenkaCardDesign())` from Toranpu then lets `<toranpu-card
card="tenka-world-11" design="tenka">` draw a Tenka card anywhere on a page.

| Export of `/dressing` | What it is |
| --- | --- |
| `tenkaDressing(options?)` | The dressing to give a table |
| `tenkaCardDesign()` | Tenka's cards as a Toranpu design, named `tenka` |
| `tenkaCardId(map, territory)`, `tenkaCardOfId(id)` | A card's id in Toranpu's hands, and back |
| `tenkaThrownDie(face)` | Korokoro's random source that throws this face of a d6 |
| `TENKA_BACK` | Tenka's own back, as Toranpu's back options |

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

### The calls to learn first

| Call | What it does |
| --- | --- |
| `startTenka(rounds, players, seed, placing?, map?)` | A new game, all of it drawn from the seed |
| `playTenka(game, move)` | The game after a move, or `null` when the rules refuse it |
| `tenkaMoves(game)` | Every move the player to move may make now |
| `sensibleTenkaMove(game, random)` | The computer player's move |
| `tenkaOver(game)` | Whether the game is over |
| `tenkaToJSON(game)`, `tenkaFromJSON(text)`, `encodeTenka`, `decodeTenka` | A game kept, and read back by replaying it |
| `tapTerritory(game, choice, territory)`, `marksFor(game, choice)` | What a press on the map means, and what to light up |
| `mountTenka(element, options?)` and `<tenka-table>` | The table, in one call or one tag |

### The long tables

The tables of every export for playing, the map's facts, cards and dice, keeping and export, the day's seed, taps and words, the table's options and handle, and the element's attributes and events are in [docs/API.md](docs/API.md), and every export of every entry point, with its signature and doc comment, is in the [API reference](https://johnmorrisdotca.github.io/tenka/api.html).

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
| `--tk-die-size` | The size of a die drawn by Korokoro | `34px` | the same |
| `--tk-card-width` | The width of a card drawn by Toranpu, and of the deck | `64px` | the same |
| `--tk-radius` | The map's corners | `10px` | the same |
| `--tk-font` | The table's typeface | `system-ui, …` | the same |

A night-sea table with six colours of its own:

```js no-run
import { mountTenka } from "@johnmorrisdotca/tenka/ui";

mountTenka(document.getElementById("table"), {
  theme: { "--tk-sea": "#16283a", "--tk-link": "#d7e3ee", "--tk-accent": "#d4a017", "--tk-accent-ink": "#1a1405", "--tk-panel": "#f1ead9" },
  colours: ["#b5452c", "#2f5d4a", "#d4a017", "#3a6fb5", "#7a4e9c", "#4a4a44"],
});
```

Drawing the map yourself, the same classes are there to style: `.tk-map`,
`.tk-sea`, `.tk-land`, `.tk-borders`, `.tk-sea-link`, `.tk-ring`,
`.tk-ring-chosen`, `.tk-ring-reach`, `.tk-ring-target` and `.tk-counter`.

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
- **Motion.** The plain table has no animation. Dressed in Korokoro's dice
  ([above](#dice-and-cards-from-korokoro-and-toranpu)), the dice tumble for
  about half a second when a throw is made, and a device that asks for reduced
  motion gets none of it: they land at once. The computer's pause between
  moves is `computerDelayMs`, and 0 plays without it.
- **Not yet.** The arrow keys go by where territories lie on the screen, not
  by the neighbours the rules count, so a sea route is not followed by a key.
  The focus ring is drawn in `--tk-accent`; a page that re-colours it should
  check its contrast.

## Browser support

Any current browser: Chrome, Edge, Firefox and Safari, on a desk or a phone.
It needs ES2020 and, for the table, inline SVG and `ResizeObserver` (without
which the map is drawn once and not again on a change of width). The table is
tested in Chromium and in WebKit, Safari's engine, at phone size with touch
and on a desktop. The rules run in Node 22 and later, Deno, Bun and web
workers, and load by `import` and by `require()`.

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
- Armies moving in, animated on the table. (The dice already tumble, when the
  table is dressed in Korokoro's.)
- A Vue wrapper, beside the React one and the tag.

Left out on purpose: play between devices, which needs a server (the moves
are made to be sent, and Itsutsu sends them; the sending is yours); a command
line; and any name, art or wording of a published game. Tenka runs from a
static page and costs nothing to host.

Ideas and pull requests are welcome.

## Architecture

The rules, the map and the computer player are plain functions over plain data
with no DOM: a game is a value, and every move returns the next one. Drawing
the map is its own entry (`/ui` for plain DOM, `/element` for a tag, `/react`
for React, `/shapes` for the outlines), so a page that only wants the rules loads none of it.
Drawing the table's dice and cards with Korokoro and Toranpu is `/dressing`, the one entry that imports another package.
Dressing the table's dice and cards in the family's own is `/dressing`, the one entry that reaches another package.

The file-by-file tree, with a line on each source file, is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): the rules (`tenka`, `tenkaTurn`, `tenkaMoves`, `tenkaCards`, `tenkaDice`), the maps and their outlines (`tenkaMap`, `*.data`, `shapes`), keeping a game (`tenkaExport`, `tenkaKeep`), the taps and the computer player (`tenkaTaps`, `tenkaPolicy`), and the three faces (`ui`, `element`, `react`). Tests sit beside the code they test (`*.test.ts`). `scripts/` makes the map
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
Tenka is one of twenty-four packages, each made for the same site, each at
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
- [Tobiishi](https://github.com/johnmorrisdotca/tobiishi) (飛び石): peg solitaire with nine boards and seeded solvable challenges. [Demo](https://johnmorrisdotca.github.io/tobiishi/).
- [Jirai](https://github.com/johnmorrisdotca/jirai) (地雷): minesweeper on shaped grids with verified no-guess boards. [Demo](https://johnmorrisdotca.github.io/jirai/).
- [Gunjin](https://github.com/johnmorrisdotca/gunjin) (軍人): five hidden-rank strategy games with pass-the-device play. [Demo](https://johnmorrisdotca.github.io/gunjin/).
- [Karakuri](https://github.com/johnmorrisdotca/karakuri) (からくり): eight hyper-casual puzzle games, some of them physics: draw a shield, pull pins, cut ropes, slide blocks, pour tubes. [Demo](https://johnmorrisdotca.github.io/karakuri/).
- [Houseki](https://github.com/johnmorrisdotca/houseki) (宝石): gem and stone matching puzzles: falling triplets, stone collapse, colour chains and gem swap. [Demo](https://johnmorrisdotca.github.io/houseki/).

**This package is Tenka.** The demos of all twenty-four share one header and footer, so each links the rest.
<!-- family:end -->

## Development

```sh
pnpm install --frozen-lockfile
pnpm check             # lint, types and tests, including the checks on the README's tables and examples
pnpm test:table        # the demo in real browsers, by taps
pnpm test:package      # pack it as npm does, install it and import every entry
pnpm test:frameworks   # the framework examples, built from the packed tarball and played
pnpm test:readme       # every TypeScript and JavaScript example in this README, type-checked and run
pnpm site              # build the demo into ./site
pnpm map               # make the map's territories and outlines again from Natural Earth
pnpm screenshots:readme  # retake the README's pictures into docs/images (builds the demo first)
```

The pictures are taken on the maintainer's Mac and are retaken only when the look changes; they are in `docs/images` and are not in the package that npm installs.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). In short: run `pnpm check` before you push (see [Development](#development)).

Please follow the [code of conduct](./CODE_OF_CONDUCT.md). A way to make a game, a saved game or the map take far too long, or markup that gets out of the drawing, is for the [security policy](./SECURITY.md), not a public issue.

## Changes

See [CHANGELOG.md](./CHANGELOG.md).

The latest release is 2.1.2: the README takes the family's full layout, with pictures of the table and examples that are run.

## Licence

[MIT](./LICENSE) © John Morris. The map is drawn from
[Natural Earth](https://www.naturalearthdata.com/), which is in the public
domain.
