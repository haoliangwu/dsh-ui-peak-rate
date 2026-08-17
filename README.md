<h1 align="center">dsh-client-peak-rate</h1>

<p align="center">DSH web composer 🔥 2× peak-rate badge — shows when the session's model selection matches a DeepSeek peak-rate route during DeepSeek peak hours.</p>

<p align="center"><img src="docs/peak-rate-badge.png" alt="Peak-rate badge in the composer trailing row" width="640"></p>

A web client plugin for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). It paints a `🔥 2×` pill in the composer's trailing input row, just left of the model trigger, when **both** of these hold:

1. The session's current model selection matches the DeepSeek peak-rate policy (see [Match rule](#match-rule)).
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

The host half reads `Config.providers` (schemastery) and exposes it to the browser half through a Connection RPC channel (`/peak-rate` endpoint `providers`). No transport carries host plugin Config into the browser context automatically; the RPC channel is the explicit transport.

## Match rule

The badge shows when the session's current model selection satisfies **both** of:

- `state.current.provider ∈ Config.providers` (provider match, default `['deepseek-official']`), AND
- `state.current.model` contains `deepseek` (case-insensitive).

The model-id check narrows the provider list so a non-DeepSeek model routed through a listed provider does not trigger the badge. To match a provider whose model ids do not contain `deepseek`, neither condition holds and the badge stays hidden — extend `Config.providers` only when the route actually serves DeepSeek peak-priced models.

## How it works

- **Peak state is a pure client-side clock fact.** `isPeak(date)` returns true iff the UTC hour is in `{1,2,3}` or `{6,7,8,9}` (windows `01:00–04:00` and `06:00–10:00`, inclusive start, exclusive end). The component re-evaluates every 60 s through a `setInterval` cleared on unmount.
- **Provider list is fetched once from the host through a Connection RPC channel.** The host half registers `ctx.connection.rpc.handle('/peak-rate', ...)`, reads `Config.providers` (schemastery, default `['deepseek-official']`) from the profile's `cordis.patch.yml`, and returns it on the `providers` endpoint. The browser half calls `ctx.connection.rpc.call('/peak-rate', 'providers', {})` once and exposes the result as a reactive source (`useSyncExternalStore`); the badge stays hidden until the fetch settles.
- **The component reads the session's current selection through `ctx.modelDirectories.directoryFor(sessionId).store`** (the same instance `ModelSelect` reads), subscribes via `useSyncExternalStore`, and applies the [match rule](#match-rule).
- **No model-visible output, no session events, no durable state.** The plugin reads only the clock, the existing model-directory store, and the one-shot provider list. The peak schedule is a published 2026 constant; a DeepSeek schedule change requires a plugin update to `isPeak`.

## Build from source

```sh
pnpm install
pnpm build         # emits lib/index.js, lib/invariant.js, lib/client.js + sourcemaps
```

`lib/` is committed to the repo so git installs work without a build step. After changing source, run `pnpm build` and commit the updated `lib/`.

## License

MIT
