import { type TenkaLocale, type TenkaStrings, tenkaSay, tenkaStrings, territoryNameIn } from "../strings.ts";
import { TENKA_PHASES, TENKA_WORLD_ROUNDS } from "../tenka.constants.ts";
import { playTenka } from "../tenka.ts";
import type { TenkaChoice, TenkaContinentKey, TenkaGame, TenkaMapKey, TenkaMove } from "../tenka.types.ts";
import { tenkaMapOf } from "../tenkaMap.ts";
import { sensibleTenkaMove } from "../tenkaPolicy.ts";
import { startTenka } from "../tenkaStart.ts";
import { choiceNow, marksFor, NO_CHOICE, tapTerritory } from "../tenkaTaps.ts";
import { createTenkaChrome, type TenkaChrome } from "./chrome.ts";
import { type Cloth, clothVars, isCloth } from "./cloth.ts";
import { node } from "./dom.ts";
import type { TenkaDressing } from "./dressing.types.ts";
import { continentView, landInDirection, nearestLand, type TenkaArrow, tenkaMapModel } from "./mapModel.ts";
import { TENKA_STYLE } from "./style.ts";
import { tenkaMapSvg } from "./svg.ts";

/** Native table settings; defaults to three players, with two computers.
 * @example
 * ```ts
 * import type { TenkaTableOptions } from "@johnmorrisdotca/tenka/ui";
 * const options: TenkaTableOptions = { seed: 7, record: false };
 * console.log(options.seed);
 * ```
 */
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
  /** The cloth the table is laid in: "green", "blue", "red", "black" or "wood", the family's five; with none, it keeps its own sea. `theme` is laid over it. */
  cloth?: Cloth;
  /** CSS variables set on the table itself, which win in light and dark alike: `{ "--tk-sea": "#23405a" }`. */
  theme?: Readonly<Record<string, string>>;
  /** Whether the table shows the record of the game, with saving and loading. True by default. */
  record?: boolean;
  /** How the dice and the cards are drawn, if not the plain way: `tenkaDressing()` from `@johnmorrisdotca/tenka/dressing` draws them with Korokoro's dice and Toranpu's cards. The game is the same either way. */
  dressing?: TenkaDressing;
};

/** Native game access, restoration, redealing and presentation updates.
 * @example
 * ```ts
 * import type { TenkaTableHandle } from "@johnmorrisdotca/tenka/ui";
 * const update = (table: TenkaTableHandle) => table.set({ locale: "ja" });
 * console.log(typeof update);
 * ```
 */
export type TenkaTableHandle = {
  /** The game as it stands. */
  game: () => TenkaGame;
  /** A new game at the same table, with any options changed. */
  newGame: (options?: Pick<TenkaTableOptions, "players" | "computers" | "rounds" | "seed" | "map">) => void;
  /** Put a game on the table: one read back by `tenkaFromJSON` or `decodeTenka`. Seats keep who plays them when the number of players is the same; otherwise every seat but the first is the computer's, unless `computers` says. */
  setGame: (game: TenkaGame, computers?: readonly boolean[]) => void;
  /** Change the table's language, and with it any words of your own. */
  setLocale: (locale: TenkaLocale, strings?: Partial<TenkaStrings>) => void;
  /** Update presentation and callbacks without redealing or replacing the current game. */
  set: (
    options: Pick<
      TenkaTableOptions,
      "locale" | "strings" | "cloth" | "theme" | "record" | "dressing" | "colours" | "computerDelayMs" | "onChange"
    >,
  ) => void;
  /** Take the table off the page and stop its timers. */
  destroy: () => void;
};

const COMPUTER_NAMES = ["Kaze", "Yama"];

function freshSeed(): number {
  return Math.floor(Math.random() * 0xffffffff) >>> 0;
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
 * @param target - The host element, including a host in a shadow root.
 * @param options - Native game and presentation settings.
 * @returns The table handle; destroy it when the host is removed.
 * @example
 * ```ts
 * import { mountTenka } from "@johnmorrisdotca/tenka/ui";
 * const show = (host: HTMLElement) => mountTenka(host, { seed: 7, record: false });
 * console.log(typeof show);
 * ```
 */
export function mountTenka(target: HTMLElement, options: TenkaTableOptions = {}): TenkaTableHandle {
  let current = options;
  const pageLocale = (): TenkaLocale =>
    typeof document !== "undefined" && document.documentElement.lang.toLowerCase().startsWith("ja") ? "ja" : "en";
  let locale: TenkaLocale = current.locale ?? pageLocale();
  let own = current.strings ?? {};
  let words = tenkaStrings(locale, own);
  // Names nobody gave are the table's own: "You" in the table's language, then the computer's.
  const named = current.players !== undefined;
  let players = current.players ?? [words.you, ...COMPUTER_NAMES];
  let computers = current.computers ?? players.map((_, seat) => seat !== 0);
  let rounds = current.rounds ?? TENKA_WORLD_ROUNDS;
  let map: TenkaMapKey = current.map ?? "world";
  let colours = current.colours;
  let delay = current.computerDelayMs ?? 450;
  let showRecord = current.record !== false;
  let dressing = current.dressing;

  const begin = (seed: number): TenkaGame => {
    const game = startTenka(rounds, players, seed, undefined, map);
    if (game === null)
      throw new Error(`Tenka is played by two to six, for 10, 20 or 60 rounds; not ${players.length} for ${rounds}.`);
    return game;
  };

  let game = begin(current.seed ?? freshSeed());
  let choice: TenkaChoice = NO_CHOICE;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let focus: TenkaContinentKey | null = null;
  let note = "";
  // The territory a keyboard is on: the one Tab lands on, and the one the arrow keys move from.
  let onLand: number | null = null;
  // A move has just been made, so the chrome can show the dice landing. It clears the flag when it draws them.
  let moved = false;

  const root = node("div", "tk-root");
  root.dataset.testid = "tk-root";
  const wear = (cloth: string | undefined, theme: Readonly<Record<string, string>>) => {
    for (const name of Object.keys(clothVars("green"))) root.style.removeProperty(name);
    for (const [name, value] of Object.entries<string>({ ...clothVars(cloth), ...theme }))
      root.style.setProperty(name, value);
    if (isCloth(cloth)) root.dataset.cloth = cloth;
    else delete root.dataset.cloth;
  };
  wear(current.cloth, current.theme ?? {});
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
    moved = true;
    current.onChange?.(game);
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
    const near = nearestLand(
      view.x + (event.clientX - box.left) / scale,
      view.y + (event.clientY - box.top) / scale,
      24 / scale,
      game.map,
    );
    if (near !== null) tap(near);
  });

  // Keyboard play. A territory is focused (not by Tab, which would be forty-two stops) and the arrow keys move
  // between neighbours on the screen; Enter or Space taps, as a finger would.
  const ARROWS: Readonly<Record<string, TenkaArrow>> = {
    ArrowLeft: "left",
    ArrowRight: "right",
    ArrowUp: "up",
    ArrowDown: "down",
  };
  const landAt = (territory: number) => board.querySelector<SVGElement>(`.tk-land[data-territory="${territory}"]`);
  board.addEventListener("focusin", (event) => {
    const hit = (event.target as Element).closest("[data-territory]");
    if (hit?.classList.contains("tk-land")) onLand = Number(hit.getAttribute("data-territory"));
  });
  board.addEventListener("keydown", (event) => {
    const hit = (event.target as Element).closest(".tk-land[data-territory]");
    if (hit === null || event.altKey || event.ctrlKey || event.metaKey) return;
    const territory = Number(hit.getAttribute("data-territory"));
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      tap(territory);
      return;
    }
    const arrow = ARROWS[event.key];
    if (arrow === undefined) return;
    event.preventDefault();
    const next = landInDirection(territory, arrow, game.map, continentView(focus, game.map));
    if (next === null) return;
    landAt(territory)?.setAttribute("tabindex", "-1");
    const there = landAt(next);
    there?.setAttribute("tabindex", "0");
    there?.focus();
  });

  function drawMap() {
    const marks = computers[game.toPlay] ? marksFor(game, NO_CHOICE) : marksFor(game, choice);
    const model = tenkaMapModel(game, marks, colours);
    const drawn = { ...model, lands: model.lands.map((land) => ({ ...land, name: landName(land.territory) })) };
    // The map is drawn again after every move; a keyboard stays where it was.
    const hostRoot = target.getRootNode();
    const active =
      typeof ShadowRoot !== "undefined" && hostRoot instanceof ShadowRoot
        ? hostRoot.activeElement
        : target.ownerDocument.activeElement;
    const kept = board.contains(active) && onLand !== null;
    const view = continentView(focus, game.map);
    const describe = (land: { name: string; owner: number; armies: number }) =>
      tenkaSay(words.landSay, {
        land: land.name,
        owner: land.owner < 0 ? words.neutral : who(land.owner),
        n: land.armies,
      });
    board.replaceChildren(
      tenkaMapSvg(drawn, {
        view,
        pixels: board.clientWidth || undefined,
        label: words.mapLabel,
        describe,
        keys: words.mapKeys,
      }),
    );
    // The one Tab lands on: where the keyboard was, if that is on the screen; else the choice, else the first of the mover's on the screen.
    const shown = drawn.lands.filter(
      (land) =>
        land.at[0] >= view[0] &&
        land.at[0] <= view[0] + view[2] &&
        land.at[1] >= view[1] &&
        land.at[1] <= view[1] + view[3],
    );
    const stop =
      shown.find((land) => land.territory === onLand) ??
      shown.find((land) => land.territory === (choice.from ?? choice.placedOn)) ??
      shown.find((land) => land.owner === game.toPlay) ??
      shown[0];
    if (stop === undefined) return;
    onLand = stop.territory;
    const there = landAt(stop.territory);
    there?.setAttribute("tabindex", "0");
    if (kept) there?.focus({ preventScroll: true });
  }

  // The chrome's buttons call the handle, which is built just below; nothing is drawn until both exist.
  let chrome!: TenkaChrome;

  function render() {
    root.lang = locale;
    status.textContent = chrome.statusLine();
    drawMap();
    root.dataset.phase = game.phase;
    root.dataset.toPlay = String(game.toPlay);
    root.dataset.waiting = String(game.phase !== TENKA_PHASES.over && !computers[game.toPlay]);
    chrome.renderZoom();
    chrome.renderControls();
    chrome.renderDice();
    chrome.renderSeats();
    chrome.renderRecord();
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
      computers =
        changed.computers ?? (changed.players === undefined ? computers : players.map((_, seat) => seat !== 0));
      rounds = changed.rounds ?? rounds;
      map = changed.map ?? map;
      game = begin(changed.seed ?? freshSeed());
      choice = NO_CHOICE;
      note = "";
      current.onChange?.(game);
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
      current.onChange?.(game);
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
    set: (next) => {
      if (next.theme !== undefined || "cloth" in next) {
        const theme = next.theme ?? current.theme ?? {};
        for (const name of Object.keys(current.theme ?? {})) if (!(name in theme)) root.style.removeProperty(name);
        wear("cloth" in next ? next.cloth : current.cloth, theme);
      }
      if ("record" in next) {
        showRecord = next.record !== false;
        if (showRecord) side.append(record);
        else record.remove();
      }
      if ("colours" in next) colours = next.colours;
      if ("dressing" in next) dressing = next.dressing;
      if ("computerDelayMs" in next) delay = next.computerDelayMs ?? 450;
      current = { ...current, ...next };
      handle.setLocale(next.locale ?? locale, next.strings ?? {});
    },
    destroy: () => {
      if (timer !== null) clearTimeout(timer);
      chrome.releaseDrawn();
      resized?.disconnect();
      root.remove();
    },
  };

  chrome = createTenkaChrome({
    controls,
    dice,
    seats,
    record,
    zoom,
    game: () => game,
    setGame: (next) => {
      game = next;
    },
    choice: () => choice,
    computers: () => computers,
    words: () => words,
    locale: () => locale,
    colours: () => colours,
    dressing: () => dressing,
    showRecord: () => showRecord,
    note: () => note,
    setNote: (next) => {
      note = next;
    },
    focus: () => focus,
    setFocus: (next) => {
      focus = next;
    },
    landName,
    who,
    make,
    newGame: () => handle.newGame(),
    loadGame: (loaded) => handle.setGame(loaded),
    render: () => render(),
    takeMove: () => {
      const thrown = moved;
      moved = false;
      return thrown;
    },
  });

  // Counters are sized for the map's width on the screen, so a change of width draws the map again, and only the map.
  let drawnWidth = 0;
  const resized =
    typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(() => {
          if (board.clientWidth === drawnWidth) return;
          drawnWidth = board.clientWidth;
          drawMap();
        });
  resized?.observe(board);

  render();
  return handle;
}
