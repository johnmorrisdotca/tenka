# Contributing to Tenka

Thank you for helping. Bug reports, rule questions, corrections to the
Japanese and pull requests are all welcome.

## Reporting a bug

Open an [issue](https://github.com/johnmorrisdotca/tenka/issues/new?template=report-a-bug.md)
with what you did, what you expected and what happened. A game replays exactly
from its seed and its moves, so the table's *Save as JSON* file makes almost
any bug reproducible: attach it if you have it.

## Making a change

```sh
git clone https://github.com/johnmorrisdotca/tenka
cd tenka
pnpm install
pnpm check            # lint, types and tests: the same as CI
pnpm test:table       # the demo in real browsers: builds it, then taps it
pnpm test:package     # npm pack, install the tarball, import and require every entry
pnpm test:frameworks  # the README's examples built in React, Vue, Svelte, Angular and a plain page
pnpm site             # builds the demo into ./site
pnpm pictures         # re-takes the README's two pictures from the built demo
pnpm dlx serve site   # or any static server
```

- **The rules are pure.** Everything outside `src/ui` and `src/react.tsx` is
  plain functions over plain data, with no DOM and no dependency. A function
  returns a new game and never changes the one it was given.
- **Never break a seed.** Anything random is drawn from the game's own seeded
  random, never from `Math.random`, and a game kept by an earlier version must
  replay move for move. `scripts/check-package.mjs` pins one whole seeded game.
- **Nothing read is trusted.** A game read back (`tenkaFromJSON`,
  `decodeTenka`) is dealt again from its seed and played through the rules.
- **Test what you change.** Tests sit beside their source as `*.test.ts`.
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
- **The demo wears the family's look.** `demo/family.css` is the same file in
  every sibling package's demo, and a test fails if it differs from its
  recorded hash. What is Tenka's own goes in `demo/tenka.css`.
- **No dependencies.** The package has none at run time and should stay so.
- **No name, art or wording of a published game.** The rules of a game are
  nobody's property; its name, its map and its words are.
- One change per pull request, with a line in `CHANGELOG.md` under
  *Unreleased*.

## House rules, shared by every package of the family

- Open an issue first for anything bigger than a typo, so that we can agree on the shape before you spend time on it.
- No runtime dependencies. Every function that plays or checks a game is pure: it returns new values and never changes what it was given.
- Tests sit beside the code they test. A rule you change has a test that would have caught it.
- Words a player reads come in English and Japanese. If you cannot write the Japanese, say so in the pull request and someone will.
- Option values and names are kebab case.
- Art and sound are CC0 or public domain only, checked at the source, and credited in the README. No GPL or LGPL code.
- Needs Node 22 or later. A change a user would notice gets a line in `CHANGELOG.md`.

## Releasing

Maintainers bump the version in `package.json` and `src/version.ts` and move
*Unreleased* to the new version in `CHANGELOG.md`, dated. Pushing the tag
`vX.Y.Z` runs the Release workflow, which checks that the tag matches
`package.json`, runs the checks, builds the package, installs and uses it as
npm packs it, attaches the tarball to a GitHub release, and publishes it to
npm with provenance, through npm's trusted publishing (no token is kept). A
version already on npm is not published again. The workflow can also be run
by hand.

By contributing you agree that your work is released under the
[MIT licence](LICENSE), and to follow the [code of conduct](CODE_OF_CONDUCT.md).
