// The table dressed in Korokoro's dice and Toranpu's cards (the demo's own table), tapped as a person taps it. What is on
// the dice and in the hand is checked against the game the page keeps, read back through the rules, so a picture that
// showed another number or another territory would fail here whatever it looked like.
import { expect, test } from "@playwright/test";

import { TENKA_STRINGS, TENKA_TERRITORIES, playTenka, startTenka, tenkaFromJSON, tenkaMoves, territoryNameIn } from "../dist/index.js";
import { TENKA_SHAPES } from "../dist/shapes.js";
import { ROOT, WAITING, open, sound, state, tap, tapLand } from "./table.mjs";

const dealt = startTenka(20, ["You", "Kaze", "Yama"], 7);
const KEPT = "tenka.page.game";

/** The game the page has kept, read back through the rules: exactly what the table is showing. */
async function kept(page) {
  const saved = await page.evaluate((key) => localStorage.getItem(key), KEPT);
  return tenkaFromJSON(JSON.stringify(JSON.parse(saved).game));
}

/** The first blitz the rules offer from the seed's deal, once every new army is on its territory. */
function planned() {
  const attacks = (from) => tenkaMoves(playTenka(dealt, { kind: "place", territory: from, armies: dealt.reserve })).filter((move) => move.kind === "blitz" && move.from === from);
  const from = dealt.owners.findIndex((owner, territory) => owner === 0 && attacks(territory).length > 0);
  return { from, to: attacks(from)[0].to };
}

/** Place the armies, choose the attack and blitz it. */
async function blitz(page) {
  const { from, to } = planned();
  await tapLand(page, from);
  await tap(page, '#table [data-testid="tk-all"]');
  await expect(page.locator(ROOT)).toHaveAttribute("data-phase", "attack");
  await tapLand(page, from);
  await tapLand(page, to);
  await tap(page, '#table [data-testid="tk-blitz"]');
  return { from, to };
}

/** Finish the turn: move in if asked, stop attacking, end the turn, and wait for the table to come back to the person. */
async function endTurn(page) {
  if ((await state(page)).phase === "occupy") await tap(page, '#table [data-testid="tk-go"]');
  await tap(page, '#table [data-testid="tk-stop"]');
  await tap(page, '#table [data-testid="tk-end"]');
  await expect(page.locator(WAITING)).toHaveAttribute("data-to-play", "0");
}

test("the dice are Korokoro's, and show the numbers the game threw", async ({ page }) => {
  const errors = await open(page);
  await blitz(page);
  const game = await kept(page);
  const roll = game.lastRoll;
  const s = await sound(page, errors);
  expect(s.faces).toEqual({ attack: [...roll.attackDice], defend: [...roll.defendDice] });
  // Each is a die of Korokoro's, a picture of the face that came up, with its pips: one for a one, six for a six.
  const dice = page.locator("#table .tk-die");
  await expect(dice).toHaveCount(roll.attackDice.length + roll.defendDice.length);
  const shown = await dice.evaluateAll((all) => all.map((die) => ({ face: Number(die.dataset.face), pips: die.querySelectorAll("[class*='kk-pip']").length, korokoro: die.querySelector(".kk-root") !== null, label: die.getAttribute("aria-label"), role: die.getAttribute("role"), inert: die.querySelector(".kk-root")?.closest("[inert]") !== null })));
  const thrown = [...roll.attackDice, ...roll.defendDice];
  expect(shown.map((one) => one.face)).toEqual(thrown);
  for (const die of shown) {
    expect(die.korokoro).toBe(true);
    expect(die.pips).toBe(die.face);
    expect(die.role).toBe("img");
    expect(die.inert).toBe(true);
  }
  expect(shown.slice(0, roll.attackDice.length).map((one) => one.label)).toEqual(roll.attackDice.map((face) => `Attacker's die: ${face}`));
  expect(shown.slice(roll.attackDice.length).map((one) => one.label)).toEqual(roll.defendDice.map((face) => `Defender's die: ${face}`));
  // The line still says it in words, and the table is no wider than the screen.
  expect(s.dice).toContain(`attacker lost ${roll.attackerLost}, defender lost ${roll.defenderLost}`);
});

test("the cards in hand are Toranpu's, each its own territory with its own symbol, and the deck is Tenka's back", async ({ page }) => {
  const errors = await open(page);
  await blitz(page);
  await endTurn(page);
  const game = await kept(page);
  const hand = game.hands[0];
  expect(hand.length).toBeGreaterThan(0);
  const cards = page.locator("#table .tk-hand .tk-card");
  await expect(cards).toHaveCount(hand.length);
  const shown = await cards.evaluateAll((all) =>
    all.map((card) => {
      const svg = card.querySelector("svg");
      return { card: Number(card.dataset.card), territory: card.dataset.territory === undefined ? null : Number(card.dataset.territory), label: card.getAttribute("aria-label"), path: svg?.querySelector("svg path")?.getAttribute("d") ?? null, name: svg === null ? null : [...svg.querySelectorAll(":scope > g > text[font-weight='700']")].slice(0, 2).map((text) => text.textContent).join(" "), width: card.getBoundingClientRect().width, height: card.getBoundingClientRect().height };
    }),
  );
  expect(shown.map((one) => one.card)).toEqual([...hand]);
  for (const one of shown) {
    if (one.territory === null) continue;
    expect(one.path, "the card draws the territory's own outline").toBe(TENKA_SHAPES.outlines[one.territory]);
    expect(one.name).toBe(TENKA_TERRITORIES[one.territory].name);
    expect(one.label).toContain(TENKA_TERRITORIES[one.territory].name);
    // A playing card's proportions.
    expect(one.height / one.width).toBeCloseTo(1.4, 1);
  }
  // The deck, face down, with how many are left in it.
  await expect(page.locator('#table [data-testid="tk-pile"]')).toContainText(`Deck: ${game.deck.length}`);
  await expect(page.locator('#table [data-testid="tk-pile"] svg')).toHaveCount(1);
  const s = await sound(page, errors);
  expect(s.players[0]).toContain(`${hand.length} cards`);

  // In Japanese the cards are named in Japanese.
  await tap(page, '[data-lang="ja"]');
  const words = TENKA_STRINGS.ja;
  const territory = shown.find((one) => one.territory !== null).territory;
  await expect(page.locator(`#table .tk-card[data-territory="${territory}"] svg > g > text[font-weight='700']`).first()).toHaveText(territoryNameIn(words, TENKA_TERRITORIES[territory].key));
  await expect(page.locator('#table [data-testid="tk-pile"]')).toContainText(`山札：${game.deck.length}枚`);
  await sound(page, errors);
});

test("the dice and the cards are only drawn: the same taps make the same game dressed or plain", async ({ page }) => {
  const games = {};
  for (const query of ["?seed=7&delay=0&lang=en", "?seed=7&delay=0&lang=en&dressing=off"]) {
    const errors = await open(page, query);
    await blitz(page);
    games[query] = await kept(page);
    await sound(page, errors);
    // Plain, a die is its number in a square; dressed, a picture. Either way the die carries its face.
    const plain = query.includes("dressing=off");
    await expect(page.locator("#table .tk-die").first()).toHaveText(plain ? /^[1-6]$/ : "");
    await expect(page.locator("#table .tk-die .kk-root")).toHaveCount(plain ? 0 : games[query].lastRoll.attackDice.length + games[query].lastRoll.defendDice.length);
  }
  const [dressed, plain] = Object.values(games);
  expect(dressed.moves).toEqual(plain.moves);
  expect(dressed.rng).toBe(plain.rng);
  expect([...dressed.lastRoll.attackDice]).toEqual([...plain.lastRoll.attackDice]);
  expect([...dressed.armies]).toEqual([...plain.armies]);
});

test("a table that cannot load Korokoro and Toranpu is left with the plain dice and cards", async ({ page }) => {
  const errors = await open(page, "?seed=7&delay=0&lang=en", 42, ["/vendor/"]);
  await blitz(page);
  await expect(page.locator("#table .tk-die").first()).toHaveText(/^[1-6]$/);
  await expect(page.locator("#table .tk-die .kk-root")).toHaveCount(0);
  // The page complained of the files it could not fetch, and of nothing else.
  expect(errors.every((error) => /vendor|Failed to load resource|404/.test(error))).toBe(true);
  expect((await state(page)).faces.attack.length).toBeGreaterThan(0);
});

test.describe("with motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("a throw tumbles onto the faces the game threw, once, and the dice are pictures when they have landed", async ({ page }) => {
    const errors = await open(page);
    await blitz(page);
    const game = await kept(page);
    const roll = game.lastRoll;
    const tumbling = page.locator('#table [data-testid="kk-solo-die"][data-rolling="true"]');
    await expect(tumbling.first()).toBeVisible();
    // It is a picture of a throw, not a button to press.
    expect(await page.locator("#table .tk-die button:not([disabled])").evaluateAll((all) => all.filter((one) => one.closest("[inert]") === null).length)).toBe(0);
    await expect(tumbling).toHaveCount(0);
    expect((await state(page)).faces).toEqual({ attack: [...roll.attackDice], defend: [...roll.defendDice] });
    await expect(page.locator("#table .tk-die button")).toHaveCount(0, { timeout: 3000 });
    // Drawing the table again for a tap that throws nothing does not throw the dice again.
    const { from } = planned();
    await tapLand(page, from);
    expect(await page.locator('#table [data-rolling="true"]').count()).toBe(0);
    await sound(page, errors);
  });
});
