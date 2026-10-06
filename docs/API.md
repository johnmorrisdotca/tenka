# The API in full

The long tables of exports from [Tenka's README](../README.md#api), moved here to keep the README under the length npm shows. Every export is also in the [API reference](https://johnmorrisdotca.github.io/tenka/api.html), made from the source.

## Playing

| Export | What it does |
| --- | --- |
| `startTenka(rounds, players, seed, placing?, map?)` | A new game, all of it drawn from the seed; `null` for a table the game is not offered for. `placing` is `"auto"` (starting armies scattered) or `"hand"` (placed one at a time round the table); `map` is `"world"` (the default) or `"europe"` |
| `playTenka(game, move)` | The game after the move, or `null` when the rules refuse it |
| `tenkaMoves(game)` | Every move the player to move may make now |
| `attacksOpen(game)` | Every attack open now, with each number of dice, and each as a blitz |
| `sensibleTenkaMove(game, random)` | The computer player's move; `random` is `Math.random` or a seeded function |
| `tenkaOver(game)` | Whether the game is over |
| `mustTrade(game)` | Whether the player to move must trade cards first |
| `tenkaAgain(game, seed)` | The same table again with a new seed |
| `isTenkaTable(rounds, count)`, `isTenkaSeed(seed)` | Whether a table or a seed is one `startTenka` takes |
| `reinforcementFor(owners, seat)` | The armies a turn brings |
| `territoriesHeld(owners, owner)`, `armiesHeld(game, owner)` | How many territories, and armies, an owner has |
| `tenkaPlayerName(game, seat)`, `cleanTenkaName(name)` | A seat's name as the table reads it; a name tidied and cut to 20 characters |
| `nextSeatIn(game, seat)` | The next player still in |
| `beginTurn`, `endOfTurn`, `counted`, `finished` | The steps every move passes through, for rules built on these |

## The map's facts

| Export | What it is |
| --- | --- |
| `TENKA_MAPS`, `TENKA_MAP_LIST` | Every map, by key (`world`, `europe`): its `territories`, `continents` and each territory's `neighbours` |
| `tenkaMapOf(game)` | The map a game is played on: the world for a game that names none |
| `boardOf(map)` | The map an argument names, and the world for anything else (an array's index, handed in by `map`) |
| `TENKA_TERRITORIES`, `TENKA_TERRITORY_COUNT` | The world's forty-two territories: `key`, `name`, `continent`, and neighbours by `land` and by `sea` |
| `TENKA_CONTINENTS`, `tenkaContinent(key)` | The six continents: `key`, `name`, `kanji`, `bonus`, `territories` |
| `tenkaNeighbours(territory)`, `areNeighbours(a, b)` | Where an army may go from a territory |
| `isTerritory(n)` | Whether a number is a territory's |
| `continentsHeld(owners, seat)` | The continents a player holds whole |
| `connectedOwn(owners, from)` | Where one fortifying move may take armies |

Each of these takes the map as a last argument, the world when it is left out:
`tenkaNeighbours(5, tenkaMapOf(game))`.

## Cards and dice

| Export | What it does |
| --- | --- |
| `TENKA_DECK` | Every card of the world: 0 to 41 the territories', 42 and 43 wild |
| `tenkaDeckFor(map)` | Every card of a game on that map: one for each territory, then the two wild |
| `cardKind(card, map?)`, `cardTerritory(card, map?)`, `isWild(card, map?)` | What a card shows |
| `isSet(cards, map?)`, `setsIn(hand, map?)` | Whether three cards make a set; every set in a hand |
| `tradeValue(trades)` | What the next set is worth |
| `throwDice(state, count)` | Dice from the game's random, highest first, and the state after them |
| `battleLosses(attack, defend)` | Who loses what |
| `mostAttackDice(armies)`, `defendDice(armies)` | The dice each side may throw |
| `nextRandom(state)`, `randomBelow(state, below)`, `shuffled(state, items)` | The game's random: Mulberry32, one 32-bit number of state |

## Keeping and export

| Export | What it does |
| --- | --- |
| `tenkaToJSON(game)`, `tenkaFromJSON(text)` | A game as JSON, and back, or `null` |
| `tenkaExported(game)` | The JSON export's object (`TenkaExported`) |
| `tenkaToText(game, strings?)` | A game as plain text, a line to a move |
| `tenkaToCSV(game)`, `TENKA_CSV_COLUMNS` | A game as CSV, a row to a move |
| `tenkaRecord(game)` | Each move with what came of it (`TenkaRecordEntry[]`) |
| `encodeTenka(game)`, `decodeTenka(text)` | A game on one line for a browser's storage, and back |
| `replayTenka(table, moves)` | A game made again from its table and its moves |
| `writeTenkaMove(move)`, `readTenkaMove(list)` | One move as a short list, and back |
| `TENKA_EXPORT_FORMAT`, `TENKA_VERSION` | The JSON's format number, and this package's version |

## The day's seed

| Export | What it does |
| --- | --- |
| `tenkaDay(date)` | The day a moment falls on, in UTC, written `YYYY-MM-DD` |
| `tenkaDailySeed(date)` | That day's seed: the date as a number, so 2026-10-01 is `20261001` |

```ts
import { startTenka, tenkaDailySeed } from "@johnmorrisdotca/tenka";

tenkaDailySeed(new Date("2026-10-01T12:00:00Z")); // → 20261001
startTenka(10, ["Ann", "Ben"], tenkaDailySeed(new Date("2026-10-01T23:00:00Z")))!.toPlay; // → startTenka(10, ["Ann", "Ben"], 20261001)!.toPlay
```

The day is the UTC date, so it changes at one moment for the whole world, and
everybody who starts from it with the same players and length is dealt the same
game. It is the same number as Tane's `dailySeed`, so a page that uses both
agrees; Tenka does not need Tane. What a player does with the deal is their own.

## Taps and words

| Export | What it does |
| --- | --- |
| `tapTerritory(game, choice, territory)` | What a press means now: the next choice, and a move if it is one |
| `marksFor(game, choice)` | What the map lights up |
| `choiceNow(game, choice)`, `NO_CHOICE` | A choice read against the game as it now stands; nothing chosen |
| `TENKA_STRINGS`, `tenkaStrings(locale, own?)` | Every word in English and Japanese; a table for a locale with your own laid over it |
| `tenkaSay(line, values)` | A line with its braces filled in |
| `territoryNameIn(strings, key)`, `continentNameIn(strings, key)` | A territory's or a continent's name in a table of strings |

The constants are in the tables under [The rules it plays](#the-rules-it-plays)
and [Limits](#limits), with `TENKA_PHASES`, `TENKA_MOVES`, `TENKA_PLACING`,
`TENKA_CARD_KINDS`, `TENKA_WILD` and `TENKA_NEUTRAL` for comparing by name.
The types are `TenkaGame`, `TenkaMove`, `TenkaMoveKind`, `TenkaPhase`,
`TenkaPlacing`, `TenkaSeat`, `TenkaOwner`, `TenkaCard`, `TenkaCardKind`,
`TenkaRoll`, `TenkaTrade`, `TenkaChoice`, `TenkaMapMarks`, `TenkaContinent`,
`TenkaContinentKey`, `TenkaTerritoryData`, `TenkaShapes`, `TenkaExported`,
`TenkaRecordEntry`, `TenkaStrings` and `TenkaLocale`.

## The table

`mountTenka(element, options?)` from `@johnmorrisdotca/tenka/ui` draws and
plays a whole game in the element, and returns a handle.

| Option | Default | What it does |
| --- | --- | --- |
| `players` | You, Kaze, Yama | The names round the table, in seat order: two to six |
| `computers` | every seat but the first | Which seats the computer plays. All `false` passes one device round |
| `rounds` | `60` | Rounds before the count: 10, 20, or 60 for the whole world |
| `seed` | a new one each game | The seed every deal and die is drawn from |
| `map` | `"world"` | The map: `"world"` or `"europe"` |
| `colours` | `TENKA_SEAT_COLOURS` | A CSS colour for each seat |
| `computerDelayMs` | `450` | How long the computer waits before each of its moves |
| `onChange` | | Called with the game after every move |
| `locale` | the page's `lang` | `"en"` or `"ja"` |
| `strings` | | Words of your own, laid over the locale's |
| `theme` | | CSS variables set on the table itself |
| `record` | `true` | Whether the record of the game, with saving and loading, is shown |
| `dressing` | the plain dice and cards | How the dice and cards are drawn: [`tenkaDressing()`](#dice-and-cards-from-korokoro-and-toranpu) draws them with Korokoro and Toranpu |

| Handle | What it does |
| --- | --- |
| `game()` | The game as it stands |
| `newGame(options?)` | A new game at the same table; `players`, `computers`, `rounds`, `seed` and `map` may change |
| `setGame(game, computers?)` | Put a game on the table: one read back by `tenkaFromJSON` |
| `setLocale(locale, strings?)` | Change the table's language |
| `destroy()` | Take the table off the page and stop its timers |

To draw the map yourself, the same entry has `tenkaMapModel(game, marks?,
colours?)`, which works out every territory's colour, counter and ring;
`tenkaMapSvg(model, { label?, view?, pixels?, describe?, keys? })`, which draws
it as an `<svg>` whose shapes and counters carry `data-territory` and whose
territories are named buttons for a screen reader (`describe` words what is
read for each, `keys` is the drawing's description);
`landInDirection(territory, arrow, map?, view?)`, the territory an arrow key
moves to; `continentView(key)`, the
part of the map that frames a continent; `nearestLand(x, y, reach)`, for a
press on the sea beside an island (each of the two takes the map's key last);
`TENKA_MAP_SHAPES` and `tenkaShapesOf(map)`, how each map is drawn; and `TENKA_SEAT_COLOURS`,
`TENKA_NEUTRAL_COLOUR`, `ownerColour(owner, colours?)`, `NO_MARKS` and
`TENKA_STYLE`, the table's stylesheet as a string.

## The element

`<tenka-table>` is `mountTenka` as a tag: `@johnmorrisdotca/tenka/element/define`
defines it, and `@johnmorrisdotca/tenka/element` holds the class alone. Each
attribute is read again when it changes, and a change to any but `lang` deals a
new game. A table the rules do not offer (one player, say, or 15 rounds) draws
nothing.

| Attribute | Default | What it does |
| --- | --- | --- |
| `players` | You, Kaze, Yama | The names round the table, in seat order, separated by commas: two to six |
| `computers` | every seat but the first | `true` or `false` for each seat, separated by commas, or `none` for people taking turns on one device, or `all` |
| `rounds` | `60` | 10, 20, or 60 for the whole world |
| `seed` | a new one each game | A whole number to deal from, or `daily` for the day's seed |
| `map` | `world` | `world` or `europe` |
| `lang` | the page's | `en` or `ja` |
| `record` | on | `off` leaves the record of the game out |
| `delay` | `450` | How long the computer waits before each of its moves, in milliseconds |

It fires `tenka-change` after every move, with the game as `event.detail.game`
(a bubbling `CustomEvent`), and has `game`, `table` (the handle `mountTenka`
returns), `newGame(options?)` and `setGame(game, computers?)`. Its `dressing`
property, which an attribute cannot carry, takes `tenkaDressing()`. To style it,
set the table's variables on `tenka-table .tk-root`: see [Theming](#theming).
