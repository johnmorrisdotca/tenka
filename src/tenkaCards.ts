import {
  TENKA_CARD_KINDS,
  TENKA_TRADE_STEP,
  TENKA_TRADE_VALUES,
  TENKA_WILD,
  TENKA_WILD_CARDS,
} from "./tenka.constants.ts";
import type { TenkaCard, TenkaCardKind, TenkaMap } from "./tenka.types.ts";
import { TENKA_MAPS, TENKA_TERRITORY_COUNT, boardOf } from "./tenkaMap.ts";

/**
 * THE CARDS: one for every territory, each showing one of three kinds (land,
 * sea, air, dealt round the map in turn so there are fourteen of each), and
 * two wild cards that stand for any kind. A card is earned at the end of any
 * turn in which the player took a territory; three that make a set are
 * traded for armies.
 */

/** Every card in the game: the territories' cards, then the wild cards.
 *
 * @example
 * ```ts
 * import { TENKA_DECK } from "@johnmorrisdotca/tenka";
 * console.log(TENKA_DECK);
 * ```
 */
export const TENKA_DECK: readonly TenkaCard[] = Array.from({ length: TENKA_TERRITORY_COUNT + TENKA_WILD_CARDS }, (_, card) => card);

/** Every card of a game on this map: a card for each territory, numbered as the territories are, then the wild cards.
 *
 * @param map - The native world or Europe map to use.
 * @returns Every card of a game on this map: a card for each territory, numbered as the territories are, then the wild cards.
 * @example
 * ```ts
 * import { TENKA_MAPS, tenkaDeckFor } from "@johnmorrisdotca/tenka";
 *
 * console.log(tenkaDeckFor(TENKA_MAPS.europe).length);
 * ```
 */
export function tenkaDeckFor(map: TenkaMap = TENKA_MAPS.world): TenkaCard[] {
  return Array.from({ length: boardOf(map).territories.length + TENKA_WILD_CARDS }, (_, card) => card);
}

/** Whether a card is one of the two wild cards.
 *
 * @param card - The card index within this map’s deck.
 * @param map - The native world or Europe map to use.
 * @returns Whether a card is one of the two wild cards.
 * @example
 * ```ts
 * import { isWild } from "@johnmorrisdotca/tenka";
 *
 * console.log(isWild(42));
 * ```
 */
export function isWild(card: TenkaCard, map: TenkaMap = TENKA_MAPS.world): boolean {
  return card >= boardOf(map).territories.length;
}

/** What a card shows: land, sea or air for a territory's card, in turn round the map; wild for a wild card.
 *
 * @param card - The card index within this map’s deck.
 * @param map - The native world or Europe map to use.
 * @returns What a card shows: land, sea or air for a territory's card, in turn round the map; wild for a wild card.
 * @example
 * ```ts
 * import { cardKind } from "@johnmorrisdotca/tenka";
 *
 * console.log(cardKind(0));
 * ```
 */
export function cardKind(card: TenkaCard, map: TenkaMap = TENKA_MAPS.world): TenkaCardKind {
  return isWild(card, map) ? TENKA_WILD : TENKA_CARD_KINDS[card % TENKA_CARD_KINDS.length];
}

/** The territory a card shows, or null for a wild card.
 *
 * @param card - The card index within this map’s deck.
 * @param map - The native world or Europe map to use.
 * @returns The territory index, or null for a wild card.
 * @example
 * ```ts
 * import { cardTerritory } from "@johnmorrisdotca/tenka";
 *
 * console.log(cardTerritory(42));
 * ```
 */
export function cardTerritory(card: TenkaCard, map: TenkaMap = TENKA_MAPS.world): number | null {
  return isWild(card, map) ? null : card;
}

/**
 * Whether three cards make a set: three of one kind, one of each kind, or
 * any two with a wild card (a wild card stands for whatever the set needs).
 *
 * @param cards - The card indices to test as a set.
 * @param map - The native world or Europe map to use.
 * @returns Whether three cards make a set: three of one kind, one of each kind, or any two with a wild card (a wild card stands for whatever the set needs).
 * @example
 * ```ts
 * import { isSet } from "@johnmorrisdotca/tenka";
 *
 * console.log(isSet([0,1,2]));
 * ```
 */
export function isSet(cards: readonly TenkaCard[], map: TenkaMap = TENKA_MAPS.world): boolean {
  if (cards.length !== 3 || new Set(cards).size !== 3) return false;
  const kinds = cards.filter((card) => !isWild(card, map)).map((card) => cardKind(card, map));
  if (kinds.length < 3) return true;
  const different = new Set(kinds).size;
  return different === 1 || different === 3;
}

/** Every set a hand holds, each as its three cards smallest first, in order.
 *
 * @param hand - The cards held by a player.
 * @param map - The native world or Europe map to use.
 * @returns Every set a hand holds, each as its three cards smallest first, in order.
 * @example
 * ```ts
 * import { setsIn } from "@johnmorrisdotca/tenka";
 *
 * console.log(setsIn([0,1,2,42]));
 * ```
 */
export function setsIn(hand: readonly TenkaCard[], map: TenkaMap = TENKA_MAPS.world): TenkaCard[][] {
  const sorted = [...hand].sort((a, b) => a - b);
  const sets: TenkaCard[][] = [];
  for (let i = 0; i < sorted.length; i += 1) {
    for (let j = i + 1; j < sorted.length; j += 1) {
      for (let k = j + 1; k < sorted.length; k += 1) {
        const three = [sorted[i], sorted[j], sorted[k]];
        if (isSet(three, map)) sets.push(three);
      }
    }
  }
  return sets;
}

/** What the next set traded in is worth, when `trades` sets have been traded before it: 4, 6, 8, 10, 12, 15, 20, 25…
 *
 * @param trades - The number of sets already traded.
 * @returns What the next set traded in is worth, when `trades` sets have been traded before it: 4, 6, 8, 10, 12, 15, 20, 25…
 * @example
 * ```ts
 * import { tradeValue } from "@johnmorrisdotca/tenka";
 *
 * console.log(tradeValue(3));
 * ```
 */
export function tradeValue(trades: number): number {
  if (trades < TENKA_TRADE_VALUES.length) return TENKA_TRADE_VALUES[trades];
  return TENKA_TRADE_VALUES.at(-1)! + TENKA_TRADE_STEP * (trades - TENKA_TRADE_VALUES.length + 1);
}
