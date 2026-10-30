# ai-lib

The `@aicore-fivem/lib` helpers for resources that do not bundle the npm package, loaded like ox_lib and running in the resource that loads them: Lua through `shared_script '@ai-lib/init.lua'` (global `aiLib`), JavaScript through `client_script '@ai-lib/dist/client.js'` / `server_script '@ai-lib/dist/server.js'` (global `aiLib`). ai-lib runs nothing itself. Depends on ai-core like every lib user.

## Decisions

- An import file, not exports (owner decision): the code runs inside the resource that loads it, so points, keybinds, commands and callbacks belong to that resource and go with it; no registry, no start / stop tracking.
- JavaScript side: `fxImport: true` in `package.json` (bundles listed in `files`, no script run here); the whole lib (shared + the side's helpers) on `aiLib`.
- Lua side: a port, not a wrapper around the JS bundle (Lua cannot load JavaScript). `init.lua` loads `lua/<side>/<name>.lua`, else `lua/shared/<name>.lua`, on first use of `aiLib.<name>`; modules use the same wire formats as the TypeScript lib (callbacks, keybind announce / key events, prompts, the `ai:interaction` style, vehicle state bags), so Lua and TypeScript resources answer each other. Async calls (`triggerServerCallback`, `menu.show`, `progress`, `spawnVehicle`) wait with `Citizen.Await` / `Wait`: call them from a thread.
- Lua `Points` covers prompt and target modes, enter / exit and a simple blip; no NPC (`ped`) and no model points yet (a Lua resource uses its own `LocalPed`-like code until then). One 500 ms check for all points of the resource, started with the first point.

## Contracts

- Lua (`aiLib.`): shared `waitFor`, `formatText`, `locale`; client `cache` (+ `cache.onChange`), `notify`, `progress`, `menu.show` / `menu.input` (`input`), `showPrompt` / `hidePrompt` / `onPromptPressed`, `Points.new()`, `Keybind.new()`, `controls`, `hud`, `gestures`, `inventory`, `world`, `requestModel` / `requestAnimDict` / `requestPtfxAsset`, `triggerServerCallback`, `onServerCallback`; server `onClientCallback` (rate, lock, ace), `triggerClientCallback`, `notify`, `addCommand`, `spawnVehicle`, `playersNear`, `inventory`, `vehicleKeys`, `phone`, `world`. Types: the `AiLib` class in `init.lua`.
- JavaScript: `aiLib` = the lib's `/shared` plus `/client` or `/server` (`.claude/rules/lib.md`).

## Entry points

- Lua loader `init.lua`, modules `lua/{shared,client,server}/`; JS entries `resource/client/index.ts`, `resource/server/index.ts`.
