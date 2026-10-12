---
title: Getting started
section: tutorial
order: 1
description: Learn getting started.
---

Tenka is a seeded world-conquest engine for two to six players. The core uses plain data and needs no DOM, clock or runtime dependency. A separate table entry draws and plays the game.

## Install

```sh
npm install @johnmorrisdotca/tenka
```

Use Node 22 or later or modern browsers. React is an optional peer for the React entry; Korokoro and Toranpu are optional peers for dice/card dressing.

## Start and play a legal move

```ts
import {startTenka,tenkaMoves,playTenka} from "@johnmorrisdotca/tenka";
let game = startTenka(10,["Seat 1","Seat 2"],42);
if (!game) throw new Error("Invalid setup");
const move = tenkaMoves(game)[0];
const next = playTenka(game,move);
if (next) game = next;
console.log(game.phase,game.moves.length);
```

startTenka takes rounds, players and seed, in that order. It returns null for invalid setup; playTenka returns null for a refused move. Keep the returned game only when non-null. The players are local names, not shared identifiers.

## Pick a recipe

[Turns](play-a-turn.md), [battles/cards](battles-and-cards.md), [records](save-and-replay.md), [daily games](daily-games.md), [tables/embeds](mount-and-embed.md) and the [reference](entry:main) cover the next steps.
