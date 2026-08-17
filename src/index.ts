/**
 * Web composer 🔥 2× peak-rate badge, node half.
 *
 * Mounts the host-plane config carrier: the `peakRateConfig` service exposes
 * the validated provider list so the browser half can decide when the badge
 * shows. The browser half (`./client`) registers one entry of the
 * `conversation.input.right` list slot.
 */
import type { Context } from '@deepseek-ai/cordis'
import { Service } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'

/** Cordis plugin name. */
export const name = 'client-peak-rate'

/** Required services: none on the host side (config-only). */
export const inject: string[] = []

/** Plugin config: providers whose active sessions may show the peak badge. */
export interface Config {
  /** Provider ids that show the peak-rate badge (default: the official DeepSeek provider). */
  providers?: string[]
}

export const Config: z<Config> = z.object({
  providers: z.array(String).default(['deepseek-official']),
})

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Configured peak-badge provider list (host-plane Config → client-plane read). */
    peakRateConfig: PeakRateConfigService
  }
}

/** Host-side Config carrier exposing the provider list to the client half. */
export class PeakRateConfigService extends Service {
  /**
   * @param ctx - owning root context.
   * @param providers - the validated provider ids whose sessions may show the badge.
   */
  constructor(ctx: Context, readonly providers: string[]) {
    super(ctx, 'peakRateConfig')
  }
}

/**
 * Mount the config service so the client half can read the provider list.
 * @param ctx - host plugin context.
 * @param config - validated {@link Config}.
 */
export function apply(ctx: Context, config: Config): void {
  ctx.plugin(PeakRateConfigService, config.providers as string[])
}
