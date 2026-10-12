---
title: Mount and embed a table
section: how-to
order: 6
description: Learn mount and embed a table.
---

## Mount the DOM table

```ts no-run
import {mountTenka} from "@johnmorrisdotca/tenka/ui";
const host = document.createElement("div");
document.body.append(host);
const table = mountTenka(host,{seed:42,players:["Seat 1","Seat 2"],computers:[false,false],record:false});
console.log(table.game().seed);
table.destroy();
```

Destroy the handle on unmount to release listeners and pending computer work. setGame restores a native game; newGame starts a new deal. The React TenkaTable wraps that lifecycle. Set computerDelayMs for presentation, not game rules.

## Use the custom element

```ts no-run
import {defineTable,TenkaTable} from "@johnmorrisdotca/tenka/element";
defineTable();
const table = document.createElement("tenka-table") as TenkaTable;
table.options = {seed:42,players:["Seat 1","Seat 2"],computers:[false,false],record:false};
document.body.append(table);
console.log(table.game?.seed);
```

The registration entry defines the default tag as a side effect. Attribute setup accepts seed, seats, computers, rounds, map, language, record, delay, daily and display settings. Host options accept private names, word overrides, custom palettes, drawing callbacks and local change callbacks.

## Check privacy and transport

Frames read no storage; the builder shares seat count and public settings. tenka-change/tenka-load expose JSON-safe game-shaped copies with generic seat names; the local game getter and onChange retain the host's names. Validate message source and origin in parents. The [embed guide](../embeds.md) contains every attribute, event and frame message; keep it as the integration contract.
