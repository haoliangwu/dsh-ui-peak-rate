/**
 * Whether a UTC moment falls in a DeepSeek peak-rate window.
 *
 * Peak windows: 01:00–04:00 UTC and 06:00–10:00 UTC (inclusive start,
 * exclusive end). Off-peak rates are half of peak rates.
 * @param date - the moment to test.
 * @returns true iff the date's UTC hour is in a peak window.
 */
export function isPeak(date: Date): boolean {
  const hour = date.getUTCHours()
  return (hour >= 1 && hour < 4) || (hour >= 6 && hour < 10)
}
