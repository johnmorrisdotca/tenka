// What every table test starts from: the built demo in `site/`, served to the
// page without a port, and the table's state read off the page.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test } from "@playwright/test";

import { TENKA_TERRITORIES } from "../dist/index.js";

const site = join(dirname(fileURLToPath(import.meta.url)), "..", "site");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };

export const ROOT = '#table [data-testid="tk-root"]';
/** The table when it is a person's turn. */
export const WAITING = `${ROOT}[data-waiting="true"]`;

/** Open the demo with a query, and collect anything the page complains of. The computer moves at once unless the query says otherwise. `missing` names paths (folders, by their start) the page is told are not there. */
export async function open(page, query = "?seed=7&delay=0&lang=en", lands = 42, missing = []) {
  if (!existsSync(join(site, "index.html"))) throw new Error("site/ is not built: run `pnpm site` first (`pnpm test:table` does)");
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  await page.route("http://tenka.test/**", (route) => {
    const { pathname } = new URL(route.request().url());
    const file = join(site, pathname === "/" ? "index.html" : pathname);
    if (!existsSync(file) || missing.some((start) => pathname.startsWith(start))) return route.fulfill({ status: 404, body: "" });
    return route.fulfill({ body: readFileSync(file), contentType: TYPES[file.slice(file.lastIndexOf("."))] ?? "application/octet-stream" });
  });
  await page.goto(`http://tenka.test/${query}`);
  await expect(page.locator(`${ROOT} .tk-land`)).toHaveCount(lands);
  return errors;
}

/** Tap, as a finger would where the page is touched and as a mouse where it is not. */
export async function tap(page, selector, options = {}) {
  const target = page.locator(selector).first();
  await target.scrollIntoViewIfNeeded();
  if (test.info().project.use.hasTouch === true) await target.tap(options);
  else await target.click(options);
}

/** Look at a continent, or the whole world. */
export async function look(page, view) {
  await tap(page, `#table .tk-zoom [data-view="${view}"]`);
  await expect(page.locator(`#table .tk-zoom [data-view="${view}"]`)).toHaveAttribute("aria-pressed", "true");
}

/** Tap a territory's counter, as a person on a phone would: its continent first, so that the counter is large enough to hit. */
export async function tapLand(page, territory) {
  await look(page, TENKA_TERRITORIES[territory].continent);
  await tap(page, `${ROOT} .tk-counter[data-territory="${territory}"]`);
}

/** The table as the page shows it. */
export function state(page) {
  return page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const all = (s) => [...document.querySelectorAll(s)];
    const box = (e) => e.getBoundingClientRect();
    const root = q('#table [data-testid="tk-root"]');
    return {
      lang: document.documentElement.lang,
      phase: root.dataset.phase,
      toPlay: Number(root.dataset.toPlay),
      waiting: root.dataset.waiting === "true",
      status: q('#table [data-testid="tk-status"]').textContent,
      controls: all('#table [data-testid="tk-controls"] button').map((b) => b.textContent),
      dice: q('#table [data-testid="tk-dice"]').textContent,
      // The numbers on the dice of the last throw, by side, as the table says they are (every die carries its face, drawn plain or dressed).
      faces: { attack: all("#table .tk-attack .tk-die").map((d) => Number(d.dataset.face)), defend: all("#table .tk-defend .tk-die").map((d) => Number(d.dataset.face)) },
      players: all('#table [data-testid="tk-player"]').map((p) => p.textContent),
      views: all("#table .tk-zoom button").map((b) => b.textContent),
      viewBox: q("#table .tk-map").getAttribute("viewBox"),
      lands: all("#table .tk-land").map((l) => ({ owner: Number(l.dataset.owner), armies: Number(l.dataset.armies), name: l.querySelector("title")?.textContent ?? `no title: ${l.outerHTML.slice(0, 120)}` })),
      seaLinks: all("#table .tk-sea-link").length,
      rings: all("#table .tk-ring").length,
      log: q('#table [data-testid="tk-log"]')?.textContent ?? "",
      note: q('#table [data-testid="tk-note"]')?.textContent ?? "",
      unreviewed: !q("#unreviewed").hidden,
      pitch: q('[data-say="pitch"]').textContent,
      pageWidth: document.documentElement.scrollWidth,
      windowWidth: window.innerWidth,
      // Anything to be tapped that is smaller than a fingertip. Links in running text are words, not targets; the map's counters are reached through a continent's view.
      small: all("button, input, select, textarea, summary, nav a, footer .family a")
        .filter((e) => box(e).width > 0 && !e.hidden && (box(e).height < 43.5 || box(e).width < 43.5))
        .map((e) => `${e.dataset.testid ?? e.className ?? e.tagName} “${e.textContent.trim().slice(0, 20)}”: ${Math.round(box(e).width)}×${Math.round(box(e).height)}`),
    };
  });
}

/** What holds in every state the table can be in: nothing wider than the screen, nothing too small to tap, nothing complained of. */
export async function sound(page, errors) {
  const s = await state(page);
  expect(s.pageWidth, "the page is no wider than the window").toBe(s.windowWidth);
  expect(s.small, "every target is at least 44px").toEqual([]);
  expect(errors, "the page complained of nothing").toEqual([]);
  return s;
}
