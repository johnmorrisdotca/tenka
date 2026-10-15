---
title: Share a daily starting deal
section: how-to
order: 5
description: Share a daily starting deal from the UTC date, and keep past days reproducible.
---

## One UTC calendar date

```ts
import {tenkaDay,tenkaDailySeed,startTenka} from "@johnmorrisdotca/tenka";
const at = new Date("2026-10-12T12:00:00Z");
const seed = tenkaDailySeed(at);
console.log(tenkaDay(at),seed);
console.log(startTenka(10,["Seat 1","Seat 2"],seed)?.seed);
```

The seed is YYYYMMDD in UTC. The same seed, round limit, player count, placement and map reproduce the same opening. Later player choices are not fixed by the daily seed. tenkaDay throws RangeError for an invalid Date.

## Choose explicit settings

Share public seat count and computer choices rather than personal names. A builder URL describes setup; a saved game describes a played record. The daily option lets an embed choose the current UTC day's seed and reports that setup through its normal native behavior.

## Preserve a past day

For a fixed historic puzzle, keep the numeric daily seed instead of relying on a live daily option. Pin the package major, and keep the full setup and version for longer-term replay. [Saving](save-and-replay.md) and [migration](upgrading.md) explain map-version boundaries.
