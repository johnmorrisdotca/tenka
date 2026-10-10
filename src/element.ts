import { TENKA_WORLD_ROUNDS } from "./tenka.constants.ts";
import type { TenkaGame, TenkaMapKey } from "./tenka.types.ts";
import { tenkaDailySeed } from "./tenkaDaily.ts";
import { isTenkaSeed, isTenkaTable } from "./tenkaStart.ts";
import { tenkaStrings } from "./strings.ts";
import { embedDay } from "./embed-day.ts";
import type { TenkaDressing } from "./ui/dressing.types.ts";
import { TENKA_STYLE } from "./ui/style.ts";
import { mountTenka, type TenkaTableHandle, type TenkaTableOptions } from "./ui/mount.ts";

const ElementBase: typeof HTMLElement = typeof HTMLElement === "undefined" ? (class {} as unknown as typeof HTMLElement) : HTMLElement;
const isOff = (value: string | null): boolean => value !== null && ["false", "off", "0", "no"].includes(value.trim().toLowerCase());
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


/** Native options, checked by shared builder coverage.
 * @example
 * ```ts
 * import { TENKA_EMBED_OPTION_KEYS } from "@johnmorrisdotca/tenka/element";
 * console.log(TENKA_EMBED_OPTION_KEYS.includes("dressing"));
 * ```
 */
export const TENKA_EMBED_OPTION_KEYS = Object.keys({ players: true, computers: true, rounds: true, seed: true, map: true, colours: true, computerDelayMs: true, onChange: true, locale: true, strings: true, theme: true, record: true, dressing: true } satisfies Record<keyof TenkaTableOptions, boolean>);
/** Full native host options, including names and custom card/dice drawings.
 * @example
 * ```ts
 * import type { TenkaElementOptions } from "@johnmorrisdotca/tenka/element";
 * const options: TenkaElementOptions = { record: false, seed: 7 };
 * console.log(options.seed);
 * ```
 */
export type TenkaElementOptions = TenkaTableOptions;
/** A reflected native Tenka table, safe to import without a browser.
 * Public events carry game-shaped copies with generic seat labels; private getters retain names.
 * @example
 * ```ts
 * import { TenkaTable } from "@johnmorrisdotca/tenka/element";
 * console.log(TenkaTable.observedAttributes.includes("daily"));
 * ```
 */
export class TenkaTable extends ElementBase {
  static observedAttributes = ["players", "computers", "rounds", "seed", "map", "lang", "record", "delay", "seats", "daily", "size", "width", "theme", "label"];
  #table: TenkaTableHandle | null = null;
  #key = "";
  #queued = false;
  #seed: number | null = null;
  #options: TenkaElementOptions = {};
  #dressing: TenkaDressing | undefined;
  #watch: MutationObserver | null = null;
  #widthBefore: string | null = null;
  #widthOwned = false;
  #labelBefore: { role: string | null; label: string | null } | null = null;
  /** Native host options; presentation updates preserve play. */
  get options(): TenkaElementOptions { return this.#options; }
  set options(value: TenkaElementOptions) { this.#options = value ?? {}; if (this.isConnected) this.#refresh(); }
  /** The custom dice/card drawing; changing it preserves the current game. */
  get dressing(): TenkaDressing | undefined { return this.#dressing; }
  set dressing(next: TenkaDressing | undefined) { this.#dressing = next; if (this.isConnected) this.#refresh(); }
  /** The native live table handle, or null before mounting. */
  get table(): TenkaTableHandle | null { return this.#table; }
  /** The private native game, or null before mounting. */
  get game(): TenkaGame | null { return this.#table?.game() ?? null; }
  /** Redeal using the native table method.
   * @param options - Optional game settings for the new deal.
   * @returns Nothing; the change event announces the new game.
   * @example
   * ```ts
   * import type { TenkaTable } from "@johnmorrisdotca/tenka/element";
   * const again = (table: TenkaTable) => table.newGame({ seed: 7 });
   * console.log(typeof again);
   * ```
   */
  newGame(options?: Parameters<TenkaTableHandle["newGame"]>[0]): void { this.#table?.newGame(options); }
  /** Restore a native saved game.
   * @param game - A validated native game, read with tenkaFromJSON.
   * @param computers - Optional seat ownership, otherwise preserved.
   * @returns Nothing; the change event announces the restored game.
   * @example
   * ```ts
   * import type { TenkaTable } from "@johnmorrisdotca/tenka/element";
   * const restore = (table: TenkaTable) => { if (table.game) table.setGame(table.game); };
   * console.log(typeof restore);
   * ```
   */
  setGame(game: TenkaGame, computers?: readonly boolean[]): void { this.#table?.setGame(game, computers); }
  #write(name: string, value: unknown): void { if (value === null || value === undefined) this.removeAttribute(name); else this.setAttribute(name, String(value)); }
  connectedCallback(): void {
    this.#refresh();
    this.#watch = new MutationObserver(() => { if (!this.hasAttribute("lang")) this.#refresh(); });
    this.#watch.observe(this.ownerDocument.documentElement, { attributes: true, attributeFilter: ["lang"] });
  }
  disconnectedCallback(): void { this.#watch?.disconnect(); this.#watch = null; this.#table?.destroy(); this.#table = null; this.#key = ""; }
  attributeChangedCallback(): void {
    if (!this.isConnected || this.#queued) return;
    this.#queued = true; queueMicrotask(() => { this.#queued = false; if (this.isConnected) this.#refresh(); });
  }
  /** The `players` attribute, reflected. */
  get players(): string | null { return this.getAttribute("players"); }
  set players(value: string | number | boolean | null | undefined) { this.#write("players", value); }
  /** The `computers` attribute, reflected. */
  get computers(): string | null { return this.getAttribute("computers"); }
  set computers(value: string | number | boolean | null | undefined) { this.#write("computers", value); }
  /** The `rounds` attribute, reflected. */
  get rounds(): string | null { return this.getAttribute("rounds"); }
  set rounds(value: string | number | boolean | null | undefined) { this.#write("rounds", value); }
  /** The `seed` attribute, reflected. */
  get seed(): string | null { return this.getAttribute("seed"); }
  set seed(value: string | number | boolean | null | undefined) { this.#write("seed", value); }
  /** The `map` attribute, reflected. */
  get map(): string | null { return this.getAttribute("map"); }
  set map(value: string | number | boolean | null | undefined) { this.#write("map", value); }
  /** The `record` attribute, reflected. */
  get record(): string | null { return this.getAttribute("record"); }
  set record(value: string | number | boolean | null | undefined) { this.#write("record", value); }
  /** The `delay` attribute, reflected. */
  get delay(): string | null { return this.getAttribute("delay"); }
  set delay(value: string | number | boolean | null | undefined) { this.#write("delay", value); }
  /** The `seats` attribute, reflected. */
  get seats(): string | null { return this.getAttribute("seats"); }
  set seats(value: string | number | boolean | null | undefined) { this.#write("seats", value); }
  /** The `daily` attribute, reflected. */
  get daily(): string | null { return this.getAttribute("daily"); }
  set daily(value: string | number | boolean | null | undefined) { this.#write("daily", value); }
  /** The `size` attribute, reflected. */
  get size(): string | null { return this.getAttribute("size"); }
  set size(value: string | number | boolean | null | undefined) { this.#write("size", value); }
  /** The `width` attribute, reflected. */
  get width(): string | null { return this.getAttribute("width"); }
  set width(value: string | number | boolean | null | undefined) { this.#write("width", value); }
  /** The `theme` attribute, reflected. */
  get theme(): string | null { return this.getAttribute("theme"); }
  set theme(value: string | number | boolean | null | undefined) { this.#write("theme", value); }
  /** The `label` attribute, reflected. */
  get label(): string | null { return this.getAttribute("label"); }
  set label(value: string | number | boolean | null | undefined) { this.#write("label", value); }
  #frame(): void {
    this.style.display = "block"; this.style.maxWidth = "100%";
    const width = Number(this.getAttribute("width")), size = this.getAttribute("size");
    const pixels = this.hasAttribute("width") && width > 0 && Number.isFinite(width) ? Math.min(width, 2000) : size === "small" ? 320 : size === "medium" ? 480 : size === "large" ? 640 : null;
    if (pixels !== null) { if (!this.#widthOwned) this.#widthBefore = this.style.width; this.#widthOwned = true; this.style.width = `${pixels}px`; }
    else if (this.#widthOwned) { this.style.width = this.#widthBefore ?? ""; this.#widthOwned = false; }
    const theme = this.getAttribute("theme"); this.style.colorScheme = theme === "light" || theme === "dark" ? theme : "light dark";
    this.setAttribute("data-tenka-embed", "");
    const root = this.getRootNode(), target: ParentNode = typeof ShadowRoot !== "undefined" && root instanceof ShadowRoot ? root : this.ownerDocument.head;
    if (target.querySelector("style[data-tenka-embed-style]") === null) {
      const style = this.ownerDocument.createElement("style"); style.setAttribute("data-tenka-embed-style", "");
      const light = TENKA_STYLE.match(/\.tk-root \{([^}]+)\}/)?.[1] ?? "";
      const dark = TENKA_STYLE.match(/@media \(prefers-color-scheme: dark\) \{\s*\.tk-root \{([^}]+)\}/)?.[1] ?? "";
      style.textContent = `[data-tenka-embed][theme="light"] .tk-root{${light}}[data-tenka-embed][theme="dark"] .tk-root{${dark}}[data-tenka-embed]>.tk-root{background:var(--tk-panel);padding:12px;border-radius:12px}`;
 target.append(style);
    }
    if (this.hasAttribute("label")) { this.#labelBefore ??= { role: this.getAttribute("role"), label: this.getAttribute("aria-label") }; this.setAttribute("role", "group"); this.setAttribute("aria-label", this.getAttribute("label")!); }
    else if (this.#labelBefore !== null) { for (const [name, value] of [["role", this.#labelBefore.role], ["aria-label", this.#labelBefore.label]]) { if (value === null) this.removeAttribute(name!); else this.setAttribute(name!, value!); } this.#labelBefore = null; }
  }

  #refresh(): void {
    this.#frame();
    try {
      const given = this.getAttribute("players");
      const askedSeats = this.hasAttribute("seats") ? Number(this.getAttribute("seats")) : undefined;
      const players = given !== null && given.trim() !== "" ? given.split(",").map(name => name.trim()) : this.#options.players ?? (askedSeats === undefined ? undefined : Array.from({ length: Number.isInteger(askedSeats) && askedSeats >= 2 && askedSeats <= 6 ? askedSeats : 0 }, () => ""));
      const count = players?.length ?? 3;
      const computers = this.hasAttribute("computers") ? computersFrom(this.getAttribute("computers"), count) : this.#options.computers;
      const rounds = this.hasAttribute("rounds") ? Number(this.getAttribute("rounds")) : this.#options.rounds ?? TENKA_WORLD_ROUNDS;
      const map: TenkaMapKey = this.hasAttribute("map") ? this.getAttribute("map") === "europe" ? "europe" : "world" : this.#options.map ?? "world";
      const seedAttribute = this.getAttribute("seed"), day = embedDay(this.hasAttribute("daily") ? this.getAttribute("daily") : seedAttribute === "daily" ? "today" : null);
      const seed = day !== null ? tenkaDailySeed(new Date(`${day}T00:00:00Z`)) : seedAttribute !== null && isTenkaSeed(Number(seedAttribute)) ? Number(seedAttribute) : this.#options.seed ?? (this.#seed ??= Math.floor(Math.random() * 0xffffffff) >>> 0);
      const lang = this.closest("[lang]")?.getAttribute("lang"), locale = lang === "en" || lang === "ja" ? lang : this.#options.locale ?? (this.ownerDocument.documentElement.lang.toLowerCase().startsWith("ja") ? "ja" : "en");
      const record = this.hasAttribute("record") ? !isOff(this.getAttribute("record")) : this.#options.record ?? true;
      const askedDelay = this.getAttribute("delay"), delay = askedDelay !== null && Number.isFinite(Number(askedDelay)) ? Math.max(0, Math.min(60000, Number(askedDelay))) : this.#options.computerDelayMs;
      if (!isTenkaTable(rounds, count) || players?.some(name => name.length > 200)) throw new RangeError("Choose two to six seats and 10, 20 or 60 rounds.");
      const key = JSON.stringify([players, computers, rounds, map, seed]);
      const presentation = { locale, record, computerDelayMs: delay, dressing: this.#dressing ?? this.#options.dressing, colours: this.#options.colours, strings: this.#options.strings, theme: this.#options.theme ?? {}, onChange: (game: TenkaGame) => {
        const detail = JSON.parse(JSON.stringify({ game: { ...game, players: game.players.map((_, at) => `Seat ${at + 1}`) } }));
        this.dispatchEvent(new CustomEvent("tenka-change", { detail, bubbles: true, composed: true })); this.#options.onChange?.(game);
        if (game.phase === "over") this.dispatchEvent(new CustomEvent("tenka-finish", { detail: JSON.parse(JSON.stringify(detail)), bubbles: true, composed: true }));
      } };
      if (key === this.#key && this.#table !== null) { this.#table.set(presentation); return; }
      this.#table?.destroy(); this.#table = null; this.#key = ""; this.replaceChildren();
      this.#table = mountTenka(this, { ...this.#options, players, computers, rounds, seed, map, ...presentation }); this.#key = key;
      this.dispatchEvent(new CustomEvent("tenka-load", { detail: { seed, day, rounds, map, seats: count }, bubbles: true, composed: true }));
    } catch (error) {
      this.#table?.destroy(); this.#table = null; this.#key = "";
      const message = error instanceof Error ? error.message : String(error), status = this.ownerDocument.createElement("p"); status.setAttribute("role", "status");
      status.textContent = (this.closest("[lang]")?.getAttribute("lang") ?? this.#options.locale ?? this.ownerDocument.documentElement.lang).startsWith("ja") ? tenkaStrings("ja").embedError : message;
      this.replaceChildren(status); this.dispatchEvent(new CustomEvent("tenka-error", { detail: { message }, bubbles: true, composed: true }));
    }
  }
}
/** Register a default or custom-tag table; server-safe and idempotent.
 * @param tagName - The tag name, defaulting to tenka-table.
 * @param registry - The browser registry, undefined on a server.
 * @returns Nothing; existing registrations are preserved.
 * @example
 * ```ts
 * import { defineTable } from "@johnmorrisdotca/tenka/element";
 * defineTable();
 * console.log(typeof defineTable);
 * ```
 */
export function defineTable(tagName = "tenka-table", registry: CustomElementRegistry | undefined = typeof customElements === "undefined" ? undefined : customElements): void { if (registry !== undefined && registry.get(tagName) === undefined) registry.define(tagName, tagName === "tenka-table" ? TenkaTable : class extends TenkaTable {}); }
