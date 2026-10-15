---
title: 保存・復元・書き出し
section: how-to
order: 4
description: ゲームを配り方と手として保存し、再生して復元し、読める記録として書き出します。
---

## 配り方と手を保存する

encodeTenkaは版付きの短い文字列を書きます。decodeTenkaは初期設定とシードから再生して確認します。tenkaToJSONは構造化した形式を書き、tenkaFromJSONは短い文字列も読み、最終盤面を信用せず作り直します。

```ts
import {startTenka,encodeTenka,decodeTenka,tenkaToJSON,tenkaFromJSON} from "@johnmorrisdotca/tenka";
const game = startTenka(10,["Seat 1","Seat 2"],42)!;
console.log(decodeTenka(encodeTenka(game))?.seed);
console.log(tenkaFromJSON(tenkaToJSON(game))?.map);
```

## 初期設定を残す

ラウンド数、名前、シード、初期配置、地図を残します。replayTenkaは不正な設定や不可能な手でnullになります。対局した棋譜のシードだけを変えません。さいころ、領地、カードは数列に依存します。

## 読める棋譜を書き出す

tenkaRecordは戦い、交換、脱落、終了を作り直します。tenkaToTextは表示用の言葉、tenkaToCSVは表形式を使います。ホストの名前が含まれる場合があるため、共有前に公開用の席名を選びます。埋め込みのイベントとメッセージは一般的な席名で、ローカルの取得値には元の名前が残ります。[埋め込み仕様](../../embeds.md)に境界があります。
