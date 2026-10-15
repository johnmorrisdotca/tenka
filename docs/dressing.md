# Dice and cards from Korokoro and Toranpu: your own look

From [the README's section on dressing](../README.md#dice-and-cards-from-korokoro-and-toranpu), with the `TenkaDressing` shape, the card design for Toranpu's own elements and the exports of `/dressing`.

Your own look is a function. A `TenkaDressing` is `{ die?, card?, back? }`,
each given what the game decided and returning an element to show (with
`destroy` if it has a timer to stop); anything left out is drawn plainly. The
cards are also a plain Toranpu design, for Toranpu's own elements:

```ts
import { roll } from "@johnmorrisdotca/korokoro";
import { cardFaceSvg } from "@johnmorrisdotca/toranpu/card-faces";
import { tenkaCardDesign, tenkaCardId, tenkaCardOfId, tenkaThrownDie } from "@johnmorrisdotca/tenka/dressing";

tenkaCardId("world", 11); // → "tenka-world-11"
tenkaCardOfId("tenka-europe-7"); // → { map: "europe", territory: 7 }
tenkaCardOfId("tenka-wild"); // → { wild: true }
roll({ count: 1, sides: 6 }, tenkaThrownDie(5)).faces; // → [5]
cardFaceSvg(tenkaCardId("world", 11), { design: tenkaCardDesign() })?.includes(">Brazil</text>"); // → true
```

`registerCardDesign(tenkaCardDesign())` from Toranpu then lets `<toranpu-card
card="tenka-world-11" design="tenka">` draw a Tenka card anywhere on a page.

| Export of `/dressing` | What it is |
| --- | --- |
| `tenkaDressing(options?)` | The dressing to give a table |
| `tenkaCardDesign()` | Tenka's cards as a Toranpu design, named `tenka` |
| `tenkaCardId(map, territory)`, `tenkaCardOfId(id)` | A card's id in Toranpu's hands, and back |
| `tenkaThrownDie(face)` | Korokoro's random source that throws this face of a d6 |
| `TENKA_BACK` | Tenka's own back, as Toranpu's back options |
