# ai-lib

The `@aicore-fivem/lib` helpers for JavaScript resources that do not bundle the npm package: a resource loads `@ai-lib/dist/client.js` / `@ai-lib/dist/server.js` before its own scripts and finds the lib on the global `aiLib`, running in its own context (like ox_lib's `@ox_lib/init.lua`). ai-lib runs nothing itself. Depends on ai-core like every lib user.

## Decisions

- An import file, not exports (owner decision): the code runs inside the resource that loads it, so points, zones, keybinds and callbacks belong to that resource and go with it; no registry, no start / stop tracking.
- `fxImport: true` in `package.json`: the build lists `dist/client.js` in `files` and loads no script in ai-lib.
- Lua resources cannot load JavaScript; they use ai-core's exports and bridge.

## Contracts

- Usage in another resource's `fxmanifest.lua`: `client_scripts { '@ai-lib/dist/client.js', 'client.js' }`, `server_scripts { '@ai-lib/dist/server.js', 'server.js' }`, `dependency 'ai-lib'`; then `aiLib.notify(...)`, `new aiLib.Points()`, `aiLib.addCommand(...)`. The API is `lib.md`'s list (shared plus the side's helpers).

## Entry points

- `resource/client/index.ts`, `resource/server/index.ts`.
