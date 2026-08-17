// PeakRateBadge: the 🔥 2× pill in the composer's trailing input slot. It
// shows only while the session's current model provider is in the configured
// list AND the current UTC time is inside a peak window; it is hidden
// entirely (null) otherwise — off-peak, unknown provider, or before the host
// has reported a current selection (`state.current === null`).

import { useEffect, useState, useSyncExternalStore } from 'react'
import type { SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client'
import type { ModelDirectoryState } from '@deepseek-ai/dsh-client-ui-model-selection/client'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import { isPeak } from './peak-rate.ts'
import css from './PeakRateBadge.module.css'

/** How often the peak/off-peak window re-evaluates, in seconds. */
const REFRESH_INTERVAL_MS = 60_000

/** Injected business face plus the standard locale seat. */
export interface PeakRateBadgeProps extends PropsLocale<'peak'> {
  /** The session's shared model-directory store (the same instance ModelSelect reads). */
  directory: SnapshotStore<ModelDirectoryState>
  /** Provider ids whose sessions show the peak badge. */
  providers: readonly string[]
}

/**
 * Render the peak-rate badge, or null when off-peak / unmatched provider / no current model.
 * @param props - shared directory store, configured providers, and locale seat.
 * @returns the 🔥 2× pill, or null when the badge is hidden.
 */
export function PeakRateBadge({ directory, providers, t }: PeakRateBadgeProps) {
  const state = useSyncExternalStore(
    fn => directory.subscribe(fn),
    () => directory.getSnapshot(),
  )
  const [peak, setPeak] = useState(() => isPeak(new Date()))
  useEffect(() => {
    const id = setInterval(() => { setPeak(isPeak(new Date())) }, REFRESH_INTERVAL_MS)
    return () => { clearInterval(id) }
  }, [])
  if (state.current === null) return null
  if (!providers.includes(state.current.provider)) return null
  if (!peak) return null
  return <span className={css.badge} title={t('title')}>🔥 2×</span>
}
