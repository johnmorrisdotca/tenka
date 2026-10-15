---
title: 手番を進める
section: how-to
order: 2
description: 1手番の段階に従い、合法かどうかはエンジンに任せ、コンピューターの手を進めます。
---

## 段階に従う

手動の初期配置では席を順に回り、兵を1つずつ置きます。通常の手番は増援、攻撃、必要な占領、補強、移動数の指定へ進みます。tenkaMovesは今の段階で合法な手を返し、終了後は空になります。

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

## エンジンに任せる

想定した段階の順番だけで手を作りません。必須のカード交換は増援中や脱落後に必要になることがあります。占領には最低の兵数があり、補強には自分の領地の接続が必要です。戻り値のreserve、occupying、shifting、phaseを読みます。

## コンピューターの選択

sensibleTenkaMoveは渡した乱数を使って操作を選びます。再現したい場合は再現できる乱数を渡します。さいころにはゲームのrngを使い、操作の選択用の乱数は別です。ホスト側の試行回数に上限を置き、終了したゲームで方針を呼びません。[状態と乱数](state-and-random.md)を参照してください。
