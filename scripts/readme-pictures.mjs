// Takes the pictures the README shows, from the built demo in `site/`: `pnpm screenshots:readme` (builds the demo, then runs this).
// The family's standard is in johnmorrisdotca/.github (README-STANDARD.md); the shared part is readme-pictures-lib.mjs.
// The page is served to a browser without a port, never fetched from the live site, and is the same each run: the deal is a
// seed (`?seed=`), the computers move at once (`?delay=0`) and motion is reduced. Output: docs/images/<subject>-<desk|phone>-<light|dark>.webp.
import { takePictures } from "./readme-pictures-lib.mjs";

import { playTenka, startTenka, tenkaFromJSON, tenkaMoves } from "../dist/index.js";

const TABLE = '#table [data-testid="tk-root"]';
const url = (lang = "en") => `/?seed=7&delay=0&lang=${lang}`;
const waiting = `${TABLE}[data-waiting="true"]`;

/** A game of three from seed 7, a few moves in: armies on one territory, and an attack chosen from it; the record opened. */
const played = (europe = false) => async (page) => {
  const own = await page.locator('#table .tk-land[data-owner="0"]').first().getAttribute("data-territory");
  await page.locator(`#table .tk-counter[data-territory="${own}"]`).click({ force: true });
  await page.locator('#table [data-testid="tk-all"]').click();
  await page.locator(`#table .tk-counter[data-territory="${own}"]`).click({ force: true });
  await page.locator('#table [data-testid="tk-record"] summary').click();
  await page.waitForFunction(() => document.querySelector('#table [data-testid="tk-log"]').textContent !== "");
  if (europe) await page.locator('#table .tk-zoom [data-view="europe"]').click();
};

/** The table dressed: round one taken (a territory won, so a card in hand), and in round two an attack thrown. */
const dressed = async (page) => {
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
  await attack();
  if (await page.locator('#table [data-testid="tk-go"]').count()) await page.locator('#table [data-testid="tk-go"]').click();
  await page.locator('#table [data-testid="tk-stop"]').click();
  await page.locator('#table [data-testid="tk-end"]').click();
  await page.waitForSelector(`${TABLE}[data-waiting="true"][data-to-play="0"][data-phase="reinforce"]`);
  await attack();
};

/** One part of the table, cropped. */
const part = (subject, target, prepare, lang = "en") => ({ subject, views: ["desk"], scale: 1, url: url(lang), ready: waiting, target, prepare });

await takePictures({
  shots: [
    // From the top of the page, so the header, the language chooser and the cloth patches show: the world, an attack begun. On a phone,
    // in Japanese, Europe close up, scrolled to the zoom buttons above the map.
    {
      subject: "hero",
      views: ["desk", "phone"],
      height: 900,
      url: url(),
      ready: waiting,
      async prepare(page, { view }) {
        if (view === "phone") {
          await page.goto(`http://tenka.test${url("ja")}`);
          await page.waitForSelector(waiting);
          await played(true)(page);
          await page.locator("#table .tk-zoom").evaluate((element) => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 16));
        } else {
          await played()(page);
          await page.evaluate(() => window.scrollTo(0, 0));
        }
      },
    },
    part("world", "#table .tk-board", played()),
    part("europe", "#table .tk-board", played(true)),
    part("asia", "#table .tk-board", async (page) => { await played()(page); await page.locator('#table .tk-zoom [data-view="asia"]').click(); }),
    part("dressed-with-dice-and-cards", "#table", dressed),
    part("record", '#table [data-testid="tk-record"]', played()),
    part("players", "#table .tk-players", played()),
  ],
});
