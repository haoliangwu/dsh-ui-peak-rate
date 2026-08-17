/**
 * Whether a UTC moment falls in a peak-rate window.
 *
 * Windows are `[startHour, endHour)` UTC hour pairs, left-closed right-open.
 * An empty window list is always off-peak.
 * @param date - the moment to test.
 * @param windows - peak windows as `[startHour, endHour)` UTC hour pairs.
 * @returns true iff the date's UTC hour is in a peak window.
 */
export function isPeak(date: Date, windows: ReadonlyArray<readonly [number, number]>): boolean {
  const hour = date.getUTCHours()
  return windows.some(([start, end]) => hour >= start && hour < end)
}

/**
 * Format peak windows as a locale-independent string, e.g. `01:00–04:00, 06:00–10:00`.
 * @param windows - peak windows as `[startHour, endHour)` UTC hour pairs.
 * @returns two-digit zero-padded `HH:00–HH:00` pairs joined by `, `.
 */
export function formatWindows(windows: ReadonlyArray<readonly [number, number]>): string {
  const pad = (n: number): string => n.toString().padStart(2, '0')
  return windows.map(([start, end]) => `${pad(start)}:00–${pad(end)}:00`).join(', ')
}