---
title: Read battles and trade cards
section: how-to
order: 3
description: Read battle outcomes from dice, use the native attack and blitz actions, and trade card sets.
---

## Dice decide losses

An attack uses up to three dice according to the source armies, while defense uses up to two. Compare sorted highest pairs: a tied pair favors the defender. battleLosses describes that comparison without changing a game.

```ts
import {battleLosses,throwDice,setsIn,tradeValue} from "@johnmorrisdotca/tenka";
console.log(battleLosses([6,3,1],[4,2]));
console.log(throwDice(42,3).value);
console.log(setsIn([0,1,2,42]),tradeValue(3));
```

## Use native battle actions

The attack move throws once; blitz repeats the battle until it is decided. A capture can require occupy before another attack. The lastRoll stores what the rules threw; UI dressing must show those values rather than roll new dice. See [drawing and dressing](maps-and-dressing.md).

## Trade native sets

The deck belongs to the selected map: territory cards and two wilds. isSet and setsIn evaluate combinations, and tradeValue advances with previous trades. Five in hand forces a trade before placing; elimination can force an immediate exchange with six or more. Never reuse world card indices for Europe without the map. cardTerritory null identifies a wild card.
