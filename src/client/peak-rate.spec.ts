import { describe, expect, it } from 'vitest'
import { formatWindows, isPeak } from './peak-rate.ts'

const DEFAULT_WINDOWS: readonly (readonly [number, number])[] = [[1, 4], [6, 10]]

describe('isPeak', () => {
  it('is peak inside default windows', () => {
    expect(isPeak(new Date('2026-08-17T02:30:00Z'), DEFAULT_WINDOWS)).toBe(true)
    expect(isPeak(new Date('2026-08-17T08:00:00Z'), DEFAULT_WINDOWS)).toBe(true)
  })

  it('is off-peak outside default windows', () => {
    expect(isPeak(new Date('2026-08-17T00:59:00Z'), DEFAULT_WINDOWS)).toBe(false)
    expect(isPeak(new Date('2026-08-17T04:00:00Z'), DEFAULT_WINDOWS)).toBe(false)
    expect(isPeak(new Date('2026-08-17T10:00:00Z'), DEFAULT_WINDOWS)).toBe(false)
    expect(isPeak(new Date('2026-08-17T05:00:00Z'), DEFAULT_WINDOWS)).toBe(false)
  })

  it('respects non-default windows', () => {
    expect(isPeak(new Date('2026-08-17T05:00:00Z'), [[5, 6]])).toBe(true)
    expect(isPeak(new Date('2026-08-17T05:00:00Z'), DEFAULT_WINDOWS)).toBe(false)
  })

  it('is always off-peak for empty windows', () => {
    expect(isPeak(new Date('2026-08-17T02:00:00Z'), [])).toBe(false)
  })
})

describe('formatWindows', () => {
  it('formats windows zero-padded with en-dash and comma+space separators', () => {
    expect(formatWindows([[1, 4], [6, 10]])).toBe('01:00–04:00, 06:00–10:00')
  })

  it('formats empty windows as an empty string', () => {
    expect(formatWindows([])).toBe('')
  })
})