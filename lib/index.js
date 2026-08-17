import { Service } from "@deepseek-ai/cordis";
import z from "@deepseek-ai/schemastery";
//#region src/index.ts
/** Cordis plugin name. */
const name = "client-peak-rate";
/** Required services: none on the host side (config-only). */
const inject = [];
const Config = z.object({ providers: z.array(String).default(["deepseek-official"]) });
/** Host-side Config carrier exposing the provider list to the client half. */
var PeakRateConfigService = class extends Service {
	providers;
	/**
	* @param ctx - owning root context.
	* @param providers - the validated provider ids whose sessions may show the badge.
	*/
	constructor(ctx, providers) {
		super(ctx, "peakRateConfig");
		this.providers = providers;
	}
};
/**
* Mount the config service so the client half can read the provider list.
* @param ctx - host plugin context.
* @param config - validated {@link Config}.
*/
function apply(ctx, config) {
	ctx.plugin(PeakRateConfigService, config.providers);
}
//#endregion
export { Config, PeakRateConfigService, apply, inject, name };
