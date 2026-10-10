# Embed a Tenka table

Use the [builder](https://johnmorrisdotca.github.io/tenka/builder.html) for custom
elements, modules, React 19, Vue, Svelte, Angular, HTML blocks and iframe URLs.
Load `@johnmorrisdotca/tenka/element/define`, or register a custom tag with
`defineTable(tag?)` from the element entry. Imports and registration are server-safe.
All attributes in the API table reflect as properties. `options` accepts every
native `TenkaTableOptions` field, including private player names, colours, words,
callbacks and custom dice/card drawing. The existing `dressing`, `game`, `table`,
`newGame(options?)` and `setGame(game, computers?)` interfaces remain available.

## Setup, dates and appearance

`seats` makes two to six generic seats when no player names are supplied.
`computers` supports all, none or comma-separated true/false seats; by default
all but the first are computers. The native game uses world or Europe territory
data and lengths of 10, 20 or 60 rounds. `daily` accepts a real UTC YYYY-MM-DD,
today or off. It uses the existing native daily seed; `seed="daily"` remains an
alias. Dates override numeric seeds; explicit daily=off disables the alias.
The same setup reproduces the initial game, not subsequent player choices.

`size` small/medium/large means widths 320/480/640 pixels. Explicit width takes
priority and fits a narrower parent; removing it restores the host's earlier
width. Themes work independently in documents and shadow roots. Language,
palette, record, delay, callbacks and drawing changes preserve the game. Game
settings redeal. The map's native keyboard controls remain: arrows move between
territories, Enter/Space selects one; map redraws preserve shadow-root focus.

## Frames and data

Frames live at `embed/` with validated attribute-named query parameters.
Private player names are ignored; the builder exposes only generic seats.
The frame stores nothing and disables the manual record by default. Turning
record on provides the existing file download/load controls without automatic
storage. Static assets and the optional native code are served locally or by
jsDelivr. No tracking or services are introduced.

`tenka-change` and `tenka-finish` carry `{ game }` as JSON-safe copies with
players replaced by Seat 1, Seat 2, etc. Native callbacks and the local getter
keep private names. `tenka-load` carries seed, UTC day, rounds, map and seat count;
`tenka-error` carries a plain message and shows a localized status. All events
bubble and compose. The frame posts `{ type, detail }`; hosts check `event.origin`
against the exact GitHub Pages origin and `event.source` against their iframe.
These events describe local games, including the hands; use the native network
rules rather than these events to hide cards in a network game.

## Troubleshooting and upgrading

Existing seed=daily, computers lists, save/restore methods and event game fields
remain. Event player labels are generic now; trusted code uses game or callbacks
for original names. Invalid local seats/length/date show a status; fixing the
choice mounts again. The builder and frame ignore invalid query choices.
Native `set` updates presentation without redealing; `setLocale` remains available.
Use a sufficiently tall iframe for manual records or many seats; builder height
is conservative and grows with the preview. Private names belong in host options,
not a copied setup link.
