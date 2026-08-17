import z from "@deepseek-ai/schemastery";
//#region src/index.ts
/** Cordis plugin name. */
const name = "client-peak-rate";
/** Required services: the host-side Connection RPC registry. */
const inject = ["connection"];
const Config = z.object({ providers: z.array(String).default(["deepseek-official"]) });
/** RPC channel owned by this plugin. */
const CHANNEL = "/peak-rate";
/** Endpoint under {@link CHANNEL} returning the configured provider list. */
const ENDPOINT_PROVIDERS = "providers";
/**
* Mount the host RPC handler that returns the validated provider list.
* @param ctx - host plugin context carrying the Connection service.
* @param config - validated {@link Config}.
*/
function apply(ctx, config) {
	const response = { providers: config.providers };
	ctx.connection.rpc.handle(CHANNEL, (endpoint) => {
		if (endpoint === ENDPOINT_PROVIDERS) return Promise.resolve({
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
