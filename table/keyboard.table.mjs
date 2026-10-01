// The table played from a keyboard: one place for Tab to land, arrow keys between territories,
// Enter or Space for a tap, and the keyboard left where it was when the map is drawn again.
import { expect, test } from "@playwright/test";

import { WAITING, open, sound } from "./table.mjs";

const LANDS = "#table .tk-land";
const focused = (page) => page.evaluate(() => document.activeElement?.getAttribute("data-territory") ?? null);

test("Tab lands on one territory, which is named, and arrows move to a neighbour", async ({ page }) => {
  const errors = await open(page);
  await expect(page.locator(WAITING)).toHaveCount(1);
  await expect(page.locator(`${LANDS}[tabindex="0"]`)).toHaveCount(1);
  const stop = page.locator(`${LANDS}[tabindex="0"]`);
  // One of the mover's own, named for a reader with its holder and its armies.
  await expect(stop).toHaveAttribute("data-owner", "0");
  await expect(stop).toHaveAttribute("role", "button");
  await expect(stop).toHaveAttribute("aria-label", /^.+, You, armies \d+$/);
  await expect(page.locator("#table .tk-map")).toHaveAttribute("aria-description", /Arrow keys/);

  await stop.focus();
  const first = await focused(page);
  await page.keyboard.press("ArrowRight");
  const second = await focused(page);
  expect(second).not.toBeNull();
  expect(second).not.toBe(first);
  await expect(page.locator(`${LANDS}[tabindex="0"]`)).toHaveCount(1);
  await expect(page.locator(`${LANDS}[data-territory="${second}"]`)).toHaveAttribute("tabindex", "0");
  await page.keyboard.press("ArrowLeft");
  expect(await focused(page)).not.toBeNull();
  await expect(page.locator(`${LANDS}[tabindex="0"]`)).toHaveCount(1);
  await sound(page, errors);
});

test("Enter places an army, and the keyboard is still on that territory after the map is drawn again", async ({ page }) => {
  const errors = await open(page);
  await expect(page.locator(WAITING)).toHaveCount(1);
  const own = page.locator(`${LANDS}[data-owner="0"]`).first();
  const territory = await own.getAttribute("data-territory");
  const armies = Number(await own.getAttribute("data-armies"));
  await own.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(`${LANDS}[data-territory="${territory}"]`)).toHaveAttribute("data-armies", String(armies + 1));
  expect(await focused(page)).toBe(territory);
  await page.keyboard.press(" ");
  await expect(page.locator(`${LANDS}[data-territory="${territory}"]`)).toHaveAttribute("data-armies", String(armies + 2));
  expect(await focused(page)).toBe(territory);
  await sound(page, errors);
});

test("on a continent's view the arrows stay among the territories shown", async ({ page }) => {
  await open(page);
  await page.locator('#table .tk-zoom [data-view="oceania"]').click();
  const stop = page.locator(`${LANDS}[tabindex="0"]`);
  await expect(stop).toHaveCount(1);
  await stop.focus();
  const view = await page.evaluate(() => {
    const box = document.querySelector("#table .tk-map").viewBox.baseVal;
    return [box.x, box.y, box.width, box.height];
  });
  for (const key of ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "ArrowRight", "ArrowRight"]) {
    await page.keyboard.press(key);
    const at = await page.evaluate(() => {
      const land = document.activeElement;
      const counter = document.querySelector(`#table .tk-counter[data-territory="${land.getAttribute("data-territory")}"] circle`);
      return [Number(counter.getAttribute("cx")), Number(counter.getAttribute("cy"))];
    });
    expect(at[0]).toBeGreaterThanOrEqual(view[0]);
    expect(at[0]).toBeLessThanOrEqual(view[0] + view[2]);
    expect(at[1]).toBeGreaterThanOrEqual(view[1]);
    expect(at[1]).toBeLessThanOrEqual(view[1] + view[3]);
  }
});
