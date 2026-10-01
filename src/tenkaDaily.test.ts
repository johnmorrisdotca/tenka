import { describe, expect, it } from "vitest";

import { tenkaDailySeed, tenkaDay } from "./tenkaDaily.ts";
import { isTenkaSeed, startTenka } from "./tenkaStart.ts";

describe("the day's seed", () => {
  it("is the date as a number, in UTC", () => {
    expect(tenkaDay(new Date("2026-10-01T12:00:00Z"))).toBe("2026-10-01");
    expect(tenkaDailySeed(new Date("2026-10-01T12:00:00Z"))).toBe(20261001);
    expect(tenkaDailySeed(new Date("2026-09-30T00:00:00Z"))).toBe(20260930);
  });

  it("turns at midnight UTC and not a moment before", () => {
    expect(tenkaDailySeed(new Date("2026-12-31T23:59:59.999Z"))).toBe(20261231);
    expect(tenkaDailySeed(new Date("2027-01-01T00:00:00.000Z"))).toBe(20270101);
  });

  it("is a seed a game can start from, and the same game for everybody", () => {
    const seed = tenkaDailySeed(new Date("2026-10-01T08:00:00Z"));
    expect(isTenkaSeed(seed)).toBe(true);
    const a = startTenka(10, ["Ann", "Ben", "Cho"], seed)!;
    const b = startTenka(10, ["Ann", "Ben", "Cho"], tenkaDailySeed(new Date("2026-10-01T23:00:00Z")))!;
    expect(b.owners).toEqual(a.owners);
    expect(b.armies).toEqual(a.armies);
  });

  it("refuses a moment that is not one", () => {
    expect(() => tenkaDay(new Date("nonsense"))).toThrow(RangeError);
  });
});
