---
title: Play a complete turn
section: how-to
order: 2
description: Learn play a complete turn.
---

## Follow the phase

Manual setup places one army at a time around the seats. An ordinary turn reinforces, attacks, occupies a captured territory when required, fortifies and shifts armies when that choice waits. tenkaMoves lists legal moves for the current phase, and returns none for a finished game.

```ts
import {startTenka,tenkaMoves,playTenka,tenkaOver} from "@johnmorrisdotca/tenka";
let game = startTenka(10,["Seat 1","Seat 2"],42)!;
for (let n=0;n<8 && !tenkaOver(game);n++) {
  const move = tenkaMoves(game)[0];
  const next = move && playTenka(game,move);
  if (!next) break;
  game = next;
}
console.log(game.round,game.phase,game.moves.length);
```

## Keep control with the engine

Do not build moves from an assumed phase order alone. A compulsory card trade can interrupt reinforcement or follow elimination. Occupation requires its native minimum; fortification requires owned connected territories. Read reserve, occupying, shifting and phase after each returned state.

## Computer policies

sensibleTenkaMove chooses from native phase decisions using a supplied random source. Supply a reproducible source for reproducible choices. The engine's dice use the game's rng; policy randomness selects actions and is a separate input. Bound host simulation work and stop on over rather than calling a policy on a finished game. [State design](state-and-random.md) explains the separation.
