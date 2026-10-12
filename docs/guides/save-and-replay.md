---
title: Save, restore and export
section: how-to
order: 4
description: Learn save, restore and export.
---

## Save the original deal and moves

encodeTenka writes compact versioned text. decodeTenka validates it by replaying from the original table and seed. tenkaToJSON writes the structured exported format; tenkaFromJSON also accepts compact text and rebuilds the state instead of trusting a supplied final board.

```ts
import {startTenka,encodeTenka,decodeTenka,tenkaToJSON,tenkaFromJSON} from "@johnmorrisdotca/tenka";
const game = startTenka(10,["Seat 1","Seat 2"],42)!;
console.log(decodeTenka(encodeTenka(game))?.seed);
console.log(tenkaFromJSON(tenkaToJSON(game))?.map);
```

## Keep all setup choices

Preserve rounds, players, seed, placing and map. replayTenka applies the record and returns null for invalid setup or any impossible move. Never edit the seed beneath a played record: every die, shuffled territory and card depends on its stream.

## Export a readable record

tenkaRecord reconstructs detailed roll, trade, elimination and end results. tenkaToText uses local words, and tenkaToCSV writes the tabular record. These exports can include names supplied locally; choose deliberate public seat labels before sharing. The native embed events and frame messages use generic seat labels, while local getters retain names. [The embed contract](../embeds.md) documents this boundary.
