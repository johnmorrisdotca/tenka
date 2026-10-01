// Pictures of the demo for a person to look at: `node table/shots.mjs <folder> <name>`. Not a test.
// 390px and 1280px, light and dark, English and Japanese, a few moves into the seeded game.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

const site = join(dirname(fileURLToPath(import.meta.url)), "..", "site");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };
const [folder = ".", name = "tenka"] = process.argv.slice(2);
const browser = await chromium.launch();
for (const width of [390, 1280]) {
  for (const colorScheme of ["light", "dark"]) {
    for (const lang of ["en", "ja"]) {
      const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, colorScheme, deviceScaleFactor: 2, reducedMotion: "reduce" });
      const page = await context.newPage();
      await page.route("http://tenka.test/**", (route) => {
        const { pathname } = new URL(route.request().url());
        const file = join(site, pathname === "/" ? "index.html" : pathname);
        return existsSync(file) ? route.fulfill({ body: readFileSync(file), contentType: TYPES[file.slice(file.lastIndexOf("."))] ?? "application/octet-stream" }) : route.fulfill({ status: 404, body: "" });
      });
      await page.goto(`http://tenka.test/?seed=7&delay=0&lang=${lang}`);
      await page.waitForSelector('#table [data-testid="tk-root"][data-waiting="true"]');
      // A turn's armies on one territory, and an attack chosen from it, so that the rings, the buttons and the record all show.
      const own = await page.locator('#table .tk-land[data-owner="0"]').first().getAttribute("data-territory");
      await page.locator(`#table .tk-counter[data-territory="${own}"]`).click({ force: true });
      await page.locator('#table [data-testid="tk-all"]').click();
      await page.locator(`#table .tk-counter[data-territory="${own}"]`).click({ force: true });
      await page.locator('#table [data-testid="tk-record"] summary').click();
      await page.waitForFunction(() => document.querySelector('#table [data-testid="tk-log"]').textContent !== "");
      await page.screenshot({ path: join(folder, `${name}-${width}-${colorScheme}-${lang}.png`), fullPage: true });
      if (width === 390 && lang === "en") {
        await page.locator('#table .tk-zoom [data-view="europe"]').click();
        await page.locator('#table [data-testid="tk-board"]').scrollIntoViewIfNeeded();
        await page.screenshot({ path: join(folder, `${name}-${width}-${colorScheme}-europe.png`) });
      }
      await context.close();
    }
  }
}
await browser.close();
