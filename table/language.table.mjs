// The two languages: the chooser in the header, the address, and what a device remembers.
import { expect, test } from "@playwright/test";

import { open, sound, state, tap } from "./table.mjs";

test("the chooser turns the page and the table to Japanese, and back", async ({ page }) => {
  const errors = await open(page);
  let s = await state(page);
  expect(s.lang).toBe("en");
  expect(s.unreviewed).toBe(false);
  await tap(page, '[data-lang="ja"]');
  s = await sound(page, errors);
  expect(s.lang).toBe("ja");
  expect(s.unreviewed).toBe(true);
  expect(s.pitch).toContain("世界征服ゲーム");
  expect(s.views).toEqual(["世界", "北アメリカ", "南アメリカ", "ヨーロッパ", "アフリカ", "アジア", "オセアニア"]);
  expect(s.status).toMatch(/^第1ラウンド（全20ラウンド）。 あなた: 自分の領土に\d+部隊を置いてください。$/);
  expect(s.players[0]).toContain("領土14・部隊35・カード0枚");
  expect(s.lands[35].name).toMatch(/^日本: \d+$/);
  await tap(page, '[data-lang="en"]');
  s = await sound(page, errors);
  expect(s.lang).toBe("en");
  expect(s.unreviewed).toBe(false);
  expect(s.status).toMatch(/^Round 1 of 20\. You: place \d+ armies on your territories\.$/);
  expect(s.lands[35].name).toMatch(/^Japan: \d+$/);
});

test("the address asks for a language, and a device remembers the one chosen", async ({ page }) => {
  const errors = await open(page, "?seed=7&delay=0&lang=ja");
  let s = await sound(page, errors);
  expect(s.lang).toBe("ja");
  expect(s.views[0]).toBe("世界");

  // Chosen by the button, then the page opened again with nothing in the address.
  await page.goto("http://tenka.test/?seed=7&delay=0");
  await tap(page, '[data-lang="ja"]');
  await page.goto("http://tenka.test/?seed=7&delay=0");
  await expect(page.locator("#table .tk-zoom button").first()).toHaveText("世界");
  s = await sound(page, errors);
  expect(s.lang).toBe("ja");
  await tap(page, '[data-lang="en"]');
  await page.goto("http://tenka.test/?seed=7&delay=0");
  await expect(page.locator("#table .tk-zoom button").first()).toHaveText("World");
});

test("a first visit follows the browser's language", async ({ browser }) => {
  const context = await browser.newContext({ locale: "ja-JP", viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = await open(page, "?seed=7&delay=0");
  const s = await sound(page, errors);
  expect(s.lang).toBe("ja");
  expect(s.players[0]).toContain("あなた");
  await context.close();
});
