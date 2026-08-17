/**
 * Web composer 🔥 2× peak-rate badge, node half.
 *
 * Mounts the host-plane Config carrier as a Connection RPC channel: the
 * browser half reads the validated provider list, peak windows, and multiplier
 * through `ctx.connection.rpc.call('/peak-rate', 'config', {})`. There is no
 * in-process Service shared across the host/browser boundary — the only
 * transport is the Connection RPC channel.
 */
import type { Context } from '@deepseek-ai/cordis'
import type { RpcResult } from '@deepseek-ai/dsh-host-apiproxy/api'
import z from '@deepseek-ai/schemastery'

/** Cordis plugin name. */
export const name = 'client-ui-peak-rate'

/** Required services: the host-side Connection RPC registry. */
export const inject = ['connection']

/** Plugin config: providers, peak windows, and multiplier for the peak badge. */
export interface Config {
  /** Provider ids that show the peak-rate badge (default: the official DeepSeek provider). */
  providers?: string[]
  /** Peak windows `[startHour, endHour)` UTC, left-closed right-open (default: [[1,4],[6,10]]). */
  peakWindows?: (readonly [number, number])[]
  /** Peak-rate multiplier vs off-peak rate (default: 2). */
  multiplier?: number
}

export const Config = z.object({
  providers: z.array(String).default(['deepseek-official']),
  peakWindows: z.transform(
    z.array(z.tuple([Number, Number])),
    (windows, options) => {
      const typed = windows as [number, number][]
      for (const [start, end] of typed) {
        if (!(start >= 0 && start < end && end <= 24)) {
          throw new z.ValidationError(`peak window [${start},${end}] must satisfy 0 <= start < end <= 24`, options)
        }
      }
      return typed
    },
  ).default([[1, 4], [6, 10]]),
  multiplier: z.number().default(2),
})

/** Response payload for the `config` endpoint. */
interface ConfigResponse {
  readonly providers: readonly string[]
  readonly peakWindows: readonly (readonly [number, number])[]
  readonly multiplier: number
}

/** RPC channel owned by this plugin. */
const CHANNEL = '/peak-rate'

/** Endpoint under {@link CHANNEL} returning the configured peak-rate policy. */
const ENDPOINT_CONFIG = 'config'

/**
 * Mount the host RPC handler that returns the validated peak-rate policy.
 * @param ctx - host plugin context carrying the Connection service.
 * @param config - validated {@link Config}.
 */
export function apply(ctx: Context, config: Config): void {
  const response: ConfigResponse = {
    providers: config.providers as string[],
    peakWindows: config.peakWindows as (readonly [number, number])[],
    multiplier: config.multiplier as number,
  }
  ctx.connection.rpc.handle(
    CHANNEL,
    (endpoint): Promise<RpcResult<ConfigResponse>> => {
      if (endpoint === ENDPOINT_CONFIG) {
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