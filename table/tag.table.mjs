// What the demo offers beside the table: a table in a tag, today's game, and a link that deals the same game.
import { expect, test } from "@playwright/test";

import { tenkaDailySeed } from "../dist/index.js";
import { ROOT, open, sound, tap } from "./table.mjs";

test("the table in a tag is on the page, played by the computer in turn, and speaks the page's language", async ({ page }) => {
  const errors = await open(page);
  const tag = page.locator('[data-testid="tag"] [data-testid="tk-root"]');
  await expect(tag).toHaveCount(1);
  await expect(tag.locator(".tk-land")).toHaveCount(37);
  await expect(tag.locator('[data-testid="tk-player"]')).toHaveCount(2);
  await expect(tag.locator('[data-testid="tk-record"]')).toHaveCount(0);
  await expect(tag.locator(".tk-status")).toContainText("of 10.");
  await tap(page, '[data-lang="ja"]');
  await expect(tag.locator(".tk-status")).toContainText("全10ラウンド");
  await tap(page, '[data-lang="en"]');
  await expect(tag.locator(".tk-status")).toContainText("of 10.");
  await sound(page, errors);
});

test("a page opened in Japanese has its tag in Japanese from the start", async ({ page }) => {
  const errors = await open(page, "?seed=7&delay=0&lang=ja");
  await expect(page.locator('[data-testid="tag"] .tk-status')).toContainText("全10ラウンド");
  await sound(page, errors);
});

test("Today's game deals the day's seed, whatever the set-up", async ({ page }) => {
  const errors = await open(page);
  await tap(page, '[data-players="4"]');
  await tap(page, "#daily");
  await expect(page.locator('#table [data-testid="tk-player"]')).toHaveCount(4);
  await tap(page, '#table [data-testid="tk-record"] summary');
  await expect(page.locator('#table [data-testid="tk-log"]')).toContainText(`seed ${tenkaDailySeed(new Date())}`);
  await sound(page, errors);
});

test("Copy link copies a link that deals the same game, and the address is read back", async ({ page }) => {
  // The page is served over http, where a browser keeps no clipboard; this one is a stand-in that remembers what was written.
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { value: { writeText: async (text) => void (window.__copied = text) } });
  });
  const errors = await open(page, "?seed=2026&players=4&rounds=10&map=europe&delay=0&lang=en", 37);
  await expect(page.locator('#table [data-testid="tk-player"]')).toHaveCount(4);
  await expect(page.locator(ROOT)).toContainText("of 10.");
  await expect(page.locator('#table .tk-zoom [data-view="europe"]')).toHaveCount(1);
  await tap(page, '#table [data-testid="tk-record"] summary');
  await expect(page.locator('#table [data-testid="tk-log"]')).toContainText("seed 2026");
  await tap(page, "#share");
  await expect(page.locator("#share")).toHaveText("Copied");
  const copied = new URL(await page.evaluate(() => window.__copied));
  expect(copied.origin).toBe("http://tenka.test");
  expect(Object.fromEntries(copied.searchParams)).toEqual({ seed: "2026", players: "4", rounds: "10", map: "europe", lang: "en" });
  // The button says what it is for again.
  await expect(page.locator("#share")).toHaveText("Copy link");
  await sound(page, errors);
});

test("Copy link says so when the browser will not let it", async ({ page }) => {
  const errors = await open(page);
  await tap(page, "#share");
  await expect(page.locator("#share")).toHaveText("Could not copy");
  await sound(page, errors);
});

test("the tag's attributes are read again when they change, and each move is an event", async ({ page }) => {
  const errors = await open(page);
  const tag = page.locator('[data-testid="tag"]');
  await page.evaluate(() => {
    window.__moves = [];
    document.getElementById("tag").addEventListener("tenka-change", (event) => window.__moves.push(event.detail.game.moves.length));
  });
  // People taking turns on one device, three of them, the whole map.
  await tag.evaluate((el) => {
    el.setAttribute("players", "Ann, Ben, Cho");
    el.setAttribute("computers", "none");
    el.setAttribute("rounds", "60");
    el.setAttribute("map", "world");
    el.setAttribute("seed", "7");
  });
  await expect(tag.locator('[data-testid="tk-root"] .tk-land')).toHaveCount(42);
  await expect(tag.locator('[data-testid="tk-player"]')).toHaveCount(3);
  await expect(tag.locator(".tk-status")).toContainText("Ann");
  expect(await tag.evaluate((el) => el.game.seed)).toBe(7);
  // Its first territory of Ann's takes an army, and says so.
  await tag.locator('.tk-land[data-owner="0"]').first().focus();
  await page.keyboard.press("Enter");
  await expect.poll(() => page.evaluate(() => window.__moves.length)).toBe(1);
  expect(await page.evaluate(() => window.__moves[0])).toBe(1);
  // The day's seed, and then a table the rules do not offer, which draws nothing.
  await tag.evaluate((el) => el.setAttribute("seed", "daily"));
  expect(await tag.evaluate((el) => el.game.seed)).toBe(tenkaDailySeed(new Date()));
  await tag.evaluate((el) => el.setAttribute("rounds", "15"));
  await expect(tag.locator('[data-testid="tk-root"]')).toHaveCount(0);
  expect(await tag.evaluate((el) => el.game)).toBeNull();
  await sound(page, errors);
});
