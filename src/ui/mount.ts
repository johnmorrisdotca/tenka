import { TENKA_MOVES, TENKA_PHASES, TENKA_WORLD_ROUNDS } from "../tenka.constants.ts";
import type { TenkaChoice, TenkaContinentKey, TenkaGame, TenkaMove, TenkaMapKey } from "../tenka.types.ts";
import { mustTrade, playTenka } from "../tenka.ts";
import { cardKind, cardTerritory, setsIn } from "../tenkaCards.ts";
import { mostAttackDice } from "../tenkaDice.ts";
import { tenkaFromJSON, tenkaToCSV, tenkaToJSON, tenkaToText } from "../tenkaExport.ts";
import { tenkaMapOf } from "../tenkaMap.ts";
import { sensibleTenkaMove } from "../tenkaPolicy.ts";
import { startTenka } from "../tenkaStart.ts";
import { NO_CHOICE, choiceNow, marksFor, tapTerritory } from "../tenkaTaps.ts";
import { armiesHeld, territoriesHeld } from "../tenkaTurn.ts";
import { continentNameIn, tenkaSay, tenkaStrings, territoryNameIn, type TenkaLocale, type TenkaStrings } from "../strings.ts";
import { ownerColour } from "./colours.ts";
import { continentView, nearestLand, tenkaMapModel } from "./mapModel.ts";
import { TENKA_STYLE } from "./style.ts";
import { tenkaMapSvg } from "./svg.ts";

/** What `mountTenka` may be given. Everything is optional: with nothing, it is a game of three against two computer players, to the last player standing. */
export type TenkaTableOptions = {
  /** The names round the table, in seat order: two to six. */
  players?: readonly string[];
  /** Which seats the computer plays. By default every seat but the first. */
  computers?: readonly boolean[];
  /** Rounds before the count: 10, 20, or 60 for the whole world. */
  rounds?: number;
  /** The seed every deal and die is drawn from; a new one each game when absent. */
  seed?: number;
  /** The map: `"world"` (the default) or `"europe"`. */
  map?: TenkaMapKey;
  /** A colour for each seat. */
  colours?: readonly string[];
  /** How long the computer waits before each of its moves, in milliseconds. */
  computerDelayMs?: number;
  /** Told of every game after a move. */
  onChange?: (game: TenkaGame) => void;
  /** The language of the table: `"en"` or `"ja"`. By default the page's own (`<html lang>`), and English for any other. */
  locale?: TenkaLocale;
  /** Words of your own, laid over the locale's: any of `TenkaStrings`. */
  strings?: Partial<TenkaStrings>;
  /** CSS variables set on the table itself, which win in light and dark alike: `{ "--tk-sea": "#23405a" }`. */
  theme?: Readonly<Record<string, string>>;
  /** Whether the table shows the record of the game, with saving and loading. True by default. */
  record?: boolean;
};

/** What `mountTenka` hands back: the game being played, and the ways to change it from outside. */
export type TenkaTableHandle = {
  /** The game as it stands. */
  game: () => TenkaGame;
  /** A new game at the same table, with any options changed. */
  newGame: (options?: Pick<TenkaTableOptions, "players" | "computers" | "rounds" | "seed" | "map">) => void;
  /** Put a game on the table: one read back by `tenkaFromJSON` or `decodeTenka`. Seats keep who plays them when the number of players is the same; otherwise every seat but the first is the computer's, unless `computers` says. */
  setGame: (game: TenkaGame, computers?: readonly boolean[]) => void;
  /** Change the table's language, and with it any words of your own. */
  setLocale: (locale: TenkaLocale, strings?: Partial<TenkaStrings>) => void;
  /** Take the table off the page and stop its timers. */
  destroy: () => void;
};

const COMPUTER_NAMES = ["Kaze", "Yama"];

function freshSeed(): number {
  return Math.floor(Math.random() * 0xffffffff) >>> 0;
}

function node<K extends keyof HTMLElementTagNameMap>(name: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const made = document.createElement(name);
  if (className !== undefined) made.className = className;
  if (text !== undefined) made.textContent = text;
  return made;
}

function button(text: string, onClick: () => void, primary = false, testId?: string): HTMLButtonElement {
  const made = node("button", primary ? "tk-button tk-primary" : "tk-button", text);
  made.type = "button";
  if (testId !== undefined) made.dataset.testid = testId;
  made.addEventListener("click", onClick);
  return made;
}

/** Hand a string to the person as a file of that name. */
function save(name: string, type: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = node("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * A WHOLE TABLE OF TENKA IN PLAIN DOM: the map, whose turn it is and what to
 * do, the players, your cards and the last dice, played against the
 * computer (or by people taking turns on one device, with `computers` all
 * false). No framework and no server; everything is in the element given.
 *
 * Tap your own territory to place an army; to attack or move, tap where
 * from, then where to, and choose from the buttons under the map. Under the
 * players is the record of the game, which saves as JSON, text or CSV and
 * loads a saved game back.
 */
export function mountTenka(target: HTMLElement, options: TenkaTableOptions = {}): TenkaTableHandle {
  const pageLocale = (): TenkaLocale => (typeof document !== "undefined" && document.documentElement.lang.toLowerCase().startsWith("ja") ? "ja" : "en");
  let locale: TenkaLocale = options.locale ?? pageLocale();
  let own = options.strings ?? {};
  let words = tenkaStrings(locale, own);
  // Names nobody gave are the table's own: "You" in the table's language, then the computer's.
  const named = options.players !== undefined;
  let players = options.players ?? [words.you, ...COMPUTER_NAMES];
  let computers = options.computers ?? players.map((_, seat) => seat !== 0);
  let rounds = options.rounds ?? TENKA_WORLD_ROUNDS;
  let map: TenkaMapKey = options.map ?? "world";
  const colours = options.colours;
  const delay = options.computerDelayMs ?? 450;
  const showRecord = options.record !== false;

  const begin = (seed: number): TenkaGame => {
    const game = startTenka(rounds, players, seed, undefined, map);
    if (game === null) throw new Error(`Tenka is played by two to six, for 10, 20 or 60 rounds; not ${players.length} for ${rounds}.`);
    return game;
  };

  let game = begin(options.seed ?? freshSeed());
  let choice: TenkaChoice = NO_CHOICE;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let focus: TenkaContinentKey | null = null;
  let note = "";

  const root = node("div", "tk-root");
  root.dataset.testid = "tk-root";
  for (const [name, value] of Object.entries(options.theme ?? {})) root.style.setProperty(name, value);
  const style = node("style");
  style.textContent = TENKA_STYLE;
  const status = node("p", "tk-status");
  status.dataset.testid = "tk-status";
  status.setAttribute("aria-live", "polite");
  const zoom = node("div", "tk-zoom");
  zoom.setAttribute("role", "group");
  const board = node("div", "tk-board");
  board.dataset.testid = "tk-board";
  const controls = node("div", "tk-controls");
  controls.dataset.testid = "tk-controls";
  const dice = node("div", "tk-dice");
  dice.dataset.testid = "tk-dice";
  const side = node("div", "tk-side");
  const seats = node("div", "tk-seats");
  const record = node("details", "tk-record");
  record.dataset.testid = "tk-record";
  const main = node("div", "tk-main");
  main.append(status, zoom, board, controls, dice);
  side.append(seats);
  if (showRecord) side.append(record);
  root.append(style, main, side);
  target.append(root);

  const landName = (territory: number) => {
    const data = tenkaMapOf(game).territories[territory]!;
    return territoryNameIn(words, data.key) || data.name;
  };
  const who = (seat: number) => {
    const given = game.players[seat]?.trim() ?? "";
    return given === "" ? tenkaSay(words.player, { n: seat + 1 }) : given;
  };

  const make = (move: TenkaMove) => {
    const next = playTenka(game, move);
    if (next === null) return;
    game = next;
    choice = choiceNow(game, choice);
    note = "";
    options.onChange?.(game);
    render();
  };

  const tap = (territory: number) => {
    if (computers[game.toPlay] || game.phase === TENKA_PHASES.over) return;
    const tapped = tapTerritory(game, choice, territory);
    choice = tapped.choice;
    if (tapped.move !== null) make(tapped.move);
    else render();
  };

  board.addEventListener("click", (event) => {
    const hit = (event.target as Element).closest("[data-territory]");
    if (hit !== null) {
      tap(Number(hit.getAttribute("data-territory")));
      return;
    }
    // A press on the sea takes the nearest territory within a fingertip, so an island never has to be hit exactly.
    const svg = board.querySelector("svg");
    if (svg === null) return;
    const box = svg.getBoundingClientRect();
    const view = svg.viewBox.baseVal;
    const scale = box.width / view.width;
    const near = nearestLand(view.x + (event.clientX - box.left) / scale, view.y + (event.clientY - box.top) / scale, 24 / scale, game.map);
    if (near !== null) tap(near);
  });

  const armiesPicker = (least: number, most: number, start: number, act: (armies: number) => void, label: (armies: number) => string) => {
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
  };

  function renderControls() {
    controls.replaceChildren();
    if (game.phase === TENKA_PHASES.over) {
      controls.append(button(words.newGame, () => handle.newGame(), true, "tk-new"));
      return;
    }
    if (computers[game.toPlay]) return;
    const now = choiceNow(game, choice);
    const hand = game.hands[game.toPlay]!;
    switch (game.phase) {
      case TENKA_PHASES.reinforce: {
        const sets = setsIn(hand, tenkaMapOf(game));
        if (sets.length > 0) controls.append(button(mustTrade(game) ? words.tradeMust : words.trade, () => make({ kind: TENKA_MOVES.trade, cards: sets[0]! }), mustTrade(game), "tk-trade"));
        if (!mustTrade(game) && now.placedOn !== null && game.reserve > 1) {
          controls.append(button(tenkaSay(words.allOn, { n: game.reserve, land: landName(now.placedOn) }), () => make({ kind: TENKA_MOVES.place, territory: now.placedOn!, armies: game.reserve }), false, "tk-all"));
        }
        break;
      }
      case TENKA_PHASES.attack: {
        if (now.from !== null && now.to !== null) {
          const most = mostAttackDice(game.armies[now.from]!);
          controls.append(
            button(most === 1 ? words.attackWithOne : tenkaSay(words.attackWith, { n: most }), () => make({ kind: TENKA_MOVES.attack, from: now.from!, to: now.to!, dice: most }), true, "tk-attack"),
            button(words.blitz, () => make({ kind: TENKA_MOVES.blitz, from: now.from!, to: now.to! }), false, "tk-blitz"),
          );
        }
        controls.append(button(words.stopAttacking, () => make({ kind: TENKA_MOVES.endAttack }), false, "tk-stop"));
        break;
      }
      case TENKA_PHASES.occupy: {
        const taking = game.occupying!;
        const most = game.armies[taking.from]! - 1;
        controls.append(armiesPicker(taking.least, most, most, (armies) => make({ kind: TENKA_MOVES.occupy, armies }), (armies) => tenkaSay(words.moveIn, { n: armies })));
        break;
      }
      case TENKA_PHASES.fortify: {
        if (now.from !== null && now.to !== null) {
          const most = game.armies[now.from]! - 1;
          controls.append(
            armiesPicker(1, most, now.armies, (armies) => {
              const from = now.from!;
              const to = now.to!;
              const chosen = playTenka(game, { kind: TENKA_MOVES.fortify, from, to });
              if (chosen === null) return;
              game = chosen;
              make({ kind: TENKA_MOVES.shift, armies });
            }, (armies) => tenkaSay(words.moveTo, { n: armies, land: landName(now.to!) })),
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
    if (game.phase === TENKA_PHASES.over) {
      const names = game.winners.map(who);
      return names.length === 1 ? tenkaSay(words.wins, { name: names[0]! }) : tenkaSay(words.tie, { names: names.join(words.and) });
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
        return round + (game.reserve === 1 ? tenkaSay(words.placeOne, { name }) : tenkaSay(words.placeSay, { name, n: game.reserve }));
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
    dice.replaceChildren();
    const roll = game.lastRoll;
    if (roll === null) return;
    const line = node("p", "tk-roll");
    const faces = (values: readonly number[], kind: string) => {
      const group = node("span", `tk-faces tk-${kind}`);
      for (const value of values) group.append(node("span", "tk-die", String(value)));
      return group;
    };
    const after = `${roll.throws > 1 ? tenkaSay(words.rollThrows, { n: roll.throws }) : ""}${tenkaSay(words.rollLost, { a: roll.attackerLost, d: roll.defenderLost })}${roll.took ? words.rollTook : ""}`;
    line.append(node("span", undefined, landName(roll.from)), faces(roll.attackDice, "attack"), node("span", undefined, words.against), faces(roll.defendDice, "defend"), node("span", undefined, `${landName(roll.to)}${after}`));
    dice.append(line);
  }

  function renderSeats() {
    seats.replaceChildren();
    const list = node("ol", "tk-players");
    game.players.forEach((_, seat) => {
      const item = node("li", seat === game.toPlay && game.phase !== TENKA_PHASES.over ? "tk-player tk-to-play" : "tk-player");
      item.dataset.testid = "tk-player";
      if (game.out[seat]) item.classList.add("tk-out");
      const marble = node("span", "tk-marble");
      marble.style.background = ownerColour(seat, colours);
      item.append(marble, node("span", "tk-name", who(seat)), node("span", "tk-count", tenkaSay(words.counts, { lands: territoriesHeld(game.owners, seat), armies: armiesHeld(game, seat), cards: game.hands[seat]!.length })));
      list.append(item);
    });
    seats.append(list);
    const human = game.players.findIndex((_, seat) => !computers[seat]);
    const shown = !computers[game.toPlay] ? game.toPlay : human;
    if (shown >= 0) {
      const hand = game.hands[shown]!;
      const cards = node("div", "tk-hand");
      cards.append(node("p", "tk-hand-title", tenkaSay(hand.length === 0 ? words.noCards : words.cardsInHand, { name: who(shown) })));
      const kinds = { land: words.kindLand, sea: words.kindSea, air: words.kindAir, wild: words.wild };
      for (const card of hand) {
        const territory = cardTerritory(card, tenkaMapOf(game));
        const kind = cardKind(card, tenkaMapOf(game));
        cards.append(node("span", `tk-card tk-${kind}`, territory === null ? words.wild : tenkaSay(words.card, { kind: kinds[kind], land: landName(territory) })));
      }
      seats.append(cards);
    }
  }

  // The record's shell is made once, so that it stays open or shut as the person left it; only its words and lines are drawn again.
  const recordTitle = node("summary", "tk-record-title");
  const recordLines = node("pre", "tk-log");
  recordLines.dataset.testid = "tk-log";
  recordLines.tabIndex = 0;
  const recordButtons = node("div", "tk-row");
  const recordNote = node("p", "tk-note");
  recordNote.dataset.testid = "tk-note";
  recordNote.setAttribute("aria-live", "polite");
  const picker = node("input");
  picker.type = "file";
  picker.accept = ".json,application/json";
  picker.hidden = true;
  picker.dataset.testid = "tk-file";
  const read = (text: string) => {
    const loaded = tenkaFromJSON(text);
    if (loaded === null) {
      note = words.loadBad;
      render();
      return;
    }
    handle.setGame(loaded);
    note = tenkaSay(words.loaded, { n: loaded.moves.length });
    render();
  };
  picker.addEventListener("change", () => {
    const file = picker.files?.[0];
    picker.value = "";
    if (file === undefined) return;
    void file.text().then(read, () => read(""));
  });
  // Made once, like the views' buttons: only their words change.
  const saveJson = button("", () => save(`tenka-${game.seed}.json`, "application/json", tenkaToJSON(game)), false, "tk-save-json");
  const saveText = button("", () => save(`tenka-${game.seed}.txt`, "text/plain", tenkaToText(game, words)), false, "tk-save-text");
  const saveCsv = button("", () => save(`tenka-${game.seed}.csv`, "text/csv", tenkaToCSV(game)), false, "tk-save-csv");
  const load = button("", () => picker.click(), false, "tk-load");
  recordButtons.append(saveJson, saveText, saveCsv, load);
  record.append(recordTitle, recordLines, recordButtons, recordNote, picker);
  record.addEventListener("toggle", () => {
    if (record.open) renderRecord();
  });

  function renderRecord() {
    if (!showRecord) return;
    recordTitle.textContent = words.record;
    recordNote.textContent = note;
    saveJson.textContent = words.saveJson;
    saveText.textContent = words.saveText;
    saveCsv.textContent = words.saveCsv;
    load.textContent = words.load;
    // Written only while it is open: a long game's record is played again from its seed to be written.
    if (!record.open) return;
    recordLines.textContent = game.moves.length === 0 ? `${tenkaToText(game, words)}${words.recordEmpty}\n` : tenkaToText(game, words);
    recordLines.scrollTop = recordLines.scrollHeight;
  }

  // The views' buttons are made once for a map and only told their words and which is pressed, so a button being
  // pressed is never replaced under the finger; a game on another map makes them again, for its own continents.
  let viewsOf: TenkaMapKey | null = null;
  let views: { key: TenkaContinentKey | null; pick: HTMLButtonElement }[] = [];
  function makeViews() {
    const now = game.map ?? "world";
    if (viewsOf === now) return;
    viewsOf = now;
    focus = null;
    zoom.replaceChildren();
    views = [null, ...tenkaMapOf(game).continents.map((one) => one.key)].map((key) => {
      const pick = button("", () => {
        focus = key;
        render();
      });
      pick.dataset.view = key ?? now;
      zoom.append(pick);
      return { key, pick };
    });
  }

  function renderZoom() {
    makeViews();
    zoom.setAttribute("aria-label", words.lookAt);
    for (const { key, pick } of views) {
      pick.textContent = key === null ? ((game.map ?? "world") === "europe" ? words.europe : words.world) : continentNameIn(words, key) || key;
      pick.setAttribute("aria-pressed", String(focus === key));
    }
  }

  function drawMap() {
    const marks = computers[game.toPlay] ? marksFor(game, NO_CHOICE) : marksFor(game, choice);
    const model = tenkaMapModel(game, marks, colours);
    const drawn = { ...model, lands: model.lands.map((land) => ({ ...land, name: landName(land.territory) })) };
    board.replaceChildren(tenkaMapSvg(drawn, { view: continentView(focus, game.map), pixels: board.clientWidth || undefined, label: words.mapLabel }));
  }

  function render() {
    root.lang = locale;
    status.textContent = statusLine();
    drawMap();
    root.dataset.phase = game.phase;
    root.dataset.toPlay = String(game.toPlay);
    root.dataset.waiting = String(game.phase !== TENKA_PHASES.over && !computers[game.toPlay]);
    renderZoom();
    renderControls();
    renderDice();
    renderSeats();
    renderRecord();
    schedule();
  }

  function schedule() {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    if (game.phase === TENKA_PHASES.over || !computers[game.toPlay]) return;
    timer = setTimeout(() => {
      timer = null;
      make(sensibleTenkaMove(game, Math.random));
    }, delay);
  }

  const handle: TenkaTableHandle = {
    game: () => game,
    newGame: (changed = {}) => {
      players = changed.players ?? players;
      computers = changed.computers ?? (changed.players === undefined ? computers : players.map((_, seat) => seat !== 0));
      rounds = changed.rounds ?? rounds;
      map = changed.map ?? map;
      game = begin(changed.seed ?? freshSeed());
      choice = NO_CHOICE;
      note = "";
      options.onChange?.(game);
      render();
    },
    setGame: (loaded, playedBy) => {
      if (playedBy !== undefined) computers = playedBy;
      else if (loaded.players.length !== players.length) computers = loaded.players.map((_, seat) => seat !== 0);
      players = loaded.players;
      rounds = loaded.rounds;
      map = loaded.map ?? "world";
      game = loaded;
      choice = NO_CHOICE;
      note = "";
      options.onChange?.(game);
      render();
    },
    setLocale: (next, strings) => {
      const before = words.you;
      locale = next;
      if (strings !== undefined) own = strings;
      words = tenkaStrings(locale, own);
      // A first seat nobody named is "You" in whichever language the table now speaks; a game under way keeps its names.
      if (!named && players[0] === before && game.moves.length === 0) {
        players = [words.you, ...players.slice(1)];
        game = { ...game, players };
      }
      render();
    },
    destroy: () => {
      if (timer !== null) clearTimeout(timer);
      resized?.disconnect();
      root.remove();
    },
  };

  // Counters are sized for the map's width on the screen, so a change of width draws the map again, and only the map.
  let drawnWidth = 0;
  const resized = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => {
    if (board.clientWidth === drawnWidth) return;
    drawnWidth = board.clientWidth;
    drawMap();
  });
  resized?.observe(board);

  render();
  return handle;
}
