import type { TenkaCardKind, TenkaMapKey } from "../tenka.types.ts";
import type { TenkaLocale } from "../strings.ts";

/** Something a dressing drew: the element to put on the table, and what to do when the table takes it away again (stop a timer, say). */
export type TenkaDrawn = {
  /** What goes on the table. */
  readonly element: Element;
  /** Called once when the table draws it again or goes. Left out when there is nothing to stop. */
  readonly destroy?: () => void;
};

/** What a dressing is told about a die it is asked to draw. */
export type TenkaDieHow = {
  /** Whose die it is: the attacker's or the defender's. */
  side: "attack" | "defend";
  /** Whether the throw has only just been made, so that the die should be seen to land. False when the table is drawn again for any other reason. */
  tumble: boolean;
  /** Where the die stands among the dice of the throw, the attacker's first: 0 for the first. */
  index: number;
  /** How many dice the throw had, both sides together: what a sound for the whole throw needs to know. */
  count: number;
  /** What a screen reader says for the die, in the table's language: "Attacker's die: 4". */
  label: string;
  /** The table's language. */
  locale: TenkaLocale;
};

/** What a dressing is told about a card it is asked to draw. */
export type TenkaCardHow = {
  /** The card's number: 0 and up the territories', then the two wild cards. */
  card: number;
  /** The territory it shows, or null for a wild card. */
  territory: number | null;
  /** Land, sea or air; or wild. */
  kind: TenkaCardKind;
  /** The map the game is on, which decides what the territory looks like. */
  map: TenkaMapKey;
  /** The territory's name in the table's language, or the word for a wild card. */
  name: string;
  /** What a screen reader says for the card, in the table's language: "Land: Brazil". */
  label: string;
  /** The table's language. */
  locale: TenkaLocale;
};

/** What a dressing is told about the back it is asked to draw. */
export type TenkaBackHow = {
  /** What a screen reader says: the deck and how many cards are left in it. */
  label: string;
  /** The table's language. */
  locale: TenkaLocale;
};

/**
 * HOW A TABLE DRAWS ITS DICE AND ITS CARDS, if not the plain way: each is a
 * function that is given what the rules decided and hands back the element to
 * show. A dressing only ever draws. The numbers on the dice, the cards in a
 * hand and the cards left in the deck are the game's, already decided, and a
 * dressing that tumbles a die lands it on the face the game threw, so a game
 * replays move for move whatever it is dressed in. Anything left out is drawn
 * the plain way. `tenkaDressing` from `@johnmorrisdotca/tenka/dressing` makes
 * one out of Korokoro's dice and Toranpu's cards.
 */
export type TenkaDressing = {
  /** One die of the last throw, showing `face` (1 to 6). */
  die?: (face: number, how: TenkaDieHow) => TenkaDrawn;
  /** One card of the hand on the table. */
  card?: (how: TenkaCardHow) => TenkaDrawn;
  /** The back of a card: the deck, drawn beside the hand with the number left in it. Nothing is drawn if this is left out. */
  back?: (how: TenkaBackHow) => TenkaDrawn;
};
