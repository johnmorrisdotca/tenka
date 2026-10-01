# Changelog

All notable changes to this project are written down here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/johnmorrisdotca/tenka/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/johnmorrisdotca/tenka/releases/tag/v1.1.0
[1.0.1]: https://github.com/johnmorrisdotca/tenka/releases/tag/v1.0.1
[1.0.0]: https://github.com/johnmorrisdotca/tenka/releases/tag/v1.0.0
[0.1.0]: https://github.com/johnmorrisdotca/tenka/commits/v1.0.0
