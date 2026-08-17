/**
 * Web 🔥 2× peak-rate badge, browser half: one entry of the
 * `conversation.input.right` list slot (session scope). The badge shows in
 * the composer's trailing row, just left of the model trigger, while the
 * session's current model provider (read through the shared model directory
 * owned by ui-model-selection) is in the configured provider list and the
 * UTC time is inside a peak window. Export discipline: packages/client/AGENTS.md.
 *
 * The provider list is fetched once from the host half through the Connection
 * RPC channel `/peak-rate` endpoint `providers` (host reads schemastery Config
 * from the profile's cordis.patch.yml). The list arrives asynchronously; the
 * badge stays hidden until the fetch settles, then re-renders when it does.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: pulls the ui-conversation SlotMap merge (the input.right seat).
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
// Type-only: pulls the ui-model-selection directory types + ctx.modelDirectories merge.
import type {} from '@deepseek-ai/dsh-client-ui-model-selection/client'
import type { RpcResult } from '@deepseek-ai/dsh-host-apiproxy/api'
import { PeakRateBadge, type ProvidersSource } from './PeakRateBadge.tsx'
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

/** RPC channel owned by the host half of this plugin. */
const CHANNEL = '/peak-rate'

/** Endpoint under {@link CHANNEL} returning the configured provider list. */
const ENDPOINT_PROVIDERS = 'providers'

/** Host response payload for {@link ENDPOINT_PROVIDERS}. */
interface ProvidersResponse {
  readonly providers: readonly string[]
}

/** Required services: the contribution registry, locale, the model directory, and the Connection RPC carrier. */
export const inject = ['slots', 'locale', 'modelDirectories', 'connection']

/**
 * Client plugin body: register the `peak` dictionaries and the composer's
 * trailing input-slot entry. Fetch the configured provider list once from the
 * host half through the Connection RPC channel; the badge stays hidden until
 * the fetch settles.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'client-ui-peak-rate: dictionaries')

  // Reactive provider list: empty until the host RPC settles, then published
  // once. The badge component subscribes through useSyncExternalStore.
  let providers: readonly string[] = []
  const listeners = new Set<() => void>()
  const providersSource: ProvidersSource = {
    getSnapshot: () => providers,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
  }
  const publish = (next: readonly string[]): void => {
    if (Object.is(next, providers)) return
    providers = next
    for (const listener of [...listeners]) listener()
  }

  ctx.effect(async () => {
    const result = await ctx.connection.rpc.call(CHANNEL, ENDPOINT_PROVIDERS, {}) as RpcResult<ProvidersResponse>
    if (result.ok) publish(result.value.providers)
  }, 'client-ui-peak-rate: fetch providers')

  ctx.slots.inject('conversation.input.right', () => ctx.slots.register({
    name: 'conversation.input.right',
    id: 'dsh-ui-peak-rate',
    locale: NS,
    inject: sessionId => ({
      directory: ctx.modelDirectories.directoryFor(sessionId).store,
      providers: providersSource,
    }),
  }, PeakRateBadge))
}
