---
title: 卓を配置し埋め込む
section: how-to
order: 6
description: 卓を配置し埋め込むの使い方と注意点。
---

## DOMの卓を配置する

```ts no-run
import {mountTenka} from "@johnmorrisdotca/tenka/ui";
const host = document.createElement("div");
document.body.append(host);
const table = mountTenka(host,{seed:42,players:["Seat 1","Seat 2"],computers:[false,false],record:false});
console.log(table.game().seed);
table.destroy();
```

取り外すときにdestroyを呼び、イベントや待機中のコンピューター処理を解放します。setGameは復元、newGameは新しい配置です。ReactのTenkaTableもこの寿命を管理します。computerDelayMsは表示の待ち時間です。

## カスタム要素を使う

```ts no-run
import {defineTable,TenkaTable} from "@johnmorrisdotca/tenka/element";
defineTable();
const table = document.createElement("tenka-table") as TenkaTable;
table.options = {seed:42,players:["Seat 1","Seat 2"],computers:[false,false],record:false};
document.body.append(table);
console.log(table.game?.seed);
```

登録用エントリーを読むと既定のタグが登録されます。属性でシード、人数、相手、ラウンド、地図、言語、棋譜、待ち時間、日替わり、表示を選べます。ホスト用optionsでは個人名、言葉の変更、配色、描画、ローカルのコールバックを渡します。

## 個人情報と受け渡しを確認する

フレームは保存領域を読まず、ビルダーは人数と公開設定を共有します。tenka-changeとtenka-loadは一般的な席名のJSON安全なコピーで、ローカルのgameとonChangeにはホストの名前が残ります。親で送信元とoriginを確認します。[埋め込み仕様](../../embeds.md)を参照してください。
