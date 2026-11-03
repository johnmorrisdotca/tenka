import { continentNameIn, type TenkaLocale, type TenkaStrings, tenkaCount, tenkaSay } from "../strings.ts";
import { TENKA_MOVES, TENKA_PHASES } from "../tenka.constants.ts";
import { mustTrade, playTenka } from "../tenka.ts";
import type { TenkaChoice, TenkaContinentKey, TenkaGame, TenkaMove } from "../tenka.types.ts";
import { cardKind, cardTerritory, setsIn } from "../tenkaCards.ts";
import { mostAttackDice } from "../tenkaDice.ts";
import { tenkaMapOf } from "../tenkaMap.ts";
import { choiceNow } from "../tenkaTaps.ts";
import { armiesHeld, territoriesHeld } from "../tenkaTurn.ts";
import { ownerColour } from "./colours.ts";
import { button, node } from "./dom.ts";
import type { TenkaDrawn, TenkaDressing } from "./dressing.types.ts";
import { createTenkaRecord } from "./record.ts";

/**
 * THE TABLE'S CHROME AROUND THE MAP: whose turn it is and what to do, the
 * dice of the last throw, the seats and their cards, and the buttons that
 * look at one continent. The record is `record.ts`. The map, and how a tap
 * becomes a move, stay in `mount.ts`.
 */

/** The elements already on the table, and the live game the chrome reads. */
type TenkaChromeHost = {
  controls: HTMLDivElement;
  dice: HTMLDivElement;
  seats: HTMLDivElement;
  record: HTMLDetailsElement;
  zoom: HTMLDivElement;
  game: () => TenkaGame;
  setGame: (game: TenkaGame) => void;
  choice: () => TenkaChoice;
  computers: () => readonly boolean[];
  words: () => TenkaStrings;
  locale: () => TenkaLocale;
  colours: () => readonly string[] | undefined;
  dressing: () => TenkaDressing | undefined;
  showRecord: () => boolean;
  note: () => string;
  setNote: (note: string) => void;
  focus: () => TenkaContinentKey | null;
  setFocus: (focus: TenkaContinentKey | null) => void;
  landName: (territory: number) => string;
  who: (seat: number) => string;
  make: (move: TenkaMove) => void;
  newGame: () => void;
  loadGame: (game: TenkaGame) => void;
  render: () => void;
  /** Whether a move has just thrown the dice, and then it has been seen. */
  takeMove: () => boolean;
};

export type TenkaChrome = {
  statusLine: () => string;
  renderControls: () => void;
  renderDice: () => void;
  renderSeats: () => void;
  renderRecord: () => void;
  renderZoom: () => void;
  releaseDrawn: () => void;
};

function letGo(drawn: TenkaDrawn[]): TenkaDrawn[] {
  for (const one of drawn) {
    try {
      one.destroy?.();
    } catch {
      // A dressing that fails to tidy up is no reason to stop the game.
    }
  }
  return [];
}

// A dressing that fails draws nothing, and the plain way is drawn instead.
function dress(make: (() => TenkaDrawn) | undefined, kept: TenkaDrawn[]): Element | null {
  if (make === undefined) return null;
  try {
    const drawn = make();
    kept.push(drawn);
    return drawn.element;
  } catch {
    return null;
  }
}

function armiesPicker(
  words: TenkaStrings,
  least: number,
  most: number,
  start: number,
  act: (armies: number) => void,
  label: (armies: number) => string,
): HTMLDivElement {
  let armies = Math.min(most, Math.max(least, start));
  const row = node("div", "tk-row");
  const slider = node("input", "tk-slider");
  slider.type = "range";
  slider.min = String(least);
  slider.max = String(most);
  slider.value = String(armies);
  slider.disabled = least === most;
  slider.setAttribute("aria-label", words.armiesLabel);
  const go = button(label(armies), () => act(armies), true, "tk-go");
  slider.addEventListener("input", () => {
    armies = Number(slider.value);
    go.textContent = label(armies);
  });
  row.append(slider, go);
  return row;
}

/**
 * Fill the chrome's elements and hand back how to draw them again.
 * @param host - The elements and the live table the chrome reads.
 * @returns The draws, and how to let go of what a dressing drew.
 */
export function createTenkaChrome(host: TenkaChromeHost): TenkaChrome {
  const { controls, dice, seats, zoom } = host;
  // What a dressing drew for the dice, and for the hand and the deck: told when it is drawn again, or the table goes.
  let diceDrawn: TenkaDrawn[] = [];
  let handDrawn: TenkaDrawn[] = [];
  // The dice are shown landing only when a move has just thrown them, never when the table is drawn again for any other reason.
  let drawnRoll: TenkaGame["lastRoll"] = null;

  function renderControls() {
    const game = host.game();
    const words = host.words();
    const computers = host.computers();
    const choice = host.choice();
    const { make, landName } = host;
    controls.replaceChildren();
    if (game.phase === TENKA_PHASES.over) {
      controls.append(button(words.newGame, () => host.newGame(), true, "tk-new"));
      return;
    }
    if (computers[game.toPlay]) return;
    const now = choiceNow(game, choice);
    const hand = game.hands[game.toPlay]!;
    switch (game.phase) {
      case TENKA_PHASES.reinforce: {
        const sets = setsIn(hand, tenkaMapOf(game));
        if (sets.length > 0)
          controls.append(
            button(
              mustTrade(game) ? words.tradeMust : words.trade,
              () => make({ kind: TENKA_MOVES.trade, cards: sets[0]! }),
              mustTrade(game),
              "tk-trade",
            ),
          );
        if (!mustTrade(game) && now.placedOn !== null && game.reserve > 1) {
          controls.append(
            button(
              tenkaSay(words.allOn, { n: game.reserve, land: landName(now.placedOn) }),
              () => make({ kind: TENKA_MOVES.place, territory: now.placedOn!, armies: host.game().reserve }),
              false,
              "tk-all",
            ),
          );
        }
        break;
      }
      case TENKA_PHASES.attack: {
        if (now.from !== null && now.to !== null) {
          const most = mostAttackDice(game.armies[now.from]!);
          controls.append(
            button(
              most === 1 ? words.attackWithOne : tenkaSay(words.attackWith, { n: most }),
              () => make({ kind: TENKA_MOVES.attack, from: now.from!, to: now.to!, dice: most }),
              true,
              "tk-attack",
            ),
            button(
              words.blitz,
              () => make({ kind: TENKA_MOVES.blitz, from: now.from!, to: now.to! }),
              false,
              "tk-blitz",
            ),
          );
        }
        controls.append(button(words.stopAttacking, () => make({ kind: TENKA_MOVES.endAttack }), false, "tk-stop"));
        break;
      }
      case TENKA_PHASES.occupy: {
        const taking = game.occupying!;
        const most = game.armies[taking.from]! - 1;
        controls.append(
          armiesPicker(
            words,
            taking.least,
            most,
            most,
            (armies) => make({ kind: TENKA_MOVES.occupy, armies }),
            (armies) => tenkaSay(host.words().moveIn, { n: armies }),
          ),
        );
        break;
      }
      case TENKA_PHASES.fortify: {
        if (now.from !== null && now.to !== null) {
          const most = game.armies[now.from]! - 1;
          controls.append(
            armiesPicker(
              words,
              1,
              most,
              now.armies,
              (armies) => {
                const from = now.from!;
                const to = now.to!;
                const chosen = playTenka(host.game(), { kind: TENKA_MOVES.fortify, from, to });
                if (chosen === null) return;
                host.setGame(chosen);
                make({ kind: TENKA_MOVES.shift, armies });
              },
              (armies) => tenkaSay(host.words().moveTo, { n: armies, land: landName(now.to!) }),
            ),
          );
        }
        controls.append(button(words.endTurn, () => make({ kind: TENKA_MOVES.endTurn }), false, "tk-end"));
        break;
      }
      default:
        break;
    }
  }

  function statusLine(): string {
    const game = host.game();
    const words = host.words();
    const computers = host.computers();
    const choice = host.choice();
    const { who, landName } = host;
    if (game.phase === TENKA_PHASES.over) {
      const names = game.winners.map(who);
      return names.length === 1
        ? tenkaSay(words.wins, { name: names[0]! })
        : tenkaSay(words.tie, { names: names.join(words.and) });
    }
    const name = who(game.toPlay);
    const round = `${tenkaSay(words.round, { n: game.round, of: game.rounds })} `;
    if (computers[game.toPlay]) return round + tenkaSay(words.thinking, { name });
    const now = choiceNow(game, choice);
    switch (game.phase) {
      case TENKA_PHASES.setUp:
        return round + tenkaSay(words.setUpSay, { name, n: game.setUpLeft[game.toPlay]! });
      case TENKA_PHASES.reinforce:
        if (mustTrade(game)) return round + tenkaSay(words.mustTradeSay, { name });
        return (
          round +
          (game.reserve === 1
            ? tenkaSay(words.placeOne, { name })
            : tenkaSay(words.placeSay, { name, n: game.reserve }))
        );
      case TENKA_PHASES.attack:
        if (now.from === null) return round + tenkaSay(words.attackFrom, { name });
        if (now.to === null) return round + tenkaSay(words.attackTo, { name, land: landName(now.from) });
        return round + tenkaSay(words.attackReady, { name, from: landName(now.from), to: landName(now.to) });
      case TENKA_PHASES.occupy:
        return round + tenkaSay(words.occupySay, { name, land: landName(game.occupying!.to) });
      case TENKA_PHASES.fortify:
        if (now.from === null) return round + tenkaSay(words.fortifyFrom, { name });
        if (now.to === null) return round + tenkaSay(words.fortifyTo, { name, land: landName(now.from) });
        return round + tenkaSay(words.fortifyReady, { name, from: landName(now.from), to: landName(now.to) });
      default:
        return round + name;
    }
  }

  function renderDice() {
    const game = host.game();
    const words = host.words();
    const locale = host.locale();
    const dressing = host.dressing();
    const { landName } = host;
    diceDrawn = letGo(diceDrawn);
    dice.replaceChildren();
    const thrownNow = host.takeMove();
    const roll = game.lastRoll;
    if (roll === null) {
      drawnRoll = null;
      return;
    }
    const tumble = thrownNow && roll !== drawnRoll;
    drawnRoll = roll;
    const line = node("p", "tk-roll");
    const count = roll.attackDice.length + roll.defendDice.length;
    let index = 0;
    const faces = (values: readonly number[], side: "attack" | "defend") => {
      const group = node("span", `tk-faces tk-${side}`);
      for (const value of values) {
        const die = node("span", "tk-die");
        die.dataset.face = String(value);
        const label = tenkaSay(side === "attack" ? words.dieAttack : words.dieDefend, { n: value });
        const drawDie = dressing;
        const drawn = dress(
          drawDie?.die === undefined
            ? undefined
            : () => drawDie.die!(value, { side, tumble, index: index++, count, label, locale }),
          diceDrawn,
        );
        if (drawn === null) die.textContent = String(value);
        else {
          // The picture is the whole of what a screen reader gets, so what is inside it is left out.
          die.classList.add("tk-die-drawn");
          die.setAttribute("role", "img");
          die.setAttribute("aria-label", label);
          drawn.setAttribute("aria-hidden", "true");
          die.append(drawn);
        }
        group.append(die);
      }
      return group;
    };
    const after = `${roll.throws > 1 ? tenkaSay(words.rollThrows, { n: roll.throws }) : ""}${tenkaSay(words.rollLost, { a: roll.attackerLost, d: roll.defenderLost })}${roll.took ? words.rollTook : ""}`;
    line.append(
      node("span", undefined, landName(roll.from)),
      faces(roll.attackDice, "attack"),
      node("span", undefined, words.against),
      faces(roll.defendDice, "defend"),
      node("span", undefined, `${landName(roll.to)}${after}`),
    );
    dice.append(line);
  }

  function renderSeats() {
    const game = host.game();
    const words = host.words();
    const computers = host.computers();
    const colours = host.colours();
    const locale = host.locale();
    const dressing = host.dressing();
    const { who, landName } = host;
    handDrawn = letGo(handDrawn);
    seats.replaceChildren();
    const list = node("ol", "tk-players");
    game.players.forEach((_, seat) => {
      const item = node(
        "li",
        seat === game.toPlay && game.phase !== TENKA_PHASES.over ? "tk-player tk-to-play" : "tk-player",
      );
      item.dataset.testid = "tk-player";
      if (game.out[seat]) item.classList.add("tk-out");
      const marble = node("span", "tk-marble");
      marble.style.background = ownerColour(seat, colours);
      item.append(
        marble,
        node("span", "tk-name", who(seat)),
        node(
          "span",
          "tk-count",
          tenkaSay(words.counts, {
            lands: tenkaCount(words.countLandsOne, words.countLands, territoriesHeld(game.owners, seat)),
            armies: tenkaCount(words.countArmiesOne, words.countArmies, armiesHeld(game, seat)),
            cards: tenkaCount(words.countCardsOne, words.countCards, game.hands[seat]!.length),
          }),
        ),
      );
      list.append(item);
    });
    seats.append(list);
    const human = game.players.findIndex((_, seat) => !computers[seat]);
    const shown = !computers[game.toPlay] ? game.toPlay : human;
    if (shown >= 0) {
      const hand = game.hands[shown]!;
      const cards = node("div", "tk-hand");
      cards.append(
        node(
          "p",
          "tk-hand-title",
          tenkaSay(hand.length === 0 ? words.noCards : words.cardsInHand, { name: who(shown) }),
        ),
      );
      const kinds = { land: words.kindLand, sea: words.kindSea, air: words.kindAir, wild: words.wild };
      for (const card of hand) {
        const territory = cardTerritory(card, tenkaMapOf(game));
        const kind = cardKind(card, tenkaMapOf(game));
        const name = territory === null ? words.wild : landName(territory);
        const label = territory === null ? words.wild : tenkaSay(words.card, { kind: kinds[kind], land: name });
        const chip = node("span", `tk-card tk-${kind}`);
        chip.dataset.card = String(card);
        if (territory !== null) chip.dataset.territory = String(territory);
        const drawCard = dressing;
        const drawn = dress(
          drawCard?.card === undefined
            ? undefined
            : () => drawCard.card!({ card, territory, kind, map: game.map ?? "world", name, label, locale }),
          handDrawn,
        );
        if (drawn === null) chip.textContent = label;
        else {
          chip.classList.add("tk-card-drawn");
          chip.setAttribute("role", "img");
          chip.setAttribute("aria-label", label);
          drawn.setAttribute("aria-hidden", "true");
          chip.append(drawn);
        }
        cards.append(chip);
      }
      // The deck, face down beside the hand, with the number left in it.
      const left = tenkaSay(words.deckLeft, { n: game.deck.length });
      const drawBack = dressing;
      const back = dress(
        drawBack?.back === undefined ? undefined : () => drawBack.back!({ label: left, locale }),
        handDrawn,
      );
      if (back !== null) {
        const pile = node("span", "tk-pile");
        pile.dataset.testid = "tk-pile";
        back.setAttribute("aria-hidden", "true");
        pile.append(back, node("span", "tk-pile-count", left));
        cards.append(pile);
      }
      seats.append(cards);
    }
  }

  // The record's shell is made once, so that it stays open or shut as the person left it.
  const { renderRecord } = createTenkaRecord(host);

  // The views' buttons are made once for a map and only told their words and which is pressed, so a button being
  // pressed is never replaced under the finger; a game on another map makes them again, for its own continents.
  let viewsOf: string | null = null;
  let views: { key: TenkaContinentKey | null; pick: HTMLButtonElement }[] = [];
  function makeViews() {
    const game = host.game();
    const now = game.map ?? "world";
    if (viewsOf === now) return;
    viewsOf = now;
    host.setFocus(null);
    zoom.replaceChildren();
    views = [null, ...tenkaMapOf(game).continents.map((one) => one.key)].map((key) => {
      const pick = button("", () => {
        host.setFocus(key);
        host.render();
      });
      pick.dataset.view = key ?? now;
      zoom.append(pick);
      return { key, pick };
    });
  }

  function renderZoom() {
    makeViews();
    const words = host.words();
    const game = host.game();
    zoom.setAttribute("aria-label", words.lookAt);
    for (const { key, pick } of views) {
      pick.textContent =
        key === null
          ? (game.map ?? "world") === "europe"
            ? words.europe
            : words.world
          : continentNameIn(words, key) || key;
      pick.setAttribute("aria-pressed", String(host.focus() === key));
    }
  }

  return {
    statusLine,
    renderControls,
    renderDice,
    renderSeats,
    renderRecord,
    renderZoom,
    releaseDrawn: () => {
      diceDrawn = letGo(diceDrawn);
      handDrawn = letGo(handDrawn);
    },
  };
}
