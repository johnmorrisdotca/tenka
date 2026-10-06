# Changelog

All notable changes to this project are written down here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.1.2] - 2026-10-06

Nothing that was exported has changed.

### Changed

- The README takes the family's one layout, fully: a hero picture of the demo on a desk and on a phone in light and dark, a picture of the world, Europe, a continent, the record, the players and the table dressed in Korokoro's dice and Toranpu's cards, an Install section, an Examples section of eleven examples whose output is what they print, and a short list of the calls to learn first. Its pictures are in `docs/images` (WebP, light and dark) and are retaken with `pnpm screenshots:readme` (it replaces `pnpm pictures` and the three JPEGs `docs/desktop.jpg`, `docs/phone.jpg` and `docs/dressed.jpg`); they are not in the tarball, and `pnpm test:package` fails if one is.
- To keep the README under the 64,000 characters npm can show, the long tables of exports (playing, the map's facts, cards and dice, keeping and export, the day's seed, taps and words, the table's options and handle, the element's attributes) moved to `docs/API.md`, and the source tree moved to `docs/ARCHITECTURE.md`, each with a summary and a link left in the README. "Dice and cards from Korokoro and Toranpu" is a section of its own, no longer under the API. Nothing was removed, and the tests that hold these tables to the code read the README and `docs/API.md` together.
- `pnpm test:readme` type-checks and runs every TypeScript and JavaScript example in the README against the built package, as a CI job of its own, and `pnpm check` holds the README to the family's lint.
- Repository only: the package and everything it exports are unchanged. `CONTRIBUTING.md` is the family's one text with a section of its own for Tenka, held to the master in johnmorrisdotca/.github by `src/family.test.js`; `ci.yml` and `pages.yml` are the family's one text (`pnpm check`, the demo, and the package on Linux, macOS and Windows), and any jobs of the package's own after them.

### Fixed

- The API reference page wraps a long entry path instead of running about 2 px wider than a 360 px screen. Nothing the package exports has changed.

## [2.1.1] - 2026-10-05

Nothing that was exported has changed.

### Added

- A test holds every `@johnmorrisdotca/tenka@N` version pin in the README to this package's major version.

### Changed

- The family's list, in the README and in the demo's footer, names all twenty-four packages, Karakuri and Houseki included.
- The npm description is one sentence of 250 characters or fewer, so npm and its search show it whole; it is also the repository's About text. `homepage` is the demo site and `author` is `"John Morris"`, the same in every package.
- The GitHub Actions workflows use the current versions of the actions (checkout 7, setup-node 7, pnpm/action-setup 6; configure-pages 6, upload-pages-artifact 5 and deploy-pages 5 for Pages), which clears GitHub's Node 20 deprecation warning.
- The README's jsDelivr example, the CDN address in the framework check and the note in `src/element-define.ts` named `@1`; they name `@2`, this package's major version.

## [2.1.0] - 2026-10-02

Nothing that was exported has changed; the rules, both maps and every saved game (kept version 2, export format 2) are exactly as they were. The dice and cards the table draws can now be Korokoro's and Toranpu's; by default they are drawn as before. This is a minor release (2.1.0).

### Added

- **`@johnmorrisdotca/tenka/dressing`**, a new entry: `tenkaDressing(options?)` makes a `TenkaDressing` that draws the table's dice with Korokoro and its cards with Toranpu. The dice are Korokoro's, with pips, and tumble onto the faces the game threw (a die lands on `tenkaThrownDie(face)`, the source Korokoro throws from) only when a move has just thrown them, never when the table is drawn again for another reason; a device that asks for reduced motion lands them at once, and `sound: true` plays the sound of real dice once for each throw. Each card in hand is Toranpu's, drawn with its own territory's outline from the map, its name in the table's language, its region and the symbol of its army (a castle for land, a ship for sea, a plane for air); the wild cards show all three. The deck sits beside the hand face down, in Tenka's own back (`TENKA_BACK`: the table's green, with 天), with the number left in it. Also exported: `tenkaCardDesign()` (the cards as a Toranpu design named `tenka`, for Toranpu's own elements), `tenkaCardId` and `tenkaCardOfId`.
- **`dressing` in the table's options**, in `mountTenka`, on the React `TenkaTable` and as the `<tenka-table>` element's `dressing` property; a `TenkaDressing` is `{ die?, card?, back? }`, each given what the game decided and returning the element to show, so a look of your own is a function. The types (`TenkaDressing`, `TenkaDrawn`, `TenkaDieHow`, `TenkaCardHow`, `TenkaBackHow`) are exported from `/ui`. A dressing only draws: the game is the same, move for move and dice for dice, dressed or plain, and a dressing that throws is replaced by the plain drawing. Every die carries its number as `data-face`, and every card `data-card` and `data-territory`, plain or dressed.
- **Three words in both languages** (`dieAttack`, `dieDefend`, `deckLeft`): "Attacker's die: 4" for a screen reader, and "Deck: 41" beside the deck. Two theme variables, `--tk-die-size` and `--tk-card-width`.
- **README:** "Dice and cards from Korokoro and Toranpu", with a picture (`docs/dressed.jpg`, taken by `pnpm pictures`); the demo's table is dressed, and `?dressing=off` shows the plain one.

### Dependencies

- **`@johnmorrisdotca/korokoro` (1.15 or later) and `@johnmorrisdotca/toranpu` (2.14 or later) are optional peer dependencies**, imported by `/dressing` and by nothing else. Tenka still has no dependencies: the rules, the map, saving, the computer player and the plain table (`/ui`, `/react`, `/element`) never import either, and `pnpm test:package` installs the package without them and imports every other entry, then installs them and proves `/dressing`. Without them, importing `/dressing` fails naming the missing package. A page with no bundler needs an import map, as the demo's has.

### Changed

- The demo's table is dressed (`?dressing=off` for the plain one), carrying the files of Korokoro and Toranpu it reaches under `vendor/`; the table in a tag stays plain. If they cannot be fetched the table is drawn plain.
- The table's tests read the dice from `data-face` and not from the text of the line, and a new `table/dressed.table.mjs` checks the dice against the numbers the game threw, each card against its territory's own outline and name, the deck, that a dressed and a plain table make the same game from the same taps, and that the dice tumble once.

## [2.0.0] - 2026-10-02

**This is a major release: both maps, the world and Europe, are different maps, and games kept by 1.x do not play on either.**

The world map is now the classic world-conquest board's, as a graph (John, 2026-10-02: "I only want equal to the original"): the same forty-two territories in the same six continents, with exactly the same eighty-three pairs of territories that touch by land or are joined across the water, and the same continent bonuses. Only geography is used: the names are places and who borders whom is a fact, and no artwork, wording or name of any published game is. Europe is the classic Europe board's the same way, below.

### Changed

- **The forty-two territories are the classic ones.** North America: Alaska, Northwest Territory, Greenland, Alberta, Ontario, Quebec, Western United States, Eastern United States, Central America. South America: Venezuela, Peru, Brazil, Argentina. Europe: Iceland, Scandinavia, Great Britain, Northern Europe, Western Europe, Southern Europe, Ukraine. Africa: North Africa, Egypt, East Africa, Congo, South Africa, Madagascar. Asia: Ural, Siberia, Yakutsk, Kamchatka, Irkutsk, Mongolia, Japan, Afghanistan, China, Middle East, India, Siam. Australia: Indonesia, New Guinea, Western Australia, Eastern Australia. Their keys are camel-case versions of those names (`northwestTerritory`, `greatBritain`, `middleEast`, `newGuinea`), and their Japanese names are new.
- **The continents' bonuses are the classic ones:** North America 5 (9 territories), South America 2 (4), Europe 5 (7), Africa 3 (6, it was 4), Asia 7 (12), Australia 2 (4). Oceania is Australia: the continent key is `australia`, and the zoom button says so in both languages.
- **The map is drawn from Natural Earth's provinces, states and regions** (admin-1, public domain, 1:50m) as well as its countries, so that Canada, the United States, Russia, China and Australia are cut along real borders: Alberta is British Columbia, Alberta and Saskatchewan; Ontario is Ontario and Manitoba; Ukraine is European Russia with the Caucasus, Ukraine, Belarus, Moldova and the Baltic states; Mongolia has Manchuria, Inner Mongolia and Korea with it, across the sea from Japan. `scripts/map-world.mjs` lays the territories out, `scripts/classic-edges.mjs` is the graph, and `scripts/map.mjs` refuses to write a map whose borders and sea links do not make exactly that graph.
- **Sea links, twenty-five of them, join what the classic board joins and the land does not:** Alaska to Kamchatka (off both edges of the map), Greenland to the Northwest Territory, Ontario, Quebec and Iceland, Iceland to Great Britain and Scandinavia, Great Britain to Scandinavia, Northern Europe and Western Europe, Western and Southern Europe to North Africa, Southern Europe to Egypt, Brazil to North Africa, East Africa to the Middle East, Madagascar to East and South Africa, Ukraine to Afghanistan across the Caspian, Kamchatka and Mongolia to Japan, Siam to Indonesia, and Indonesia, New Guinea and Eastern and Western Australia to one another as the classic board has them. Madagascar's and Australia's are drawn from one territory's counter to the other's, so that none is a stub.
- **Cards follow the territories**, as they did: a card for each of the forty-two, and the same two wild cards. The armies each player starts with, and every other rule, are unchanged.
- The world's dashed sea lines are drawn differently: Madagascar's and Australia's run from one territory's counter to the other's (`scripts/map.mjs` takes `anchors` for that, and `also` for a second line on the same link).

### What breaks

- **Games kept by 1.x do not replay on either map.** Their seeds deal other territories, and their moves name other territory numbers. A kept game (`encodeTenka`) is now version 2 and the JSON export (`tenkaToJSON`) is format 2; `decodeTenka` and `tenkaFromJSON` return `null` for any game kept at version 1, world or Europe, rather than replaying it as another game. The demo, which keeps the game being played, starts a new one when it finds an old save.
- **Territory keys, indices, names and counts have changed** (`TENKA_TERRITORIES`, every `key`, the strings `tAlaska`... and `cOceania`, now `cAustralia`; `"oceania"` is `"australia"` in `TenkaContinentKey` and in a map's `continents`). Alaska is still territory 0 and the Northwest Territory is territory 1, but most of the others have moved.
- **The seeded game that pins the package** (seed 2026, three players, ten rounds) now takes 356 moves, not 357.
- The CSV and text exports name the new territories.

### Europe

- **Europe is the classic Europe board's, as a graph, exactly.** John, 2026-10-02: the maps are to be equal to the original boards. Forty-nine named areas (Scotland, England, Wales, Ireland, Norway, Sweden, Finland, Denmark, Estonia, the Republic of Novgorod, Lithuania, Prussia, Pomerania, Polotsk, Smolensk, Friesland, Saxony, Poland, Rusland, Galicia, Lorraine, Franconia, Bohemia, Highlands, Normandy, Brittany, France, Burgundy, Swabia, Bavaria, Lombardy, Venice, Rome, the Kingdom of Sicily, Sardinia, Hungary, Serbia, Bulgaria, Greece, Turkey, León-Castile, Portugal, Navarre, Barcelona, Valencia, Granada, Morocco, Algeria and Tunisia) take the place of the thirty-seven modern ones, with eighty-two borders on land and nineteen dashed routes across the water. Every territory key is new (`scotland`, `leonCastile`, `kingdomOfSicily`…), so nothing that named a Europe territory by key or number means what it did, and the deck is fifty-one cards, not thirty-nine. Only the geography is used: no artwork, wording, logo or name of any published game.
- **Europe's eleven regions are different, and Tenka's own** (the board has none): Britain and Ireland, the Nordic Countries, Iberia, the Maghreb, France, Germany and the Low Countries, Central Europe, Italy, the Balkans and Turkey, Poland and the Baltic, Eastern Europe. `TenkaEuropeRegionKey` loses `italyBalkans`, `danube`, `russia` and `anatolia` and gains `germany`, `italy`, `balkans` and `baltic`; the bonuses are in the README.
- **Europe is drawn from provinces, not countries**, by `scripts/map-europe.mjs` (`pnpm map europe` runs it), so a historical area can be a stretch of several modern countries: Denmark runs on down the German coast, Venice is the Adriatic's far shore, Rusland is the Ukraine. The frame is the board's: Ireland to the Caucasus and the Maghreb's coast to the Arctic Circle, so Iceland is no longer on the Europe map.
- **`scripts/map.mjs europe` hands over to `scripts/map-europe.mjs`**, and the Europe branches of `map.mjs` are gone; the world is built by `map.mjs` as before.
- **`scripts/europe-edges.mjs`**, the graph written out by hand, which `pnpm map europe` holds the drawn borders to (it refuses to write a map whose borders differ) and which `tenkaEurope.test.ts` holds the finished map to a second time, written out again there by name.
- **`scripts/europe-units.mjs`**, which gives each province of Natural Earth's admin-1 file (1:10m, public domain) to its territory, with a few straight cuts through a province (Bavaria, Lower Saxony, Leningrad).

## [1.3.0] - 2026-10-01

Nothing that was exported has changed; the rules, the maps and every saved game are exactly as they were.

### Added

- **`<tenka-table>`**, the whole table as a tag, with no framework: `@johnmorrisdotca/tenka/element/define` defines it (or `…/element` holds the class alone), and `players`, `computers`, `rounds`, `seed`, `map`, `lang`, `record` and `delay` are attributes, read again when they change. It fires `tenka-change` after every move. A table the rules do not offer draws nothing.
- **A game a day**: `tenkaDailySeed(date)` is the UTC date as a number (2026-10-01 is `20261001`), the same seed for everybody and the same number as Tane's `dailySeed`; `tenkaDay(date)` writes the day. The tag takes `seed="daily"`, and the demo has Today's game.
- **Played from a keyboard.** Each territory on the table is a named button (its holder and its armies); Tab lands on one, the arrow keys move to the nearest territory in that direction among those on the screen (`landInDirection`), and Enter or Space taps it. The keyboard stays put after each move. `tenkaMapSvg` takes `describe` and `keys`, and the React `TenkaMap` makes each territory a button when it is given `onTerritory`. Two words are new in both languages for it (`landSay`, `neutral`) and one for the map's description (`mapKeys`).
- **Demo:** a table in a tag, Today's game, and Copy link, which copies an address that deals the same game (its seed, players, length and map).
- **README:** an Accessibility section, "The element", "The day's seed", and the list of all sixteen packages of the family.
- SECURITY.md and CODE_OF_CONDUCT.md are the family's shared text, held equal by a test; a pull request template; the family's house rules in CONTRIBUTING.md.

### Changed

- **Node 22 or later** (`engines`), where it said 20, which is out of support and was never tested. The package's `sideEffects` now names the one file that defines the tag.
- **A Help switch in the demo.** Beside the language chooser in the family header, shared by every demo. Off (the default) the page is as it was; on, each option row (the players, the length, the map, and the table's view chooser) says in one plain line what it does, in English or Japanese, and every button in it has the same words as its hover text. Kept on the device.
- The README's pictures are taken again, with the Help switch in the header.

### Fixed

- The React `TenkaTable` did not pass its `map` prop on, so a table for Europe came up as the world. It does now.

## [1.2.1] - 2026-10-01

Nothing that was exported has changed.

### Added

- **An API reference page**, `api.html` on the demo site: every export of every entry point, with its signature and its doc comment, made from the source when the site is built so it cannot fall behind the code. The README and the demo's header link to it, and a test holds it to the source.
- **An Architecture section in the README**: how the source is split and what each file is for, held to the real files by a test.

### Changed

- The family's footer lists Jarajara.

## [1.2.0] - 2026-10-01

### Added

- **Europe**, a second map: thirty-seven territories in eleven regions, from
  Iceland to the Urals and from the North Cape to the Maghreb, built from
  Natural Earth's countries at 1:50m by `pnpm map europe`
  (`scripts/map-europe.mjs`), with its regions' bonuses and every name in
  English and Japanese. `startTenka(…, "europe")`, the table's `map` option,
  and `TENKA_EUROPE_SHAPES`.
- `TENKA_MAPS`, `TENKA_MAP_LIST`, `tenkaMapOf`, `boardOf`, `tenkaDeckFor`,
  `TENKA_MAP_SHAPES` and `tenkaShapesOf`; every function that reads the map
  takes it as a last argument, the world when it is left out.

Nothing that was exported has changed for the world: a game names its map only
when it is not the world, so every game kept or exported by 1.1.0 reads and
replays exactly as it did.

## [1.1.0] - 2026-09-30

Nothing that was exported has changed, and a game kept by 1.0 replays move for
move.

### Added

- **Export and import.** `tenkaToJSON` writes a game as versioned JSON
  (`"format": 1`), its table and its moves, and `tenkaFromJSON` reads it back
  by dealing the game again and playing every move through the rules, so
  nothing in a file is trusted. `tenkaToText` is a game as plain text, a line
  to a move, with every throw of the dice; `tenkaToCSV` is a row to a move for
  a spreadsheet; `tenkaRecord` is the same record as data. `tenkaExported`,
  `TENKA_EXPORT_FORMAT`, `TENKA_CSV_COLUMNS`, `TenkaExported` and
  `TenkaRecordEntry` with them.
- **English and Japanese.** Every word the table shows, the names of the
  forty-two territories and six continents, and the lines of the written
  record are in one table, `TENKA_STRINGS`, in both languages, listed side by
  side in `docs/strings-ja.md`. `mountTenka` takes `locale` and `strings`,
  follows the page's `lang`, and its handle has `setLocale`. `tenkaStrings`,
  `tenkaSay`, `territoryNameIn`, `continentNameIn`, `TenkaStrings` and
  `TenkaLocale`. The Japanese has not yet been reviewed by a native reader.
- **The record of the game on the table**: the moves as text as the game goes,
  buttons to save it as JSON, text or CSV, and to load a saved game back.
  `record: false` leaves it off, and the handle has `setGame`.
- **Theming.** The rings, the counters, the dice, the map's corners and the
  typeface are CSS variables as the other colours were (`--tk-ring`,
  `--tk-ring-target`, `--tk-counter-edge`, `--tk-counter-ink`, `--tk-attack`,
  `--tk-attack-ink`, `--tk-defend`, `--tk-defend-ink`, `--tk-radius`,
  `--tk-font`), and `mountTenka` takes a `theme`.
- `TENKA_VERSION`.
- `tenkaMapSvg` writes `data-owner` and `data-armies` on each territory, and a
  class on each ring.
- A doc comment on every export, held by a test.
- The demo in English and Japanese, with the record, saving and loading.
- Checks: the package packed by npm, installed in an empty project, and every
  entry imported and required, on Linux, macOS and Windows; every example in
  the README run; the table tapped in Chromium and WebKit; and the table
  built and played in React, Vue, Svelte, Angular and a plain page.

### Changed

- Everything to be tapped on the table is at least 44px: the buttons, the
  views of the continents, the slider.
- The line under the dice says which side lost what: "attacker lost 1,
  defender lost 2".
- `package.json` has `main`, `module` and `types` beside `exports`, for tools
  that read those.

## [1.0.1] - 2026-09-30

### Fixed

- The package loads through `require()` as well as `import` (Node 22 and
  later, and test runners that compile to CommonJS): each export's condition is
  `default` rather than `import`.

## [1.0.0] - 2026-09-30

The first stable release: the API as documented in the README is now kept stable
until a 2.0.0.

### Changed

- The world wraps round: Alaska and the Russian Far East are neighbours across
  the Bering Strait, drawn off one edge of the map and on at the other.
- Two more sea links, Britain to Central Europe and Southern Europe to Egypt,
  and every sea crossing is drawn long enough to read at a whole-world view.
- Every continent frames on screen at one tap: the far northern islands are
  drawn but no longer framed, and an island past the seam is left off.

## [0.1.0] - 2026-09-30

The first release.

### Added

- The rules of the classic world-conquest game for two to six players, as pure
  functions over a plain game value: reinforcing, trading sets of cards,
  attacking one throw at a time or until it is decided, moving in, fortifying,
  knocking a player out and taking their cards, and the count at the end of the
  last round.
- A neutral army for a game of two, and starting armies placed at random or by
  hand.
- Every deal, shuffle and die drawn from the game's own seeded random, so a game
  replays exactly from its seed and moves; a game kept as text and read back,
  refusing anything that does not replay.
- Every legal move listed, and a sensible computer player.
- A map of the modern world in forty-two territories and six continents, built
  from Natural Earth, with neighbours by land and by sea.
- What a tap on the map means in each part of a turn, and what to light up.
- A whole table in plain DOM (`@johnmorrisdotca/tenka/ui`): the map with a
  look at each continent, the players, your cards and the dice, against the
  computer or passing one device round; light and dark, themeable through CSS
  variables.
- `TenkaMap` and `TenkaTable`, React components, from
  `@johnmorrisdotca/tenka/react`.
- A static demo for GitHub Pages.

[Unreleased]: https://github.com/johnmorrisdotca/tenka/compare/v2.1.1...HEAD
[2.1.1]: https://github.com/johnmorrisdotca/tenka/compare/v2.1.0...v2.1.1
[1.1.0]: https://github.com/johnmorrisdotca/tenka/releases/tag/v1.1.0
[1.0.1]: https://github.com/johnmorrisdotca/tenka/releases/tag/v1.0.1
[1.0.0]: https://github.com/johnmorrisdotca/tenka/releases/tag/v1.0.0
[0.1.0]: https://github.com/johnmorrisdotca/tenka/commits/v1.0.0
