/**
 * Web 🔥 2× peak-rate badge, browser half: one entry of the
 * `conversation.input.right` list slot (session scope). The badge shows in
 * the composer's trailing row, just left of the model trigger, while the
 * session's current model provider (read through the shared model directory
 * owned by ui-model-selection) is in the configured list and the UTC time is
 * inside a peak window. Export discipline: packages/client/AGENTS.md.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: pulls the ui-conversation SlotMap merge (the input.right seat).
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
// Type-only: pulls the ui-model-selection directory types + ctx.modelDirectories merge.
import type {} from '@deepseek-ai/dsh-client-ui-model-selection/client'
import { PeakRateBadge } from './PeakRateBadge.tsx'
import { en, zh, type PeakKey } from './locales.ts'

export type { PeakKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** The peak-rate badge copy. */
    peak: PeakKey
  }
}

/** Dictionary namespace owned by this plugin. */
const NS = 'peak'

/** Required services: the contribution registry, locale, the model directory, and the host Config carrier. */
export const inject = ['slots', 'locale', 'modelDirectories', 'peakRateConfig']

/**
 * Client plugin body: register the `peak` dictionaries and the composer's
 * trailing input-slot entry.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'client-peak-rate: dictionaries')

  ctx.slots.inject('conversation.input.right', () => ctx.slots.register({
    name: 'conversation.input.right',
    id: 'peak-rate',
    locale: NS,
    inject: sessionId => ({
      directory: ctx.modelDirectories.directoryFor(sessionId).store,
      providers: ctx.peakRateConfig.providers,
    }),
  }, PeakRateBadge))
}
