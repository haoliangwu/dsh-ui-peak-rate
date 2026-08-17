window.__ModuleLoader__.load({
	id: "dsh-client-peak-rate",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/peak-rate.ts
		/**
		* Whether a UTC moment falls in a DeepSeek peak-rate window.
		*
		* Peak windows: 01:00–04:00 UTC and 06:00–10:00 UTC (inclusive start,
		* exclusive end). Off-peak rates are half of peak rates.
		* @param date - the moment to test.
		* @returns true iff the date's UTC hour is in a peak window.
		*/
		function isPeak(date) {
			const hour = date.getUTCHours();
			return hour >= 1 && hour < 4 || hour >= 6 && hour < 10;
		}
		//#endregion
		//#region \0dsh-css:/Users/haoliang.wu/lyon/learn/dsh/dsh-client-peak-rate/src/client/PeakRateBadge.module.css.mjs
		const css = ".RGcx4W_badge{background:var(--dsw-alias-state-warn-tertiary);color:var(--dsw-alias-state-warn-label);white-space:nowrap;cursor:default;user-select:none;border-radius:999px;flex:none;align-items:center;gap:4px;padding:2px 8px;font-size:13px;font-weight:500;line-height:20px;display:inline-flex}";
		const tagId = "dsh-client-peak-rate/PeakRateBadge.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-client-peak-rate";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var PeakRateBadge_module_css_default = { "badge": "RGcx4W_badge" };
		//#endregion
		//#region src/client/PeakRateBadge.tsx
		/** How often the peak/off-peak window re-evaluates, in seconds. */
		const REFRESH_INTERVAL_MS = 6e4;
		/**
		* Render the peak-rate badge, or null when off-peak / unmatched provider / no current model.
		* @param props - shared directory store, configured providers, and locale seat.
		* @returns the 🔥 2× pill, or null when the badge is hidden.
		*/
		function PeakRateBadge({ directory, providers, t }) {
			const state = (0, react.useSyncExternalStore)((fn) => directory.subscribe(fn), () => directory.getSnapshot());
			const [peak, setPeak] = (0, react.useState)(() => isPeak(/* @__PURE__ */ new Date()));
			(0, react.useEffect)(() => {
				const id = setInterval(() => {
					setPeak(isPeak(/* @__PURE__ */ new Date()));
				}, REFRESH_INTERVAL_MS);
				return () => {
					clearInterval(id);
				};
			}, []);
			if (state.current === null) return null;
			if (!providers.includes(state.current.provider)) return null;
			if (!peak) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: PeakRateBadge_module_css_default.badge,
				title: t("title"),
				children: "🔥 2×"
			});
		}
		//#endregion
		//#region src/client/locales.ts
		/** `peak` namespace dictionaries. */
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = { "title": "高峰时段 · 费用为低峰的 2× (01:00–04:00, 06:00–10:00 UTC)" };
		/** English dictionary mirroring the Chinese key set. */
		const en = { "title": "Peak hours · 2× off-peak rate (01:00–04:00, 06:00–10:00 UTC)" };
		//#endregion
		//#region src/client/index.ts
		/** Dictionary namespace owned by this plugin. */
		const NS = "peak";
		/** Required services: the contribution registry, locale, the model directory, and the host Config carrier. */
		const inject = [
			"slots",
			"locale",
			"modelDirectories",
			"peakRateConfig"
		];
		/**
		* Client plugin body: register the `peak` dictionaries and the composer's
		* trailing input-slot entry.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "client-peak-rate: dictionaries");
			ctx.slots.inject("conversation.input.right", () => ctx.slots.register({
				name: "conversation.input.right",
				id: "peak-rate",
				locale: NS,
				inject: (sessionId) => ({
					directory: ctx.modelDirectories.directoryFor(sessionId).store,
					providers: ctx.peakRateConfig.providers
				})
			}, PeakRateBadge));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map