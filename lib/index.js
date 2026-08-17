import z from "@deepseek-ai/schemastery";
//#region src/index.ts
/** Cordis plugin name. */
const name = "client-ui-peak-rate";
/** Required services: the host-side Connection RPC registry. */
const inject = ["connection"];
const Config = z.object({
	providers: z.array(String).default(["deepseek-official"]),
	peakWindows: z.transform(z.array(z.tuple([Number, Number])), (windows, options) => {
		const typed = windows;
		for (const [start, end] of typed) if (!(start >= 0 && start < end && end <= 24)) throw new z.ValidationError(`peak window [${start},${end}] must satisfy 0 <= start < end <= 24`, options);
		return typed;
	}).default([[1, 4], [6, 10]]),
	multiplier: z.number().default(2)
});
/** RPC channel owned by this plugin. */
const CHANNEL = "/peak-rate";
/** Endpoint under {@link CHANNEL} returning the configured peak-rate policy. */
const ENDPOINT_CONFIG = "config";
/**
* Mount the host RPC handler that returns the validated peak-rate policy.
* @param ctx - host plugin context carrying the Connection service.
* @param config - validated {@link Config}.
*/
function apply(ctx, config) {
	const response = {
		providers: config.providers,
		peakWindows: config.peakWindows,
		multiplier: config.multiplier
	};
	ctx.connection.rpc.handle(CHANNEL, (endpoint) => {
		if (endpoint === ENDPOINT_CONFIG) return Promise.resolve({
			ok: true,
			value: response
		});
		return Promise.resolve({
			ok: false,
			error: {
				code: "internal",
				message: `unknown endpoint ${endpoint}`,
				details: {}
			}
		});
	}, { authority: "loopback" });
}
//#endregion
export { Config, apply, inject, name };
