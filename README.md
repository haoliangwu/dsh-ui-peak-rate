<h1 align="center">dsh-client-peak-rate</h1>

<p align="center">DSH web composer 🔥 2× peak-rate badge — shows when the session's model provider matches a configurable list during DeepSeek peak hours.</p>

A web client plugin for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). It paints a `🔥 2×` pill in the composer's trailing input row, just left of the model trigger, when **both** of these hold:

1. The session's current model provider is in the configured list (default `['deepseek-official']`).
2. The current UTC time is inside a DeepSeek peak window: `01:00–04:00 UTC` or `06:00–10:00 UTC`.

Otherwise the badge is hidden entirely — no layout cost.

## Install

```sh
dsh plugin --profile web add github:haoliangwu/dsh-client-peak-rate
```

Built `lib/` is committed, so the git install is one line — no `prepare` script, no `allowBuilds` permission. Restart `dsh --profile web` after install (bundle layer stacks compose at boot).

## Configure

The provider list defaults to `['deepseek-official']`. Override it in your profile's `cordis.patch.yml` (`~/.dsh/profiles/web/cordis.patch.yml`):

```yaml
- id: peak-rate
  config:
    providers:
      - deepseek-official
```

Disable the badge entirely:

```yaml
- id: peak-rate
  disabled: true
```

## How it works

- **Peak state is a pure client-side clock fact.** `isPeak(date)` returns true iff the UTC hour is in `{1,2,3}` or `{6,7,8,9}` (windows `01:00–04:00` and `06:00–10:00`, inclusive start, exclusive end). The component re-evaluates every 60 s through a `setInterval` cleared on unmount.
- **Provider match is a configurable list, not a hard-coded id.** The host-half `Config.providers` (schemastery, default `['deepseek-official']`) is exposed to the browser half through a `peakRateConfig` Service mounted in `apply`. The component reads the session's current provider through `ctx.modelDirectories.directoryFor(sessionId).store` (the same instance `ModelSelect` reads), subscribes via `useSyncExternalStore`, and shows the badge iff `state.current?.provider ∈ providers`.
- **No model-visible output, no session events, no durable state.** The plugin reads only the clock and the existing model-directory store. The peak schedule is a published 2026 constant; a DeepSeek schedule change requires a plugin update to `isPeak`.

## Build from source

```sh
pnpm install
pnpm build         # emits lib/index.js, lib/invariant.js, lib/client.js + sourcemaps
```

`lib/` is committed to the repo so git installs work without a build step. After changing source, run `pnpm build` and commit the updated `lib/`.

## Plugin management

Already-installed plugins can be managed through [plugin-registry](https://github.com/deepseek-harness/plugin-registry)'s thin browser console: profile install state (bundle stack + insert rows + enable/disable), no manual config edits.

```sh
dsh plugin --profile web add github:deepseek-harness/plugin-registry#main&path:/packages/plugin/console
```

## License

MIT
