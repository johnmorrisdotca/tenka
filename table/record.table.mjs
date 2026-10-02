// The record of the game: the moves as text, a game saved as JSON, text and CSV, a saved game
// loaded back, and a game left half way found again on return.
import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

import { TENKA_CSV_COLUMNS, tenkaFromJSON } from "../dist/index.js";
import { ROOT, WAITING, open, sound, state, tap, tapLand } from "./table.mjs";

/** Tap a button that saves a file, and hand back the file's text. */
async function saved(page, selector) {
  const [download] = await Promise.all([page.waitForEvent("download"), tap(page, selector)]);
  return { name: download.suggestedFilename(), text: readFileSync(await download.path(), "utf8") };
}

test("the record is written as the game goes, and saves as JSON, text and CSV", async ({ page }) => {
  const errors = await open(page);
  const own = (await state(page)).lands.findIndex((land) => land.owner === 0);
  await tap(page, '#table [data-testid="tk-record"] summary');
  await expect(page.locator('#table [data-testid="tk-log"]')).toContainText("Tenka:");
  let s = await sound(page, errors);
  expect(s.log).toBe("Tenka: You, Kaze, Yama; 20 rounds; seed 7\nNo moves yet.\n");
  await tapLand(page, own);
  s = await sound(page, errors);
  expect(s.log).toMatch(/^Tenka: You, Kaze, Yama; 20 rounds; seed 7\nRound 1\nYou places 1 on .+\.\n$/);

  const json = await saved(page, '#table [data-testid="tk-save-json"]');
  expect(json.name).toBe("tenka-7.json");
  const data = JSON.parse(json.text);
  expect(data.format).toBe(2);
  expect(data.moves).toEqual([["p", own, 1]]);
  expect(tenkaFromJSON(json.text).armies[own]).toBe(s.lands[own].armies);

  const text = await saved(page, '#table [data-testid="tk-save-text"]');
  expect(text.name).toBe("tenka-7.txt");
  expect(text.text).toBe(s.log);
  const csv = await saved(page, '#table [data-testid="tk-save-csv"]');
  expect(csv.name).toBe("tenka-7.csv");
  expect(csv.text.split("\r\n")[0]).toBe(TENKA_CSV_COLUMNS.join(","));
  expect(csv.text.split("\r\n").length).toBe(3);

  // In Japanese the record is Japanese.
  await tap(page, '[data-lang="ja"]');
  s = await sound(page, errors);
  expect(s.log).toMatch(/^天下: You、Kaze、Yama、20ラウンド、シード 7\n第1ラウンド\nYouが.+に1部隊を置く。\n$/);
});

test("a saved game loads back, and a file that is not a game is refused", async ({ page }) => {
  const errors = await open(page);
  const own = (await state(page)).lands.findIndex((land) => land.owner === 0);
  await tapLand(page, own);
  await tap(page, '#table [data-testid="tk-record"] summary');
  await expect(page.locator('#table [data-testid="tk-log"]')).toContainText("Round 1");
  const json = await saved(page, '#table [data-testid="tk-save-json"]');
  const before = await state(page);

  // Play on, then go back to the saved game.
  await tapLand(page, own);
  expect((await state(page)).lands[own].armies).toBe(before.lands[own].armies + 1);
  await page.locator('#table [data-testid="tk-file"]').setInputFiles({ name: "tenka-7.json", mimeType: "application/json", buffer: Buffer.from(json.text) });
  await expect(page.locator('#table [data-testid="tk-note"]')).toHaveText("Game loaded: 1 moves.");
  let s = await sound(page, errors);
  expect(s.lands.map((land) => land.armies)).toEqual(before.lands.map((land) => land.armies));
  expect(s.log).toBe(before.log);

  // A move nobody could have made, and a file of something else.
  const forged = JSON.stringify({ ...JSON.parse(json.text), moves: [["a", 0, 41, 3]] });
  for (const text of [forged, "not a game", "{}"]) {
    await page.locator('#table [data-testid="tk-file"]').setInputFiles({ name: "other.json", mimeType: "application/json", buffer: Buffer.from(text) });
    await expect(page.locator('#table [data-testid="tk-note"]')).toHaveText("That file is not a game of Tenka these rules can replay.");
  }
  s = await sound(page, errors);
  expect(s.lands.map((land) => land.armies)).toEqual(before.lands.map((land) => land.armies));
});

test("a game left half way is on the table again on return", async ({ page }) => {
  const errors = await open(page, "?delay=0&lang=en");
  await expect(page.locator(WAITING)).toHaveAttribute("data-phase", "reinforce");
  const own = (await state(page)).lands.findIndex((land) => land.owner === 0);
  await tapLand(page, own);
  const left = await state(page);
  await page.goto("http://tenka.test/?delay=0&lang=en");
  await expect(page.locator(`${ROOT} .tk-land`)).toHaveCount(42);
  const back = await sound(page, errors);
  expect(back.lands).toEqual(left.lands);
  expect(back.status).toBe(left.status);
  expect(back.players).toEqual(left.players);
});

test("a world game kept before 2.0.0 is refused cleanly: the page starts a new game and says nothing is wrong", async ({ page }) => {
  // Kept by 1.x, when the world had other territories: the moves would mean other places, so it is not replayed.
  const old = {
    game: { format: 1, game: "tenka", generator: "tenka 1.3.0", seed: 7, players: ["You", "Ann", "Ben"], rounds: 10, placing: "auto", moves: [["p", 1, 3]], state: { round: 1, phase: "attack", toPlay: 0, winners: [] } },
    computers: [false, true, true],
  };
  await page.addInitScript((kept) => localStorage.setItem("tenka.page.game", JSON.stringify(kept)), old);
  const errors = await open(page, "?delay=0&lang=en");
  const now = await sound(page, errors);
  // A new game at the page's own set-up (twenty rounds), not the kept one (ten rounds, a move made).
  expect(now.status).toMatch(/^Round 1 of 20\./);
  expect(now.lands).toHaveLength(42);
});
