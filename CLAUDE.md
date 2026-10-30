# ai-lib

The `@aicore-fivem/lib` helpers for resources that do not bundle the npm package, loaded like ox_lib and running in the resource that loads them: Lua through `shared_script '@ai-lib/init.lua'` (global `aiLib`), JavaScript through `client_script '@ai-lib/dist/client.js'` / `server_script '@ai-lib/dist/server.js'` (global `aiLib`). ai-lib runs nothing itself. Depends on ai-core like every lib user.

## Decisions

- An import file, not exports (owner decision): the code runs inside the resource that loads it, so points, keybinds, commands and callbacks belong to that resource and go with it; no registry, no start / stop tracking.
- JavaScript side: `fxImport: true` in `package.json` (bundles listed in `files`, no script run here); the whole lib (shared + the side's helpers) on `aiLib`.
- Lua side: a port, not a wrapper around the JS bundle (Lua cannot load JavaScript). `init.lua` loads `lua/<side>/<name>.lua`, else `lua/shared/<name>.lua`, on first use of `aiLib.<name>`; modules use the same wire formats as the TypeScript lib (callbacks, keybind announce / key events, prompts, the `ai:interaction` style, vehicle state bags), so Lua and TypeScript resources answer each other. Async calls (`triggerServerCallback`, `menu.show`, `progress`, `spawnVehicle`) wait with `Citizen.Await` / `Wait`: call them from a thread.
- Lua `Points` matches the TypeScript one: prompt and target modes, enter / exit, a blip, an NPC (`ped`, a `LocalPed` with the target option on it) and model points (`addModel`, `vehicles = true` for vehicle models). One 500 ms check for the resource's points and one for its model points, each started with the first one; `Zones` has one thread for the resource, each zone at its own interval.

## Contracts

- Lua (`aiLib.`): shared `waitFor`, `formatText`, `locale`, `fail`; client `cache` (+ `cache.onChange`), `playerData` (`get`, `onChange`), `notify`, `progress`, `menu.show` (with `{ onHover, onToggle }` listeners) / `menu.input` (`input`) / `menu.itemPicker` (`itemPicker`), `keyHints`, `showPrompt` / `hidePrompt` / `onPromptPressed`, `Points.new()` (+ `addModel`, `addVehicle`), `Zones.new()`, `LocalPed.new()` (`attach`, `seat`), `Blips.new()` / `Blips.create()`, `Keybind.new()` (`hint`, `icon`, `hintLabel`), `player` (`coords`, `heading`, `distanceTo`, `freeze`, `teleport` with `ground = 'find'`, `playAnim`, `stopAnim`), `fadeOut`, `nearestVehicle`, `nearestPlayer`, `onShot`, `callAction`, `controls` (+ `disableAll`), `hud`, `gestures`, `radial` (`add`, `remove`, `refresh`), `inventory`, `world`, `requestModel` / `requestAnimDict` / `requestPtfxAsset`, `triggerServerCallback`, `onServerCallback`, `onServerEvent`; server `onClientCallback` (rate, lock, ace), `onClientEvent`, `triggerClientCallback`, `notify`, `addCommand`, `spawnVehicle`, `playersNear`, `playersNearEntity`, `nearestVehicleTo` (+ `filter`), `nearestPlayerTo`, `vehicleFromNet`, `vehicleNearPlayer`, `onCharacter`, `online`, `isAdmin`, `aiLog`, `inventory`, `vehicleKeys`, `phone`, `dispatch`, `world`. Not on the Lua side: the admin panel (`AdminPanel`, `AdminWorld`), `PendingActions` / `PlayerMap` / `Cooldowns` (Lua tables do it; no Lua flow needs them yet), the strict input readers, position helpers (Lua has vector math), state bag classes (Lua reads `Entity(e).state` itself, the server writes), vehicle props readers and the database (Lua resources use ai-mysql's oxmysql API). Types: the `AiLib` class in `init.lua`.
- JavaScript: `aiLib` = the lib's `/shared` plus `/client` or `/server` (`.claude/rules/lib.md`).

## Entry points

- Lua loader `init.lua`, modules `lua/{shared,client,server}/`; JS entries `resource/client/index.ts`, `resource/server/index.ts`.
