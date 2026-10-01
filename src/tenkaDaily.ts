/**
 * ONE SEED A DAY, THE SAME FOR EVERYBODY. A day is a calendar date in UTC and
 * its seed is that date as a number: 2026-10-01 is 20261001, which is a seed
 * `startTenka` accepts. It is the same number Tane's `dailySeed` gives, so a
 * page that uses both agrees; nothing here needs Tane.
 *
 * Everybody who starts a game from the day's seed, with the same players and
 * length, is dealt the same map. What they do with it is their own.
 */

const pad = (value: number, width: number): string => String(value).padStart(width, "0");

/** The day a moment falls on, in UTC, written `YYYY-MM-DD`. Throws a `RangeError` for an invalid `Date`. */
export function tenkaDay(at: Date): string {
  if (Number.isNaN(at.getTime())) throw new RangeError("tenka: an invalid Date has no day");
  return `${pad(at.getUTCFullYear(), 4)}-${pad(at.getUTCMonth() + 1, 2)}-${pad(at.getUTCDate(), 2)}`;
}

/** Today's seed, the date as a number: 2026-10-01 is 20261001. The day is UTC, so it is one seed worldwide. */
export function tenkaDailySeed(at: Date): number {
  const [year, month, day] = tenkaDay(at).split("-").map(Number) as [number, number, number];
  return year * 10_000 + month * 100 + day;
}
