// PeakRateBadge: the 🔥 {multiplier}× pill in the composer's trailing input
// slot. It shows only while the session's current model selection matches the
// DeepSeek peak-rate policy AND the current UTC time is inside a peak window;
// it is hidden entirely (null) otherwise — off-peak, unmatched selection, or
// before the host has reported a current selection (`state.current === null`).
//
// Match rule: provider is in the configured list (host RPC) AND the model id
// contains "deepseek" (case-insensitive). Both conditions must hold; the
// model-id check narrows the provider list so a non-DeepSeek model routed
// through a listed provider does not trigger the badge.

import { useEffect, useState, useSyncExternalStore } from 'react'
import type { SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client'
import type { ModelDirectoryState } from '@deepseek-ai/dsh-client-ui-model-selection/client'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import { formatWindows, isPeak } from './peak-rate.ts'
import css from './PeakRateBadge.module.css'

/** How often the peak/off-peak window re-evaluates, in milliseconds. */
const REFRESH_INTERVAL_MS = 60_000

/** Lowercased substring a model id must contain to match the DeepSeek peak-rate policy on its own. */
const MODEL_ID_MARKER = 'deepseek'

/** Validated peak-rate policy published by the host half. */
export interface PluginConfig {
  readonly providers: readonly string[]
  readonly peakWindows: readonly (readonly [number, number])[]
  readonly multiplier: number
}

/**
 * Reactive source for the configured peak-rate policy. Empty until the host
 * RPC settles, then published once. The badge stays hidden while the policy
 * is empty (no provider match is possible and the model-id fallback has not
 * yet been counter-checked against a settled "no, the host really returned
 * nothing" state — but the model-id fallback below makes the badge
 * independent of the RPC settling for any selection whose model id already
 * contains "deepseek").
 */
export interface ConfigSource {
  /** Latest policy; empty until the host RPC settles. */
  getSnapshot(): PluginConfig
  /** Subscribe to policy replacement. */
  subscribe(listener: () => void): () => void
}

/** Injected business face plus the standard locale seat. */
export interface PeakRateBadgeProps extends PropsLocale<'peak'> {
  /** The session's shared model-directory store (the same instance ModelSelect reads). */
  directory: SnapshotStore<ModelDirectoryState>
  /** Reactive source for the configured peak-rate policy. */
  config: ConfigSource
}

/**
 * Render the peak-rate badge, or null when off-peak / unmatched selection / no current model.
 * @param props - shared directory store, config source, and locale seat.
 * @returns the 🔥 {multiplier}× pill, or null when the badge is hidden.
 */
export function PeakRateBadge({ directory, config, t }: PeakRateBadgeProps) {
  const state = useSyncExternalStore(
    fn => directory.subscribe(fn),
    () => directory.getSnapshot(),
  )
  const policy = useSyncExternalStore(
    fn => config.subscribe(fn),
    () => config.getSnapshot(),
  )
  const [peak, setPeak] = useState(() => isPeak(new Date(), policy.peakWindows))
  useEffect(() => {
    setPeak(isPeak(new Date(), policy.peakWindows))
    const id = setInterval(() => { setPeak(isPeak(new Date(), policy.peakWindows)) }, REFRESH_INTERVAL_MS)
    return () => { clearInterval(id) }
  }, [policy.peakWindows])
  if (state.current === null) return null
  const { provider, model } = state.current
  const providerMatch = policy.providers.includes(provider)
  const modelMatch = model.toLowerCase().includes(MODEL_ID_MARKER)
  if (!(providerMatch && modelMatch)) return null
  if (!peak) return null
  return (
    <span
      className={css.badge}
      title={t('title', { multiplier: policy.multiplier, windows: formatWindows(policy.peakWindows) })}
    >
      {t('badge', { multiplier: policy.multiplier })}
    </span>
  )
}