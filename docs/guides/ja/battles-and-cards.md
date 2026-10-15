---
title: 戦いとカード交換
section: how-to
order: 3
description: さいころによる戦いの結果を読み、attackとblitzの操作を使い、カードの組を交換します。
---

## さいころで損失を決める

攻撃側は兵数に応じて最大3個、防御側は最大2個を使います。高い順に組を比較し、同じ目なら防御側が勝ちます。battleLossesはその比較だけを行い、ゲームは変えません。

```ts
import {battleLosses,throwDice,setsIn,tradeValue} from "@johnmorrisdotca/tenka";
console.log(battleLosses([6,3,1],[4,2]));
console.log(throwDice(42,3).value);
console.log(setsIn([0,1,2,42]),tradeValue(3));
```

## パッケージの戦いの操作を使う

attackは1回振り、blitzは決着まで繰り返します。取った後は次の攻撃前にoccupyが必要な場合があります。lastRollにルールが出した目があります。装飾はその値を表示し、新しく振りません。[地図と装飾](maps-and-dressing.md)を参照してください。

## カードの組を交換する

デッキは選んだ地図の領地カードと2枚のワイルドです。isSetとsetsInで組を調べ、tradeValueは交換済みの回数で進みます。5枚あると配置前に交換が必要で、脱落させた後に6枚以上ある場合も即座に交換が必要です。世界の番号をヨーロッパへそのまま使いません。cardTerritoryがnullならワイルドです。
