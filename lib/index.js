//#region src/index.ts
/**
* Web composer 🔥 2× peak-rate badge, node half.
*
* Pure UI plugin: the empty `apply` exists so the plugin appears in the host
* cordis.yml / Loader; the browser half ships via exports["./client"],
* discovered through the package.json `dsh.client` declaration. The peak
* window and provider list are hardcoded in the client half (see ./client) —
* there is no host-side Config carrier, because no transport carries host
* config into the browser context.
*/
/** Cordis plugin name. */
const name = "client-peak-rate";
/** Required services: none on the host side (UI-only plugin). */
const inject = [];
/** Host plugin body — no host-side behavior for this source plugin. */
function apply() {}
//#endregion
export { apply, inject, name };
