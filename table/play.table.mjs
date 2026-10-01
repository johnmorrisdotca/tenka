// A game played by taps: placing, attacking, moving in, ending the turn, and the computer's reply.
import { expect, test } from "@playwright/test";

import { TENKA_TERRITORIES, playTenka, startTenka, tenkaMoves } from "../dist/index.js";
import { ROOT, WAITING, look, open, sound, state, tap, tapLand } from "./table.mjs";

// The demo's own first game, as `?seed=7` deals it: the same in every browser, so the taps can be planned.
const dealt = startTenka(20, ["You", "Kaze", "Yama"], 7);

test("the table comes up with the world, the players and what to do", async ({ page }) => {
  const errors = await open(page);
  const s = await sound(page, errors);
  expect(s.lands.length).toBe(42);
  expect(s.lands.map((land) => land.owner)).toEqual([...dealt.owners]);
  expect(s.lands.map((land) => land.armies)).toEqual([...dealt.armies]);
  expect(s.players.length).toBe(3);
  expect(s.players[0]).toContain("You");
  expect(s.players[0]).toContain("14 lands, 35 armies, 0 cards");
  expect(s.views).toEqual(["World", "North America", "South America", "Europe", "Africa", "Asia", "Oceania"]);
  expect(s.seaLinks).toBeGreaterThan(20);
  // The seed dealt the first turn to the first seat.
  expect(dealt.toPlay).toBe(0);
  expect(s.waiting).toBe(true);
  expect(s.status).toBe(`Round 1 of 20. You: place ${dealt.reserve} armies on your territories.`);
});

test("a turn by taps: place, attack until it is decided, move in, stop, end the turn", async ({ page }) => {
  const errors = await open(page);
  // The attack to make: the first blitz the rules offer once every new army is on its territory.
  let game = dealt;
  const attacks = (from) => tenkaMoves(playTenka(game, { kind: "place", territory: from, armies: game.reserve })).filter((move) => move.kind === "blitz" && move.from === from);
  const from = game.owners.findIndex((owner, territory) => owner === 0 && attacks(territory).length > 0);
  const to = attacks(from)[0].to;

  await tapLand(page, from);
  let s = await state(page);
  expect(s.lands[from].armies).toBe(dealt.armies[from] + 1);
  expect(s.controls).toEqual([`All ${dealt.reserve - 1} on ${TENKA_TERRITORIES[from].name}`]);
  await tap(page, '[data-testid="tk-all"]');
  game = playTenka(playTenka(game, { kind: "place", territory: from, armies: 1 }), { kind: "place", territory: from, armies: dealt.reserve - 1 });
  await expect(page.locator(ROOT)).toHaveAttribute("data-phase", "attack");
  s = await sound(page, errors);
  expect(s.status).toContain("tap a territory of yours with two armies or more to attack from");
  expect(s.controls).toEqual(["Stop attacking"]);

  await tapLand(page, from);
  s = await state(page);
  expect(s.status).toBe(`Round 1 of 20. You: attacking from ${TENKA_TERRITORIES[from].name}. Tap a neighbour to attack.`);
  expect(s.rings).toBeGreaterThan(1);
  await tapLand(page, to);
  s = await sound(page, errors);
  expect(s.status).toBe(`Round 1 of 20. You: ${TENKA_TERRITORIES[from].name} attacks ${TENKA_TERRITORIES[to].name}.`);
  expect(s.controls).toEqual(["Attack with 3 dice", "Blitz", "Stop attacking"]);

  await tap(page, '[data-testid="tk-blitz"]');
  game = playTenka(game, { kind: "blitz", from, to });
  s = await sound(page, errors);
  // The dice fall as the seed has them, here as in the rules.
  expect(s.dice).toContain(game.lastRoll.attackDice.join(""));
  expect(s.dice).toContain(`attacker lost ${game.lastRoll.attackerLost}, defender lost ${game.lastRoll.defenderLost}`);
  expect(s.phase).toBe(game.phase);
  expect(s.lands.map((land) => land.armies)).toEqual([...game.armies]);
  if (game.phase === "occupy") {
    expect(s.status).toContain(`${TENKA_TERRITORIES[to].name} is taken. How many move in?`);
    await tap(page, '[data-testid="tk-go"]');
    game = playTenka(game, { kind: "occupy", armies: game.armies[from] - 1 });
    s = await state(page);
    expect(s.lands[to].owner).toBe(0);
    expect(s.lands[to].armies).toBe(game.armies[to]);
  }
  await tap(page, '[data-testid="tk-stop"]');
  await expect(page.locator(ROOT)).toHaveAttribute("data-phase", "fortify");
  s = await sound(page, errors);
  expect(s.controls).toEqual(["End turn"]);
  await tap(page, '[data-testid="tk-end"]');
  // The computer takes its turns, and the table comes back to the first seat in round 2.
  await expect(page.locator(WAITING)).toHaveAttribute("data-to-play", "0");
  s = await sound(page, errors);
  expect(s.status).toMatch(/^Round 2 of 20\. You: (place \d+ armies|five cards or more)/);
  if (game.phase !== "occupy" && game.lastRoll.took) expect(s.players[0]).toContain("1 cards");
});

test("a fortifying move: from one of your territories to one joined to it, by the slider's number", async ({ page }) => {
  const errors = await open(page);
  let game = dealt;
  const own = game.owners.findIndex((owner) => owner === 0);
  await tapLand(page, own);
  await tap(page, '[data-testid="tk-all"]');
  await tap(page, '[data-testid="tk-stop"]');
  game = playTenka(playTenka(playTenka(game, { kind: "place", territory: own, armies: 1 }), { kind: "place", territory: own, armies: game.reserve - 1 }), { kind: "endAttack" });
  const move = tenkaMoves(game).find((one) => one.kind === "fortify");
  await tapLand(page, move.from);
  await tapLand(page, move.to);
  let s = await sound(page, errors);
  const most = game.armies[move.from] - 1;
  expect(s.controls).toEqual([`Move ${most} to ${TENKA_TERRITORIES[move.to].name}`, "End turn"]);
  await tap(page, '[data-testid="tk-go"]');
  await expect(page.locator(WAITING)).toHaveAttribute("data-to-play", "0");
  s = await sound(page, errors);
  expect(s.status).toContain("Round 2 of 20.");
});

test("each continent frames at one tap, and the world comes back", async ({ page }) => {
  const errors = await open(page);
  const world = (await state(page)).viewBox;
  expect(world).toBe("0 0 2000 984");
  const seen = new Set([world]);
  for (const view of ["northAmerica", "southAmerica", "europe", "africa", "asia", "oceania"]) {
    await look(page, view);
    const s = await sound(page, errors);
    const [, , width] = s.viewBox.split(" ").map(Number);
    expect(width, `${view} is a closer look`).toBeLessThan(2000);
    seen.add(s.viewBox);
  }
  expect(seen.size).toBe(7);
  await look(page, "world");
  expect((await state(page)).viewBox).toBe(world);
});

test("the set-up row starts the table it shows, and the other tables start theirs", async ({ page }) => {
  const errors = await open(page);
  await tap(page, '[data-players="5"]');
  await tap(page, '[data-rounds="10"]');
  await tap(page, "#new");
  await expect(page.locator('[data-testid="tk-player"]')).toHaveCount(5);
  let s = await sound(page, errors);
  expect(s.status).toContain("of 10.");

  await tap(page, '[data-try="duel"]');
  await expect(page.locator('[data-testid="tk-player"]')).toHaveCount(2);
  s = await sound(page, errors);
  // A third of the world is dealt to the neutral army; the computer may already have taken some of it.
  const neutral = s.lands.filter((land) => land.owner === -1).length;
  expect(neutral).toBeGreaterThan(7);
  expect(neutral).toBeLessThanOrEqual(14);
  await expect(page.locator('[data-players="2"]')).toHaveAttribute("aria-pressed", "true");

  await tap(page, '[data-try="pass"]');
  await expect(page.locator(WAITING)).toHaveCount(1);
  s = await sound(page, errors);
  expect(s.players.map((player) => player.slice(0, 3))).toEqual(["Ann", "Ben", "Cho"]);

  // Three computers play a whole game to its end.
  await tap(page, '[data-try="watch"]');
  await expect(page.locator(ROOT)).toHaveAttribute("data-phase", "over", { timeout: 30000 });
  s = await sound(page, errors);
  expect(s.status).toMatch(/takes the world\.$|^A tie between /);
  expect(s.controls).toEqual(["New game"]);
  await tap(page, '[data-testid="tk-new"]');
  await expect(page.locator(ROOT)).not.toHaveAttribute("data-phase", "over");
});

test("Europe is a map of its own: chosen above the table, drawn with its regions, and played", async ({ page }) => {
  const errors = await open(page);
  await tap(page, '[data-map="europe"]');
  await expect(page.locator('[data-map="europe"]')).toHaveAttribute("aria-pressed", "true");
  await tap(page, "#new");
  const s = await sound(page, errors);
  expect(s.lands).toHaveLength(37);
  // The views above the map are Europe's: the whole map and its eleven regions.
  await expect(page.locator(`${ROOT} [data-view]`)).toHaveCount(12);
  await expect(page.locator(`${ROOT} [data-view="europe"]`)).toHaveText("Europe");
  await expect(page.locator(`${ROOT} [data-view="scandinavia"]`)).toHaveText("The Nordic Countries");

  // Back to the world, it is the world's again.
  await tap(page, '[data-map="world"]');
  await tap(page, "#new");
  expect((await sound(page, errors)).lands).toHaveLength(42);
  await expect(page.locator(`${ROOT} [data-view]`)).toHaveCount(7);
});
