# Contributing

Thank you for helping. Bug reports, ideas, corrections to the Japanese and pull
requests are all welcome.

This first part is the same in every package of the family. It is the master
text kept in
[johnmorrisdotca/.github](https://github.com/johnmorrisdotca/.github/blob/main/CONTRIBUTING.md),
copied unchanged into `scripts/community/CONTRIBUTING.md`, and a test holds
this file to that copy. What is particular to the package follows it, under
the heading "Particular to" and the package's name.

## Before you start

Open an issue first for anything bigger than a typo, so that we can agree on the
shape before you spend time on it. Taking part follows the
[Code of Conduct](CODE_OF_CONDUCT.md); report a security concern privately, as
[SECURITY.md](SECURITY.md) says.

## Making a change

```sh
pnpm install
pnpm check          # format, lint, types, file sizes and tests: the same as CI
pnpm format         # format the code and apply the safe lint fixes
pnpm test:package   # pack it as npm does, install it in an empty project, import every entry
pnpm site           # build the demo into ./site, as GitHub Pages publishes it
```

The package's own further commands (its browser tests, its command line, its
data scripts) are listed under its own heading below.

## House rules, shared by every package of the family

How the code is written, formatted and checked, and why, is in
[CODE-STYLE.md](CODE-STYLE.md), the same text in every package.

- **No runtime dependencies.** Development dependencies are for tests, builds and
  documentation only.
- **The core is pure.** Every function in it returns new values and never
  changes what it was given.
- **Test what you change.** Tests sit beside the code they test. A rule you
  change has a test that would have caught it.
- **At most 500 lines of code a file** under `src/`, not counting blank lines,
  comments, tests or `*.data.ts` data. A file that reaches it is split by what
  it does, never squeezed.
- **Words a person reads come in English and Japanese.** If you cannot write the
  Japanese, say so in the pull request and someone will.
- **Option values and names are kebab case.**
- **Art and sound are CC0 or public domain only**, checked at the source and
  credited. Data and word lists may be under another licence that lets them be
  shipped, with its notice kept in `NOTICE.md`. No GPL or LGPL code.
- **Needs Node 22 or later.**
- **A README table, example or count that a test holds to the code** changes
  together with the code.
- **The family's own files are the same in every package**: `demo/family.css`,
  `scripts/family-template.mjs`, `scripts/family-readme.mjs`,
  `scripts/release-notes.mjs`, the files in `scripts/community/`,
  `CODE-STYLE.md`, `scripts/biome-family.json`, `scripts/check-size.mjs`,
  `src/embed-attributes.ts` where the package has an element, and
  `family.test.js` (in `src/`, or in `test/`). Do not edit one here. To change
  one, change it in every repository at once, bump `FAMILY_TEMPLATE_VERSION` for
  the template, and record the new hash in `family.test.js`. What is the
  package's own goes in its own stylesheet, `demo/<name>.css`, and its page
  builder, `scripts/site.mjs`.
- **The list of the family in the README is made, not written.**
  `pnpm family:readme` writes it between its markers from
  `scripts/family-template.mjs`.
- **The workflows are the family's too.** `ci.yml` runs `pnpm check`, the demo's
  browser tests and the packed package on Linux, macOS and Windows; `pages.yml`
  is the same text in every package. A package adds jobs of its own after those.

## Pull requests

One change per pull request. Say what changed and how you checked it, and add a
line to `CHANGELOG.md` under **Unreleased**: for a change a user would notice,
and for one to the repository alone.

## Releasing

Maintainers bump the version in `package.json` (and in `src/version.ts`, where
the package has one), move *Unreleased* to the new version in `CHANGELOG.md`,
dated, push, wait for CI and tag `vX.Y.Z`, the same as `package.json`'s version.
The Release workflow (`.github/workflows/release.yml`) checks and builds the
package, attaches the tarball to a GitHub release and publishes it to npm by
trusted publishing, with provenance and no token. A version already on npm is
not published again.

## Particular to Tenka

### Reporting a bug

Open an [issue](https://github.com/johnmorrisdotca/tenka/issues/new?template=report-a-bug.md)
with what you did, what you expected and what happened. A game replays exactly
from its seed and its moves, so the table's *Save as JSON* file makes almost
any bug reproducible: attach it if you have it.

### Commands and rules

```sh
pnpm check            # lint, types and tests: the same as CI
pnpm test:table       # the demo in real browsers: builds it, then taps it
pnpm test:package     # npm pack, install the tarball, import and require every entry
pnpm test:frameworks  # the README's examples built in React, Vue, Svelte, Angular and a plain page
pnpm site             # builds the demo into ./site
pnpm pictures         # re-takes the README's two pictures from the built demo
```

- **The rules are pure.** Everything outside `src/ui` and `src/react.tsx` is
  plain functions over plain data, with no DOM and no dependency. A function
  returns a new game and never changes the one it was given.
- **Never break a seed.** Anything random is drawn from the game's own seeded
  random, never from `Math.random`, and a game kept by an earlier version must
  replay move for move. `scripts/check-package.mjs` pins one whole seeded game.
- **Nothing read is trusted.** A game read back (`tenkaFromJSON`,
  `decodeTenka`) is dealt again from its seed and played through the rules.
- **The table is tested by tapping it.** `table/*.table.mjs` are Playwright
  tests that open the built demo in Chromium and WebKit, at a phone's width by
  touch and at a desktop's by mouse, and do what a person does. After every
  flow they check that nothing is wider than the screen, nothing to tap is
  under 44px, and the page complained of nothing. A change to the table comes
  with a test there. The first time, `pnpm exec playwright install chromium
  webkit` fetches the browsers.
- **Words go in `src/strings.ts`**, in English and Japanese, then
  `pnpm docs:make` to bring `docs/strings-ja.md` up to date. Japanese is plain
  and polite, and uses the words players use: 領土, 部隊, 攻撃, 占領, 手番.
- **Examples in the README are run.** `src/docs.test.js` runs every
  TypeScript example and checks each value it states (a line ending
  `// → value`); `scripts/check-frameworks.mjs` takes the React, Vue, Svelte,
  Angular and plain-page examples from the README as they are written, builds
  each from the packed tarball and plays a move.
- **Every export gets a doc comment**, which a test holds, and the README's
  tables (options, theming, limits) are checked against the code.
- **The map is made, not edited.** `pnpm map` writes `src/tenkaWorld.data.ts`
  and `src/tenkaShapes.data.ts` from Natural Earth; change `scripts/map.mjs`.
- **No name, art or wording of a published game.** The rules of a game are
  nobody's property; its name, its map and its words are.
