---
title: 日替わりの配置を共有する
section: how-to
order: 5
description: 日替わりの配置を共有するの使い方と注意点。
---

## UTCの日付を1つ使う

```ts
import {tenkaDay,tenkaDailySeed,startTenka} from "@johnmorrisdotca/tenka";
const at = new Date("2026-10-12T12:00:00Z");
const seed = tenkaDailySeed(at);
console.log(tenkaDay(at),seed);
console.log(startTenka(10,["Seat 1","Seat 2"],seed)?.seed);
```

シードはUTCの日付をYYYYMMDDの数にしたものです。シード、ラウンド数、人数、初期配置、地図が同じなら開始時の配置が再現されます。その後の操作は日替わりシードでは決まりません。不正なDateではtenkaDayがRangeErrorを投げます。

## 設定を明示する

個人名ではなく公開用の人数やコンピューターの設定を共有します。ビルダーのURLは初期設定、保存ゲームは対局した記録です。dailyで埋め込みが今のUTC日のシードを選べます。

## 過去の日を残す

固定した問題にはdailyではなく、数値のシードを残します。メジャー版を固定し、長期の再生には全設定と版を保存します。[保存](save-and-replay.md)と[移行](upgrading.md)に地図の版の境界があります。
