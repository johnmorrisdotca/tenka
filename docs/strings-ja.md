# Tenka's words, in English and Japanese

Made from `src/strings.ts` by `pnpm docs:make`; a test fails if the two differ, so this list is never out of date.

**The Japanese has not yet been reviewed by a native reader.** If a line reads wrongly or unnaturally, please
open a *Fix a translation* issue with the string's name. `{n}`, `{name}` and the other braces are filled in when
shown. ␠ marks a space at the start or end of a string.

| Name | English | Japanese |
| --- | --- | --- |
| `you` | You | あなた |
| `player` | Player {n} | プレイヤー{n} |
| `mapLabel` | Map of the world | 世界地図 |
| `mapKeys` | Arrow keys move between territories; Enter or Space taps one. | 矢印キーで領土を移動し、Enterキーかスペースキーでタップします。 |
| `landSay` | {land}, {owner}, armies {n} | {land}、{owner}、部隊{n} |
| `neutral` | Neutral | 中立 |
| `lookAt` | Look at | 表示する地域 |
| `world` | World | 世界 |
| `europe` | Europe | ヨーロッパ |
| `armiesLabel` | Armies | 部隊の数 |
| `newGame` | New game | 新しいゲーム |
| `trade` | Trade cards | カードを交換 |
| `tradeMust` | Trade cards (you must) | カードを交換（必須） |
| `allOn` | All {n} on {land} | 残りの{n}部隊をすべて{land}に置く |
| `attackWithOne` | Attack with 1 die | ダイス1個で攻撃 |
| `attackWith` | Attack with {n} dice | ダイス{n}個で攻撃 |
| `blitz` | Blitz | 決着がつくまで攻撃 |
| `stopAttacking` | Stop attacking | 攻撃を終える |
| `moveIn` | Move {n} in | {n}部隊を進める |
| `moveTo` | Move {n} to {land} | {n}部隊を{land}へ移動 |
| `endTurn` | End turn | 手番を終える |
| `wins` | {name} takes the world. | {name}が天下を取りました。 |
| `tie` | A tie between {names}. | {names}の引き分けです。 |
| `and` | ␠and␠ | と |
| `listComma` | ,␠ | 、 |
| `sentenceGap` | ␠ | *(nothing)* |
| `round` | Round {n} of {of}. | 第{n}ラウンド（全{of}ラウンド）。 |
| `thinking` | {name} is playing… | {name}の手番です… |
| `setUpSay` | {name}: place an army on one of your territories ({n} left). | {name}: 自分の領土に部隊を1つ置いてください（残り{n}）。 |
| `mustTradeSay` | {name}: five cards or more, so trade a set first. | {name}: カードが5枚以上あります。先にセットを交換してください。 |
| `placeOne` | {name}: place 1 army on your territories. | {name}: 自分の領土に1部隊を置いてください。 |
| `placeSay` | {name}: place {n} armies on your territories. | {name}: 自分の領土に{n}部隊を置いてください。 |
| `attackFrom` | {name}: tap a territory of yours with two armies or more to attack from, or stop attacking. | {name}: 攻撃元にする自分の領土（2部隊以上）をタップするか、攻撃を終えてください。 |
| `attackTo` | {name}: attacking from {land}. Tap a neighbour to attack. | {name}: {land}から攻撃します。攻撃する隣の領土をタップしてください。 |
| `attackReady` | {name}: {from} attacks {to}. | {name}: {from}から{to}を攻撃します。 |
| `occupySay` | {name}: {land} is taken. How many move in? | {name}: {land}を占領しました。何部隊進めますか。 |
| `fortifyFrom` | {name}: move armies once between two of your joined territories, or end your turn. | {name}: つながっている自分の領土の間で、部隊を一度だけ移動できます。移動しないときは手番を終えてください。 |
| `fortifyTo` | {name}: moving from {land}. Tap where to. | {name}: {land}から移動します。移動先をタップしてください。 |
| `fortifyReady` | {name}: from {from} to {to}. | {name}: {from}から{to}へ。 |
| `against` | against | 対 |
| `rollThrows` | , {n} throws | 、{n}回 |
| `rollLost` | : attacker lost {a}, defender lost {d} | ：攻撃側 −{a}、防御側 −{d} |
| `rollTook` | , taken | 、占領 |
| `dieAttack` | Attacker's die: {n} | 攻撃側のダイス：{n} |
| `dieDefend` | Defender's die: {n} | 防御側のダイス：{n} |
| `counts` | {lands} lands, {armies} armies, {cards} cards | 領土{lands}・部隊{armies}・カード{cards}枚 |
| `noCards` | No cards in hand ({name}). | 手札はありません（{name}）。 |
| `cardsInHand` | Cards in hand ({name}) | 手札（{name}） |
| `wild` | Wild | ワイルド |
| `kindLand` | Land | 陸 |
| `kindSea` | Sea | 海 |
| `kindAir` | Air | 空 |
| `card` | {kind}: {land} | {kind}：{land} |
| `deckLeft` | Deck: {n} | 山札：{n}枚 |
| `record` | Record of the game | ゲームの記録 |
| `recordEmpty` | No moves yet. | まだ手はありません。 |
| `saveJson` | Save as JSON | JSONで保存 |
| `saveText` | Save as text | テキストで保存 |
| `saveCsv` | Save as CSV | CSVで保存 |
| `load` | Load a game | ゲームを読み込む |
| `loaded` | Game loaded: {n} moves. | ゲームを読み込みました（{n}手）。 |
| `loadBad` | That file is not a game of Tenka these rules can replay. | このファイルは、再現できる天下のゲームではありません。 |
| `logTitle` | Tenka: {players}; {rounds} rounds; seed {seed} | 天下: {players}、{rounds}ラウンド、シード {seed} |
| `logRound` | Round {n} | 第{n}ラウンド |
| `logPlace` | {name} places {n} on {land}. | {name}が{land}に{n}部隊を置く。 |
| `logTrade` | {name} trades three cards for {n} armies. | {name}がカード3枚を{n}部隊と交換。 |
| `logTradeBonus` | Two more on {land}. | {land}にさらに2部隊。 |
| `logAttack` | {name}: {from} attacks {to}, [{a}] against [{d}]: attacker lost {al}, defender lost {dl}. | {name}: {from}が{to}を攻撃、[{a}] 対 [{d}]：攻撃側 −{al}、防御側 −{dl}。 |
| `logBlitz` | {name}: {from} attacks {to} until it is decided, {n} throws: attacker lost {al}, defender lost {dl}. | {name}: {from}が{to}を決着がつくまで攻撃（{n}回）：攻撃側 −{al}、防御側 −{dl}。 |
| `logTook` | {land} is taken. | {land}を占領。 |
| `logOut` | {name} is out. | {name}は敗退。 |
| `logOccupy` | {name} moves {n} in. | {name}が{n}部隊を進める。 |
| `logEndAttack` | {name} stops attacking. | {name}が攻撃を終える。 |
| `logFortify` | {name} moves {n} from {from} to {to}. | {name}が{from}から{to}へ{n}部隊を移動。 |
| `logEndTurn` | {name} ends the turn. | {name}が手番を終える。 |
| `logCard` | {name} draws a card. | {name}がカードを1枚引く。 |
| `logCounted` | The game is counted after round {n}. Winner: {names}. | 第{n}ラウンド終了で集計。勝者: {names}。 |
| `cNorthAmerica` | North America | 北アメリカ |
| `cSouthAmerica` | South America | 南アメリカ |
| `cEurope` | Europe | ヨーロッパ |
| `cAfrica` | Africa | アフリカ |
| `cAsia` | Asia | アジア |
| `cAustralia` | Australia | オーストラリア |
| `tAlaska` | Alaska | アラスカ |
| `tNorthwestTerritory` | Northwest Territory | ノースウェスト準州 |
| `tGreenland` | Greenland | グリーンランド |
| `tAlberta` | Alberta | アルバータ |
| `tOntario` | Ontario | オンタリオ |
| `tQuebec` | Quebec | ケベック |
| `tWesternUnitedStates` | Western United States | アメリカ西部 |
| `tEasternUnitedStates` | Eastern United States | アメリカ東部 |
| `tCentralAmerica` | Central America | 中央アメリカ |
| `tVenezuela` | Venezuela | ベネズエラ |
| `tPeru` | Peru | ペルー |
| `tBrazil` | Brazil | ブラジル |
| `tArgentina` | Argentina | アルゼンチン |
| `tIceland` | Iceland | アイスランド |
| `tScandinavia` | Scandinavia | スカンジナビア |
| `tGreatBritain` | Great Britain | グレートブリテン島 |
| `tNorthernEurope` | Northern Europe | 北ヨーロッパ |
| `tWesternEurope` | Western Europe | 西ヨーロッパ |
| `tSouthernEurope` | Southern Europe | 南ヨーロッパ |
| `tUkraine` | Ukraine | ウクライナ |
| `tNorthAfrica` | North Africa | 北アフリカ |
| `tEgypt` | Egypt | エジプト |
| `tEastAfrica` | East Africa | 東アフリカ |
| `tCongo` | Congo | コンゴ |
| `tSouthAfrica` | South Africa | 南アフリカ |
| `tMadagascar` | Madagascar | マダガスカル |
| `tUral` | Ural | ウラル |
| `tSiberia` | Siberia | シベリア |
| `tYakutsk` | Yakutsk | ヤクーツク |
| `tKamchatka` | Kamchatka | カムチャツカ |
| `tIrkutsk` | Irkutsk | イルクーツク |
| `tMongolia` | Mongolia | モンゴル |
| `tJapan` | Japan | 日本 |
| `tAfghanistan` | Afghanistan | アフガニスタン |
| `tChina` | China | 中国 |
| `tMiddleEast` | Middle East | 中東 |
| `tIndia` | India | インド |
| `tSiam` | Siam | シャム |
| `tIndonesia` | Indonesia | インドネシア |
| `tNewGuinea` | New Guinea | ニューギニア |
| `tWesternAustralia` | Western Australia | オーストラリア西部 |
| `tEasternAustralia` | Eastern Australia | オーストラリア東部 |
| `tWesternRussia` | Western Russia | ロシア西部 |
| `cBritishIsles` | Britain and Ireland | イギリス・アイルランド |
| `cScandinavia` | The Nordic Countries | 北欧 |
| `cIberia` | Iberia | イベリア |
| `cMaghreb` | The Maghreb | マグリブ |
| `cFrance` | France | フランス |
| `cGermany` | Germany and the Low Countries | ドイツ・低地諸国 |
| `cCentralEurope` | Central Europe | 中欧 |
| `cItaly` | Italy | イタリア |
| `cBalkans` | The Balkans and Turkey | バルカン・トルコ |
| `cBaltic` | Poland and the Baltic | ポーランド・バルト |
| `cEasternEurope` | Eastern Europe | 東欧 |
| `tScotland` | Scotland | スコットランド |
| `tEngland` | England | イングランド |
| `tWales` | Wales | ウェールズ |
| `tIreland` | Ireland | アイルランド |
| `tNorway` | Norway | ノルウェー |
| `tSweden` | Sweden | スウェーデン |
| `tFinland` | Finland | フィンランド |
| `tDenmark` | Denmark | デンマーク |
| `tPortugal` | Portugal | ポルトガル |
| `tLeonCastile` | León-Castile | レオン・カスティーリャ |
| `tNavarre` | Navarre | ナバラ |
| `tBarcelona` | Barcelona | バルセロナ |
| `tValencia` | Valencia | バレンシア |
| `tGranada` | Granada | グラナダ |
| `tMorocco` | Morocco | モロッコ |
| `tAlgeria` | Algeria | アルジェリア |
| `tTunisia` | Tunisia | チュニジア |
| `tNormandy` | Normandy | ノルマンディー |
| `tBrittany` | Brittany | ブルターニュ |
| `tFrance` | France | フランス |
| `tBurgundy` | Burgundy | ブルゴーニュ |
| `tFriesland` | Friesland | フリースラント |
| `tSaxony` | Saxony | ザクセン |
| `tLorraine` | Lorraine | ロレーヌ |
| `tFranconia` | Franconia | フランケン |
| `tSwabia` | Swabia | シュヴァーベン |
| `tBavaria` | Bavaria | バイエルン |
| `tBohemia` | Bohemia | ボヘミア |
| `tHighlands` | Highlands | 高地地方 |
| `tHungary` | Hungary | ハンガリー |
| `tLombardy` | Lombardy | ロンバルディア |
| `tRome` | Rome | ローマ |
| `tKingdomOfSicily` | Kingdom of Sicily | シチリア王国 |
| `tSardinia` | Sardinia | サルデーニャ |
| `tVenice` | Venice | ヴェネツィア |
| `tSerbia` | Serbia | セルビア |
| `tGreece` | Greece | ギリシャ |
| `tBulgaria` | Bulgaria | ブルガリア |
| `tTurkey` | Turkey | トルコ |
| `tPomerania` | Pomerania | ポメラニア |
| `tPrussia` | Prussia | プロイセン |
| `tPoland` | Poland | ポーランド |
| `tLithuania` | Lithuania | リトアニア |
| `tEstonia` | Estonia | エストニア |
| `tNovgorod` | Republic of Novgorod | ノヴゴロド共和国 |
| `tSmolensk` | Smolensk | スモレンスク |
| `tPolotsk` | Polotsk | ポロツク |
| `tRusland` | Rusland | ルーシ |
| `tGalicia` | Galicia | ガリツィア |
