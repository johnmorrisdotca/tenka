---
title: Troubleshooting and FAQ
section: troubleshooting
order: 9
description: Learn troubleshooting and faq.
---

## Setup returned null

Check isTenkaTable and isTenkaSeed, two to six players, a supported round limit, auto/hand placement and world/europe map. The seed is a whole unsigned 32-bit number. A component or table expects valid native options, and an unmounted or invalid custom element can expose a null game.

## A move returned null

Check phase, ownership, neighbours, armies, dice count, compulsory trades, occupation minimum and fortification connectivity. tenkaMoves supplies legal choices. tapTerritory returns a null move when the tap only updates selection; read its choice before asking marksFor.

## A decoder returned null

Malformed/unsupported saves, foreign JSON or an impossible recorded move are refused. Version 1 saves use a different map and cannot replay under 2.x. readTenkaMove validates compact shape; replay validates its legal meaning. cardTerritory null means wild; tenkaCardOfId returns a wild marker or null for an unknown id. landInDirection/nearestLand null means no qualifying territory.

## The table will not load

Use the separate DOM or React entry, register custom tags once and mount in a browser. Install optional dice/card peers before importing dressing. Provide record:false for an explicitly storage-free local table; frames already avoid storage. Keep host names and callbacks local. [Embeds](../embeds.md) and [mounting](mount-and-embed.md) cover options.
