// Takes the pictures the README shows, from the built demo in `site/`: `pnpm pictures` (builds the demo, then runs this).
// The page is served to a browser without a port, never fetched from the live site, and the same each run:
// the deal is a seed (`?seed=`), the computers move at once (`?delay=0`) and motion is reduced.
// Output: docs/desktop.jpg (1280 wide, light, English), docs/phone.jpg (390 by 844, dark, Japanese, Europe close up) and
// docs/dressed.jpg (the table in Korokoro's dice and Toranpu's cards, a card in hand and a throw on the table, 1280 wide, light).
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

import { playTenka, startTenka, tenkaFromJSON, tenkaMoves } from "../dist/index.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const site = join(root, "site");
const docs = join(root, "docs");
const host = "http://tenka.test";
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" };
const QUALITY = 76;

if (!existsSync(join(site, "index.html"))) throw new Error("site/ is not built: run `pnpm pictures` (it builds the demo first)");
const browser = await chromium.launch();

/** A game of three from seed 7, a few moves in: armies on one territory, and an attack chosen from it. */
async function shot({ width, height, colorScheme, lang, europe = false, path, scrollTo }) {
  const context = await browser.newContext({ viewport: { width, height }, colorScheme, reducedMotion: "reduce", locale: "en-US", deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.route(`${host}/**`, (route) => {
    const { pathname } = new URL(route.request().url());
    const file = join(site, pathname === "/" ? "index.html" : pathname);
    if (!existsSync(file)) return route.fulfill({ status: 404, body: "" });
    return route.fulfill({ body: readFileSync(file), contentType: TYPES[file.slice(file.lastIndexOf("."))] ?? "application/octet-stream" });
  });
  await page.goto(`${host}/?seed=7&delay=0&lang=${lang}`);
  await page.waitForSelector('#table [data-testid="tk-root"][data-waiting="true"]');
  const own = await page.locator('#table .tk-land[data-owner="0"]').first().getAttribute("data-territory");
  await page.locator(`#table .tk-counter[data-territory="${own}"]`).click({ force: true });
  await page.locator('#table [data-testid="tk-all"]').click();
  await page.locator(`#table .tk-counter[data-territory="${own}"]`).click({ force: true });
  await page.locator('#table [data-testid="tk-record"] summary').click();
  await page.waitForFunction(() => document.querySelector('#table [data-testid="tk-log"]').textContent !== "");
  if (europe) await page.locator('#table .tk-zoom [data-view="europe"]').click();
  await page.waitForTimeout(300);
  if (scrollTo) await page.locator(scrollTo).evaluate((element) => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 16));
  else await page.evaluate(() => window.scrollTo(0, 0));
  await page.mouse.move(0, 0);
  await page.screenshot({ path, type: "jpeg", quality: QUALITY });
  await context.close();
}

/** The table dressed: round one taken (a territory won, so a card in hand), and in round two an attack thrown. */
async function dressed(path) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: "light", reducedMotion: "reduce", locale: "en-US", deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.route(`${host}/**`, (route) => {
    const { pathname } = new URL(route.request().url());
    const file = join(site, pathname === "/" ? "index.html" : pathname);
    if (!existsSync(file)) return route.fulfill({ status: 404, body: "" });
    return route.fulfill({ body: readFileSync(file), contentType: TYPES[file.slice(file.lastIndexOf("."))] ?? "application/octet-stream" });
  });
  const counter = (territory) => page.locator(`#table .tk-counter[data-territory="${territory}"]`).click({ force: true });
  // The page keeps the game after its first move; before that it is the seed's deal.
  const kept = async () => {
    const saved = await page.evaluate(() => localStorage.getItem("tenka.page.game"));
    return saved === null ? startTenka(20, ["You", "Kaze", "Yama"], 7) : tenkaFromJSON(JSON.stringify(JSON.parse(saved).game));
  };
  /** Place the armies on the first territory that can blitz, and blitz its first target. */
  const attack = async () => {
    const game = await kept();
    const attacks = (from) => tenkaMoves(playTenka(game, { kind: "place", territory: from, armies: game.reserve })).filter((move) => move.kind === "blitz" && move.from === from);
    const from = game.owners.findIndex((owner, territory) => owner === game.toPlay && attacks(territory).length > 0);
    await counter(from);
    await page.locator('#table [data-testid="tk-all"]').click();
    await counter(from);
    await counter(attacks(from)[0].to);
    await page.locator('#table [data-testid="tk-blitz"]').click();
  };
  await page.goto(`${host}/?seed=7&delay=0&lang=en`);
  await page.waitForSelector('#table [data-testid="tk-root"][data-waiting="true"]');
  await attack();
  if (await page.locator('#table [data-testid="tk-go"]').count()) await page.locator('#table [data-testid="tk-go"]').click();
  await page.locator('#table [data-testid="tk-stop"]').click();
  await page.locator('#table [data-testid="tk-end"]').click();
  await page.waitForSelector('#table [data-testid="tk-root"][data-waiting="true"][data-to-play="0"][data-phase="reinforce"]');
  await attack();
  await page.waitForTimeout(300);
  await page.mouse.move(0, 0);
  await page.locator("#table").screenshot({ path, type: "jpeg", quality: QUALITY });
  await context.close();
}

// From the top of the page, so the header, the language chooser and the cloth patches show.
await shot({ width: 1280, height: 900, colorScheme: "light", lang: "en", path: join(docs, "desktop.jpg") });
// Europe close up, on a phone, scrolled to the zoom buttons above the map.
await shot({ width: 390, height: 844, colorScheme: "dark", lang: "ja", europe: true, path: join(docs, "phone.jpg"), scrollTo: "#table .tk-zoom" });
await dressed(join(docs, "dressed.jpg"));
await browser.close();
