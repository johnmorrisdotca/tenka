---
title: 地図・SVG・装飾
section: explanation
order: 8
description: ルールが読む地図の接続関係を使い、SVGで描き、KorokoroのさいころとToranpuのカードで卓を飾ります。
---

## ルールは接続関係を使う

世界とヨーロッパの地図には領地番号、大陸、陸と海の隣接関係があります。ルールは輪郭ではなく、その関係を読みます。輪郭は別エントリーで持ち、UIのモデルが所有者、兵数、選択や到達候補の印を組み合わせます。

```ts
import {startTenka} from "@johnmorrisdotca/tenka";
import {tenkaMapModel,continentView} from "@johnmorrisdotca/tenka/ui";
const game = startTenka(10,["Seat 1","Seat 2"],42,"auto","europe")!;
console.log(tenkaMapModel(game).lands.length,continentView(null,"europe"));
```

## 実行中に地図を取得しない

開発時にスクリプトで形を作り確認します。卓にはデータが含まれ、地図サービスは不要です。tenkaMapSvgはDOMのSVG要素を作ります。ReactのTenkaMapはReactで表示し、キーボードの選択は地図の座標と表示範囲を使います。

## 結果を変えずに装飾する

任意の装飾エントリーでKorokoroのさいころとToranpuのカードを使います。その場合だけ対応するパッケージを入れます。tenkaThrownDieは呼べる関数ではなくnextを持つ乱数オブジェクトで、決定済みの目を表示します。独自の描画は要素と任意のdestroyを返します。失敗すると簡単な標準表示へ戻ります。[UI](entry:ui)と[装飾](entry:dressing)を参照してください。
