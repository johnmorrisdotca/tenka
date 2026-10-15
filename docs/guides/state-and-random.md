---
title: State and seeded rules
section: explanation
order: 7
description: See how a game is one value, how dice and plans draw from separate random streams, and how the source is laid out.
---

## A game is a value

TenkaGame carries the original setup, territory owners/armies, card hands/deck/discards, phase and turn, the current random state, move history and latest effects. playTenka returns a new game or null. Do not mutate owners or armies to simulate actions: that would bypass captures, phase checks and the record.

## Separate draws from decisions

The game consumes seeded rng for deals, dice and card order. Policy randomness chooses actions. The UI draws results the core already decided. nextRandom, randomBelow, shuffled and throwDice return both a value and the next state, so callers must retain that state when building their own deterministic streams.

## A record reproduces the world

Compact and JSON saves store setup and moves. Replaying validates every transition and regenerates outcomes from the seed. This lets storage be untrusted without accepting a claimed final board. Changing the map or generator can invalidate historical records, so the formats are versioned. [Exports](save-and-replay.md) and [migration](upgrading.md) preserve the boundary.

## Source layout

The file-by-file tree, with a line on each source file, is in [the architecture tree](../ARCHITECTURE.md): the rules (`tenka`, `tenkaTurn`, `tenkaMoves`, `tenkaCards`, `tenkaDice`), the maps and their outlines (`tenkaMap`, `*.data`, `shapes`), keeping a game (`tenkaExport`, `tenkaKeep`), the taps and the computer player (`tenkaTaps`, `tenkaPolicy`), and the three faces (`ui`, `element`, `react`). Tests sit beside the code they test (`*.test.ts`). `scripts/` makes the map
data from public-domain outlines, builds the demo and checks the package as
npm packs it, `demo/` is the page published on GitHub Pages, and `table/`
taps it in real browsers.
