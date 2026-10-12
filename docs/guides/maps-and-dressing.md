---
title: Maps, SVG and dressing
section: explanation
order: 8
description: Learn maps, svg and dressing.
---

## Rules use the graph

The world and Europe maps have territory indices, continent membership and land/sea neighbours. The rules read that graph; they do not need Natural Earth outlines. The shapes entry carries prebuilt SVG paths separately, and the UI map model combines shapes with owners, army counters and chosen/reachable/target rings.

```ts
import {startTenka} from "@johnmorrisdotca/tenka";
import {tenkaMapModel,continentView} from "@johnmorrisdotca/tenka/ui";
const game = startTenka(10,["Seat 1","Seat 2"],42,"auto","europe")!;
console.log(tenkaMapModel(game).lands.length,continentView(null,"europe"));
```

## Keep geographic data out of runtime fetching

The map scripts derive checked geometry at development time. The shipped table has that data locally; no map service is needed. tenkaMapSvg creates a DOM SVG element. React TenkaMap draws a model through React; keyboard territory selection uses native map coordinates and visible bounds.

## Dress results without changing them

The optional dressing entry uses Korokoro dice and Toranpu cards with Tenka's territory designs. Install those optional peers only when using that entry. tenkaThrownDie returns a Korokoro RandomSource object with next, not a callable function; it forces a predecided face. Custom die/card/back callbacks return an element and optional destroy callback. If a drawing callback fails, the table falls back to its plain drawing. See [UI reference](entry:ui) and [dressing reference](entry:dressing).
