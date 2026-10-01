import { TENKA_WORLD_ROUNDS } from "./tenka.constants.ts";
import type { TenkaGame, TenkaMapKey } from "./tenka.types.ts";
import { tenkaDailySeed } from "./tenkaDaily.ts";
import { isTenkaSeed, isTenkaTable } from "./tenkaStart.ts";
import { mountTenka, type TenkaTableHandle } from "./ui/mount.ts";

/**
 * THE `<tenka-table>` ELEMENT: a whole table of Tenka in a tag, with no
 * framework. `@johnmorrisdotca/tenka/element/define` defines it; this entry
 * holds the class alone, to extend or to define under another name. Safe to
 * import on a server, where there is no page: the class then extends nothing.
 *
 * ```html
 * <tenka-table players="You, Kaze, Yama" rounds="10" seed="2026"></tenka-table>
 * <tenka-table players="Ann, Ben, Cho" computers="none" map="europe"></tenka-table>
 * ```
 *
 * Attributes (each is read again when it changes; a change to any but `lang`
 * deals a new game):
 *  - `players`: the names round the table, in seat order, separated by commas: two to six.
 *    "You, Kaze, Yama" if left out, in the table's language.
 *  - `computers`: who the computer plays, `true` or `false` for each seat, separated by commas
 *    (`false, true, true`), or `none` for people taking turns on one device, or `all`.
 *    Every seat but the first by default.
 *  - `rounds`: 10, 20 or 60 (the whole map, the default).
 *  - `seed`: a whole number to deal from, or `daily` for the day's seed (`tenkaDailySeed`); a new one if left out.
 *  - `map`: `world` (default) or `europe`.
 *  - `lang`: `en` or `ja`, or the page's. `record`: `off` to leave the record of the game out.
 *  - `delay`: how long the computer waits before each move, in milliseconds.
 *
 * It fires `tenka-change` after every move, with the game as `event.detail.game`, and has the
 * methods `newGame()` and `setGame()`. A table the rules do not offer (one player, say, or 15
 * rounds) draws nothing.
 */
const ElementBase: typeof HTMLElement = typeof HTMLElement === "undefined" ? (class {} as unknown as typeof HTMLElement) : HTMLElement;

const isOff = (value: string | null): boolean => value !== null && ["false", "off", "0", "no"].includes(value.toLowerCase());
const isOn = (value: string): boolean => ["true", "on", "1", "yes", "computer"].includes(value.toLowerCase());

/** The seats a `computers` attribute names, for `count` seats: undefined to leave it to the table. */
function computersFrom(value: string | null, count: number): boolean[] | undefined {
  if (value === null || value.trim() === "") return undefined;
  const word = value.trim().toLowerCase();
  if (word === "none") return Array.from({ length: count }, () => false);
  if (word === "all") return Array.from({ length: count }, () => true);
  const listed = value.split(",").map((one) => isOn(one.trim()));
  return Array.from({ length: count }, (_, seat) => listed[seat] ?? true);
}

export class TenkaTable extends ElementBase {
  static observedAttributes = ["players", "computers", "rounds", "seed", "map", "lang", "record", "delay"];

  #table: TenkaTableHandle | null = null;
  #key = "";
  #queued = false;
  #seed: number | null = null;

  connectedCallback(): void {
    this.#refresh();
  }

  disconnectedCallback(): void {
    this.#table?.destroy();
    this.#table = null;
    this.#key = "";
  }

  attributeChangedCallback(): void {
    if (!this.isConnected || this.#queued) return;
    this.#queued = true;
    queueMicrotask(() => {
      this.#queued = false;
      this.#refresh();
    });
  }

  /** The mounted table's handle (`mountTenka`), or null while the attributes name no table the rules offer. */
  get table(): TenkaTableHandle | null {
    return this.#table;
  }

  /** The game as it stands, or null while there is no table. */
  get game(): TenkaGame | null {
    return this.#table?.game() ?? null;
  }

  /** A new game at the same table: see `TenkaTableHandle.newGame`. */
  newGame(options?: Parameters<TenkaTableHandle["newGame"]>[0]): void {
    this.#table?.newGame(options);
  }

  /** Put a game on the table: see `TenkaTableHandle.setGame`. */
  setGame(game: TenkaGame, computers?: readonly boolean[]): void {
    this.#table?.setGame(game, computers);
  }

  #refresh(): void {
    const given = this.getAttribute("players");
    const players = given === null || given.trim() === "" ? undefined : given.split(",").map((name) => name.trim());
    const seats = players?.length ?? 3;
    const computers = computersFrom(this.getAttribute("computers"), seats);
    const asked = this.getAttribute("rounds");
    const rounds = asked === null ? TENKA_WORLD_ROUNDS : Number(asked);
    const map: TenkaMapKey = this.getAttribute("map") === "europe" ? "europe" : "world";
    const seedAttribute = this.getAttribute("seed");
    const seed = seedAttribute === "daily" ? tenkaDailySeed(new Date()) : seedAttribute !== null && isTenkaSeed(Number(seedAttribute)) ? Number(seedAttribute) : (this.#seed ??= Math.floor(Math.random() * 0xffffffff) >>> 0);
    const lang = this.getAttribute("lang");
    const locale = lang === "en" || lang === "ja" ? lang : undefined;
    const record = !isOff(this.getAttribute("record"));
    const delayAttribute = this.getAttribute("delay");
    const delay = delayAttribute === null || !Number.isFinite(Number(delayAttribute)) ? undefined : Math.max(0, Number(delayAttribute));
    const key = JSON.stringify([players, computers, rounds, map, seed, record, delay]);
    if (key === this.#key && this.#table !== null) {
      this.#table.setLocale(locale ?? (document.documentElement.lang.toLowerCase().startsWith("ja") ? "ja" : "en"));
      return;
    }
    this.#table?.destroy();
    this.#table = null;
    this.#key = key;
    if (!isTenkaTable(rounds, players?.length ?? 3)) return;
    this.#table = mountTenka(this, {
      players,
      computers,
      rounds,
      seed,
      map,
      locale,
      record,
      computerDelayMs: delay,
      onChange: (game) => this.dispatchEvent(new CustomEvent("tenka-change", { detail: { game }, bubbles: true })),
    });
  }
}
