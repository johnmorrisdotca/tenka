/**
 * Tenka's table dressed in the family's dice and cards: Korokoro's dice for the
 * dice of every attack, tumbling onto the faces the game threw, and Toranpu's
 * cards for the cards in a hand, with a territory card of Tenka's own and a
 * back of Tenka's own for the deck.
 *
 * This is its own entry because it is the one place Tenka reaches for another
 * package. `@johnmorrisdotca/korokoro` and `@johnmorrisdotca/toranpu` are
 * optional peer dependencies of it and of nothing else: the rules, the map, the
 * computer player and the plain table (`/ui`, `/react`, `/element`) need
 * neither, and a page that never imports this file never loads them. It only
 * draws. The dice are thrown by the game's own seeded random, as they always
 * were, and Korokoro is handed the face that came up; the cards are the game's
 * hands. A game plays and replays the same whether or not it is dressed.
 *
 * ```ts
 * import { mountTenka } from "@johnmorrisdotca/tenka/ui";
 * import { tenkaDressing } from "@johnmorrisdotca/tenka/dressing";
 *
 * mountTenka(document.getElementById("table")!, { dressing: tenkaDressing() });
 * ```
 */
import { createRollSound, mountDie, type DieHandle, type RandomSource, type RollSound } from "@johnmorrisdotca/korokoro";
import { cardBackSvg, type CardBackOptions } from "@johnmorrisdotca/toranpu/card-backs";
import { cardFaceSvg } from "@johnmorrisdotca/toranpu/card-faces";

import { tenkaCardDesign, tenkaCardId } from "./dressingCards.ts";
import type { TenkaCardHow, TenkaDieHow, TenkaDrawn, TenkaDressing } from "./ui/dressing.types.ts";

export { tenkaCardDesign, tenkaCardId, tenkaCardOfId } from "./dressingCards.ts";
export type { TenkaBackHow, TenkaCardHow, TenkaDieHow, TenkaDrawn, TenkaDressing } from "./ui/dressing.types.ts";

/** What `tenkaDressing` may be given. Everything is optional. */
export type TenkaDressingOptions = {
  /** Whether a throw makes the sound of dice: off unless asked, because a page that has not asked for noise gets none. */
  sound?: boolean;
  /** How long the dice tumble before they land, in milliseconds: 600 unless said. 0 lands them at once. A device that asks for reduced motion lands them at once whatever this says. */
  tumbleMs?: number;
  /** Tenka's own back for the deck is drawn in the table's green, with the character 天 in the middle; say any of its colours or its mark here to change it. `art`, `image` and `logo` are Toranpu's, for a back of your own. */
  back?: CardBackOptions;
};

/** Tenka's own back, as the deck shows it. */
export const TENKA_BACK: CardBackOptions = { colour: "#2f5d4a", ink: "#e9dfc3", paper: "#fffdf8", mark: "天" };

const DEFAULT_TUMBLE_MS = 600;

/**
 * A random source for Korokoro that comes up with `face` on a die of six: how a die is made to tumble onto the face
 * the game has already thrown. Korokoro picks a face from the source it is given, and this one picks the one asked for.
 */
export function tenkaThrownDie(face: number): RandomSource {
  return { seed: null, next: () => face - 1 };
}

/** The element a piece of SVG markup comes to. */
function elementOf(markup: string): Element {
  const holder = document.createElement("template");
  holder.innerHTML = markup.trim();
  return holder.content.firstElementChild as Element;
}

/**
 * Tenka's dice and cards, drawn by the packages that draw them best: give the result to `mountTenka`, to the React
 * `TenkaTable`, or to a `<tenka-table>`'s `dressing`.
 */
export function tenkaDressing(options: TenkaDressingOptions = {}): TenkaDressing {
  const tumbleMs = Math.max(0, options.tumbleMs ?? DEFAULT_TUMBLE_MS);
  const design = tenkaCardDesign();
  const back = { ...TENKA_BACK, ...options.back };
  let sound: RollSound | null = null;

  const ring = (how: TenkaDieHow, ms: number) => {
    // One sound for a throw, not one for each of its dice: the first die asks for it.
    if (options.sound !== true || how.index !== 0 || ms === 0) return;
    try {
      sound ??= createRollSound(window);
      sound.play({ dice: how.count, ms, landings: Array.from({ length: how.count }, () => ms + 30) });
    } catch {
      // No sound is no reason for the dice not to fall.
    }
  };

  return {
    die(face: number, how: TenkaDieHow): TenkaDrawn {
      const host = document.createElement("span");
      host.className = "tk-korokoro";
      // A picture of the throw and nothing to press: the table is played by its buttons.
      (host as HTMLElement).inert = true;
      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      const ms = reduced ? 0 : tumbleMs;
      const timers = new Set<ReturnType<typeof setTimeout>>();
      const theme = {
        "--kk-solo": "var(--tk-die-size, 34px)",
        "--kk-die": how.side === "attack" ? "var(--tk-attack)" : "var(--tk-defend)",
        "--kk-die-ink": how.side === "attack" ? "var(--tk-attack-ink)" : "var(--tk-defend-ink)",
        "--kk-die-edge": how.side === "attack" ? "rgba(0,0,0,.4)" : "color-mix(in srgb, var(--tk-defend-ink) 45%, transparent)",
      } as const;
      // A die that has only just been thrown is a rollable one made to land where the game threw it; any other is a picture of its face.
      const tumbling = how.tumble && ms > 0;
      const die: DieHandle = mountDie(host, {
        sides: 6,
        face: tumbling ? (face % 6) + 1 : face,
        rollable: tumbling,
        onePip: "black",
        theme,
        locale: how.locale,
        source: tenkaThrownDie(face),
        animationMs: ms,
        onRoll: () => {
          // Landed: from here it is a picture.
          timers.add(setTimeout(() => die.setRollable(false), 400));
        },
      });
      if (tumbling) {
        ring(how, ms);
        die.roll();
      }
      return {
        element: host,
        destroy: () => {
          for (const timer of timers) clearTimeout(timer);
          die.destroy();
        },
      };
    },

    card(how: TenkaCardHow): TenkaDrawn {
      const svg = cardFaceSvg(tenkaCardId(how.map, how.territory), { design, language: how.locale, title: "" });
      if (svg === null) throw new Error(`Toranpu did not draw card ${how.card}`);
      return { element: elementOf(svg) };
    },

    back(): TenkaDrawn {
      return { element: elementOf(cardBackSvg("classic-blue", { ...back, title: "" })) };
    },
  };
}
