/** `peak` namespace dictionaries. */

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'title': '高峰时段 · 费用为低峰的 2× (01:00–04:00, 06:00–10:00 UTC)',
} satisfies Record<string, string>

/** English dictionary mirroring the Chinese key set. */
export const en: Record<keyof typeof zh, string> = {
  'title': 'Peak hours · 2× off-peak rate (01:00–04:00, 06:00–10:00 UTC)',
}

/** The peak namespace key union. */
export type PeakKey = keyof typeof zh
