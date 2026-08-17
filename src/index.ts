/**
 * Web composer 🔥 2× peak-rate badge, node half.
 *
 * Mounts the host-plane Config carrier as a Connection RPC channel: the
 * browser half reads the validated provider list through
 * `ctx.connection.rpc.call('/peak-rate', 'providers', {})`. There is no
 * in-process Service shared across the host/browser boundary — the only
 * transport is the Connection RPC channel.
 */
import type { Context } from '@deepseek-ai/cordis'
import type { RpcResult } from '@deepseek-ai/dsh-host-apiproxy/api'
import z from '@deepseek-ai/schemastery'

/** Cordis plugin name. */
export const name = 'client-peak-rate'

/** Required services: the host-side Connection RPC registry. */
export const inject = ['connection']

/** Plugin config: providers whose active sessions may show the peak badge. */
export interface Config {
  /** Provider ids that show the peak-rate badge (default: the official DeepSeek provider). */
  providers?: string[]
}

export const Config: z<Config> = z.object({
  providers: z.array(String).default(['deepseek-official']),
})

/** Response payload for the `providers` endpoint. */
interface ProvidersResponse {
  readonly providers: readonly string[]
}

/** RPC channel owned by this plugin. */
const CHANNEL = '/peak-rate'

/** Endpoint under {@link CHANNEL} returning the configured provider list. */
const ENDPOINT_PROVIDERS = 'providers'

/**
 * Mount the host RPC handler that returns the validated provider list.
 * @param ctx - host plugin context carrying the Connection service.
 * @param config - validated {@link Config}.
 */
export function apply(ctx: Context, config: Config): void {
  const providers = config.providers as string[]
  const response: ProvidersResponse = { providers }
  ctx.connection.rpc.handle(
    CHANNEL,
    (endpoint): Promise<RpcResult<ProvidersResponse>> => {
      if (endpoint === ENDPOINT_PROVIDERS) {
        return Promise.resolve({ ok: true, value: response })
      }
      return Promise.resolve({
        ok: false,
        error: { code: 'internal', message: `unknown endpoint ${endpoint}`, details: {} },
      })
    },
    { authority: 'loopback' },
  )
}
