---
title: はじめに
section: tutorial
order: 1
description: Tenkaを入れ、シードでゲームを始め、可能な手を1手進めます。
---

Tenkaは2〜6人用の、シードから始まる世界征服ゲームのエンジンです。基本機能はデータだけを使い、DOM、時計、実行時の依存パッケージは不要です。別の卓用エントリーで表示と操作を行えます。

## インストール

```sh
npm install @johnmorrisdotca/tenka
```

Node 22以降や新しいブラウザーを使います。ReactはReact用の機能、KorokoroとToranpuはさいころとカードの装飾を使う場合だけ必要です。

## 開始して合法な手を進める

```ts
import {startTenka,tenkaMoves,playTenka} from "@johnmorrisdotca/tenka";
let game = startTenka(10,["Seat 1","Seat 2"],42);
if (!game) throw new Error("Invalid setup");
const move = tenkaMoves(game)[0];
const next = playTenka(game,move);
if (next) game = next;
console.log(game.phase,game.moves.length);
```

startTenkaの引数はラウンド数、プレイヤー名、シードの順です。不正な設定ではnullになります。playTenkaも拒否した手ではnullを返します。nullでないときだけ返されたゲームを保存します。名前はローカル用で、共有の識別子ではありません。

## 次の使い方

[手番](play-a-turn.md)、[戦いとカード](battles-and-cards.md)、[棋譜](save-and-replay.md)、[日替わり](daily-games.md)、[卓と埋め込み](mount-and-embed.md)、[公開API](entry:main)へ進めます。
