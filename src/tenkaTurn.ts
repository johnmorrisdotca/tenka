import { TENKA_LEAST_REINFORCEMENT, TENKA_NAME_MOST, TENKA_PHASES, TENKA_TERRITORIES_PER_ARMY } from "./tenka.constants.ts";
import type { TenkaGame, TenkaOwner, TenkaSeat, TenkaMap } from "./tenka.types.ts";
import { shuffled } from "./tenkaDice.ts";
import { TENKA_MAPS, continentsHeld, tenkaMapOf } from "./tenkaMap.ts";

/**
 * HOW A TURN BEGINS AND ENDS, and how a game is counted: the parts of the
 * rules every move handler in `tenka.ts` passes through. Pure, as the rest:
 * each returns a new game.
 */

/** A name as the table typed it, tidied: spaces run together, trimmed, cut to `TENKA_NAME_MOST`.
 *
 * @param name - The player name to clean for display.
 * @returns A name as the table typed it, tidied: spaces run together, trimmed, cut to `TENKA_NAME_MOST`.
 * @example
 * ```ts
 * import { cleanTenkaName } from "@johnmorrisdotca/tenka";
 *
 * console.log(cleanTenkaName("  Seat 1  "));
 * ```
 */
export function cleanTenkaName(name: string): string {
  return name.replace(/\s+/g, " ").trim().slice(0, TENKA_NAME_MOST);
}

/** A seat's name as the table reads it: the one given, or "Player 3".
 *
 * @param game - The current native game state.
 * @param seat - The zero-based player seat.
 * @returns A seat's name as the table reads it: the one given, or "Player 3".
 * @example
 * ```ts
 * import { startTenka, tenkaPlayerName } from "@johnmorrisdotca/tenka";
 *
 * const game = startTenka(10,["Seat 1","Seat 2"],42)!;
 * console.log(tenkaPlayerName(game,0));
 * ```
 */
export function tenkaPlayerName(game: Pick<TenkaGame, "players">, seat: TenkaSeat): string {
  const given = game.players[seat]?.trim() ?? "";
  return given === "" ? `Player ${seat + 1}` : given;
}

/** How many territories an owner holds.
 *
 * @param owners - The territory owners in native map order.
 * @param owner - The seat index, or the neutral-owner marker.
 * @returns How many territories an owner holds.
 * @example
 * ```ts
 * import { startTenka, territoriesHeld } from "@johnmorrisdotca/tenka";
 *
 * const game = startTenka(10,["Seat 1","Seat 2"],42)!;
 * console.log(territoriesHeld(game.owners,0));
 * ```
 */
export function territoriesHeld(owners: readonly TenkaOwner[], owner: TenkaOwner): number {
  let count = 0;
  for (const holder of owners) if (holder === owner) count += 1;
  return count;
}

/** How many armies an owner has on the map.
 *
 * @param game - The current native game state.
 * @param owner - The seat index, or the neutral-owner marker.
 * @returns How many armies an owner has on the map.
 * @example
 * ```ts
 * import { armiesHeld, startTenka } from "@johnmorrisdotca/tenka";
 *
 * const game = startTenka(10,["Seat 1","Seat 2"],42)!;
 * console.log(armiesHeld(game,0));
 * ```
 */
export function armiesHeld(game: Pick<TenkaGame, "owners" | "armies">, owner: TenkaOwner): number {
  let count = 0;
  game.owners.forEach((holder, territory) => {
    if (holder === owner) count += game.armies[territory];
  });
  return count;
}

/**
 * THE ARMIES A TURN BRINGS: one for every three territories held, never
 * fewer than three, and each continent held whole adds its bonus. Cards
 * traded in come on top (`tenka.ts`).
 *
 * @param owners - The territory owners in native map order.
 * @param seat - The zero-based player seat.
 * @param map - The native world or Europe map to use.
 * @returns THE ARMIES A TURN BRINGS: one for every three territories held, never fewer than three, and each continent held whole adds its bonus. Cards traded in come on top (`tenka.ts`).
 * @example
 * ```ts
 * import { reinforcementFor, startTenka } from "@johnmorrisdotca/tenka";
 *
 * const game = startTenka(10,["Seat 1","Seat 2"],42)!;
 * console.log(reinforcementFor(game.owners,0));
 * ```
 */
export function reinforcementFor(owners: readonly TenkaOwner[], seat: TenkaSeat, map: TenkaMap = TENKA_MAPS.world): number {
  const fromLand = Math.max(TENKA_LEAST_REINFORCEMENT, Math.floor(territoriesHeld(owners, seat) / TENKA_TERRITORIES_PER_ARMY));
  return fromLand + continentsHeld(owners, seat, map).reduce((sum, continent) => sum + continent.bonus, 0);
}

/** A seat's place in the round: 0 for whoever plays first, counting on round the table. */
function placeInRound(game: TenkaGame, seat: TenkaSeat): number {
  return (seat - game.first + game.players.length) % game.players.length;
}

/** The next player still in after `seat`, round the table; the neutral army never takes a turn.
 *
 * @param game - The current native game state.
 * @param seat - The zero-based player seat.
 * @returns The next player still in after `seat`, round the table; the neutral army never takes a turn.
 * @example
 * ```ts
 * import { nextSeatIn, startTenka } from "@johnmorrisdotca/tenka";
 *
 * const game = startTenka(10,["Seat 1","Seat 2"],42)!;
 * console.log(nextSeatIn(game,game.toPlay));
 * ```
 */
export function nextSeatIn(game: TenkaGame, seat: TenkaSeat): TenkaSeat {
  for (let step = 1; step <= game.players.length; step += 1) {
    const next = (seat + step) % game.players.length;
    if (!game.out[next]) return next;
  }
  return seat;
}

/** A turn starting for `seat`: its armies worked out, nothing yet taken, nothing rolled.
 *
 * @param game - The current native game state.
 * @param seat - The zero-based player seat.
 * @param round - The round number of the turn.
 * @returns A turn starting for `seat`: its armies worked out, nothing yet taken, nothing rolled.
 * @example
 * ```ts
 * import { beginTurn, startTenka } from "@johnmorrisdotca/tenka";
 *
 * const game = startTenka(10,["Seat 1","Seat 2"],42)!;
 * console.log(beginTurn(game,0,2).round);
 * ```
 */
export function beginTurn(game: TenkaGame, seat: TenkaSeat, round: number): TenkaGame {
  return {
    ...game,
    toPlay: seat,
    round,
    phase: TENKA_PHASES.reinforce,
    reserve: reinforcementFor(game.owners, seat, tenkaMapOf(game)),
    conquered: false,
    occupying: null,
    shifting: null,
    lastRoll: null,
    lastTrade: null,
  };
}

/** The game ended, with these seats winning.
 *
 * @param game - The current native game state.
 * @param winners - The seat indices declared winners.
 * @returns The game ended, with these seats winning.
 * @example
 * ```ts
 * import { finished, startTenka } from "@johnmorrisdotca/tenka";
 *
 * const game = startTenka(10,["Seat 1","Seat 2"],42)!;
 * console.log(finished(game,[0]).winners);
 * ```
 */
export function finished(game: TenkaGame, winners: readonly TenkaSeat[]): TenkaGame {
  return { ...game, phase: TENKA_PHASES.over, reserve: 0, occupying: null, shifting: null, winners: [...winners].sort((a, b) => a - b) };
}

/**
 * THE COUNT, when the last round is over: whoever holds the most
 * territories wins; level on territories, whoever has more armies on the
 * map; level on both, they share the win.
 *
 * @param game - The current native game state.
 * @returns THE COUNT, when the last round is over: whoever holds the most territories wins; level on territories, whoever has more armies on the map; level on both, they share the win.
 * @example
 * ```ts
 * import { counted, startTenka } from "@johnmorrisdotca/tenka";
 *
 * const game = startTenka(10,["Seat 1","Seat 2"],42)!;
 * console.log(counted(game).winners);
 * ```
 */
export function counted(game: TenkaGame): TenkaGame {
  const standing = game.players.flatMap((_, seat) => (game.out[seat] ? [] : [{ seat, held: territoriesHeld(game.owners, seat), armies: armiesHeld(game, seat) }]));
  const most = Math.max(...standing.map((one) => one.held));
  const level = standing.filter((one) => one.held === most);
  const mostArmies = Math.max(...level.map((one) => one.armies));
  return finished(
    game,
    level.filter((one) => one.armies === mostArmies).map((one) => one.seat),
  );
}

/** A card off the top of the deck for `seat`, the traded cards shuffled back in first when the deck is empty; none when every card is in a hand. */
function drawCard(game: TenkaGame, seat: TenkaSeat): TenkaGame {
  let { deck, discards, rng } = game;
  if (deck.length === 0 && discards.length > 0) {
    const shuffledBack = shuffled(rng, discards);
    deck = shuffledBack.value;
    rng = shuffledBack.state;
    discards = [];
  }
  if (deck.length === 0) return { ...game, deck, discards, rng, lastDraw: null };
  const [card, ...rest] = deck;
  const hands = game.hands.map((hand, at) => (at === seat ? [...hand, card] : hand));
  return { ...game, deck: rest, discards, rng, hands, lastDraw: { seat, card } };
}

/**
 * THE END OF A TURN: a card for a player who took a territory in it, then
 * the next player still in. Passing the first player's place starts a new
 * round, and past the last round the game is counted.
 *
 * @param game - The current native game state.
 * @returns THE END OF A TURN: a card for a player who took a territory in it, then the next player still in. Passing the first player's place starts a new round, and past the last round the game is counted.
 * @example
 * ```ts
 * import { endOfTurn, startTenka } from "@johnmorrisdotca/tenka";
 *
 * const game = startTenka(10,["Seat 1","Seat 2"],42)!;
 * console.log(endOfTurn(game).toPlay);
 * ```
 */
export function endOfTurn(game: TenkaGame): TenkaGame {
  const drawn = game.conquered ? drawCard(game, game.toPlay) : { ...game, lastDraw: null };
  const next = nextSeatIn(drawn, drawn.toPlay);
  const round = placeInRound(drawn, next) <= placeInRound(drawn, drawn.toPlay) ? drawn.round + 1 : drawn.round;
  if (round > drawn.rounds) return counted(drawn);
  return beginTurn(drawn, next, round);
}
