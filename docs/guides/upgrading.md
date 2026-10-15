---
title: Upgrading and other engines
section: upgrading
order: 10
description: Move from 1.x to 2.x, update within 2.x, and come from a mutable-board or networked engine.
---

## From 1.x to 2.x

Version 2 changed territory keys, indices, names and counts to the classic world/Europe boards. Compact kept version 2 and JSON format 2 refuse version 1 games instead of replaying their indices on another map. Preserve old software alongside old records if you must inspect them; begin new 2.x games explicitly. Oceania became australia in continent keys. The [2.0 changelog](../../CHANGELOG.md) preserves the full changes.

## Updating within 2.x

2.1 added optional card/dice dressing; plain and dressed tables run the same rules. Preserve seeds, map and move records. A seed alone is not enough without table settings and compatible rules.

## Coming from mutable or network engines

Use a new returned game for each legal transition, and treat null as refusal. Keep names local and separate presentation from rules. A host can transport moves, but should replay and validate them instead of trusting client boards. Keep external coordinates and card indices mapped to the selected native board. [State design](state-and-random.md) and [save/restore](save-and-replay.md) explain the integration.
