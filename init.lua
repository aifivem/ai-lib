-- ai-lib for Lua resources: `shared_script '@ai-lib/init.lua'` in the fxmanifest (with `dependency 'ai-lib'`), then
-- `aiLib.notify(...)`, `aiLib.Points.new()`, `aiLib.addCommand(...)`. Modules load on first use, in the calling
-- resource's own context, so what a resource creates (points, keybinds, callbacks) goes with it.

local LIB = 'ai-lib'
local side = IsDuplicityVersion() and 'server' or 'client'

---Loads `lua/<side>/<name>.lua`, else `lua/shared/<name>.lua`, and returns what the file returns.
---@param name string
---@return any
local function loadModule(name)
    for _, dir in ipairs({ side, 'shared' }) do
        local path = ('lua/%s/%s.lua'):format(dir, name)
        local code = LoadResourceFile(LIB, path)
        if code then
            local chunk, err = load(code, ('@@%s/%s'):format(LIB, path), 't', _ENV)
            if not chunk then error(err, 2) end
            return chunk()
        end
    end
    error(('ai-lib has no "%s" on the %s'):format(name, side), 3)
end

---@class AiLib
---@field side 'client'|'server'
---@field waitFor fun(check: (fun(): any), timeout?: integer|false, interval?: integer): any
---@field formatText fun(text: string, ...: string|number): string
---@field fail fun(error: string): { ok: false, error: string } server actions: a refusal with a lang key
---@field locale fun(resource?: string): (fun(key: string, ...: string|number): string), (table<string, string>)
---@field triggerServerCallback fun(name: string, args?: any[], timeout?: integer): (any), (string?) client
---@field onServerCallback fun(name: string, handler: (fun(...: any): any)) client
---@field callAction fun(name: string, args?: any[], options: { fallback: string, timeout?: integer, silent?: boolean }): table? client: runs an action, notifies the translated refusal, returns the ok reply or nil
---@field notify fun(...: any) client `(text, kind?, duration?)`; server `(source, text, kind?, duration?)`
---@field progress fun(options: { label: string, duration: integer, anim?: { dict: string, clip: string, flag?: integer }, allowVehicle?: boolean }): boolean client
---@field menu { show: (fun(request: table, listeners?: table): string?), input: (fun(request: table): table?), itemPicker: (fun(request: { title: string, target?: integer }): table?) } client
---@field itemPicker fun(request: { title: string, target?: integer }): table? client, admin tools: the taken list or nil
---@field input fun(request: table): table? client
---@field showPrompt fun(id: string, text: string) client
---@field hidePrompt fun(id: string) client
---@field onPromptPressed fun(handler: (fun(id: string))) client
---@field cache AiLibCache client
---@field Keybind AiLibKeybind client
---@field Points AiLibPoints client
---@field ModelPoints table client, internal (used by `Points:addModel`)
---@field Zones AiLibZones client
---@field LocalPed AiLibLocalPed client
---@field Blips AiLibBlips client (`Blips.create(options)` for a single blip)
---@field player table client: `coords`, `heading`, `distanceTo`, `freeze`, `teleport` (`ground = 'find'` or no z: ground under x / y), `playAnim`, `stopAnim`
---@field nearestPlayer fun(metres: number, options?: { from?: vector3, filter?: fun(serverId: integer, ped: integer): boolean }): integer? client: closest other player's server id
---@field onShot fun(handler: fun(weapon: integer)) client: the frame the local ped fires (per-frame only while armed)
---@field fadeOut fun(ms?: integer) client
---@field nearestVehicle fun(metres: number, options?: { networked?: boolean, notOwn?: boolean }): integer client
---@field playerData { get: (fun(key: string): any), onChange: (fun(key: string, handler: fun(value: any))) } client
---@field onServerEvent fun(name: string, handler: (fun(...: any))) client
---@field onClientEvent fun(name: string, handler: (fun(source: integer, ...: any)), options?: table) server
---@field aiLog fun(channel: string, message: string, options?: table) server
---@field online table server: `character`, `jobs`, `dutyJob`, `sources`
---@field nearestVehicleTo fun(source: integer, metres: number, filter?: fun(vehicle: integer): boolean): integer server
---@field vehicleFromNet fun(netId: any): integer server: the live vehicle behind a client's net id, or 0
---@field vehicleNearPlayer fun(source: integer, netId: any, options?: { metres?: number, driver?: boolean }): integer server
---@field nearestPlayerTo fun(source: integer, metres: number, filter?: fun(other: integer): boolean): integer? server
---@field onCharacter fun(handlers: { loaded?: fun(source: integer, character: table), unloaded?: fun(source: integer, charId: integer) }) server: also replays characters loaded before a restart
---@field playersNearEntity fun(entity: integer, radius: number): integer[] server
---@field isAdmin fun(source: integer, ace?: string): boolean server
---@field controls { disable: (fun(reason: string, controls: integer[], group?: integer)), disableAll: (fun(reason: string, except?: integer[])), enable: (fun(reason: string)) } client
---@field hud { hide: (fun(reason: string)), show: (fun(reason: string)), visible: (fun(): boolean) } client
---@field keyHints { show: (fun(id: string, hint: { label: string, keybind?: string, key?: string, icon?: string })), hide: (fun(id: string)) } client
---@field gestures { isHandsUp: (fun(): boolean), isPointing: (fun(): boolean), provider: (fun(): string?) } client
---@field radial { add: (fun(item: AiLibRadialItem)), remove: (fun(id: string)), refresh: fun() } client: wheel items through ai-core
---@field requestModel fun(model: string|integer, timeout?: integer): integer? client
---@field requestAnimDict fun(dict: string, timeout?: integer): string? client
---@field requestPtfxAsset fun(asset: string, timeout?: integer): string? client
---@field onClientCallback fun(name: string, handler: (fun(source: integer, ...: any): any), options?: AiLibClientInputOptions) server
---@field triggerClientCallback fun(name: string, source: integer, args?: any[], timeout?: integer): (any), (string?) server
---@field addCommand fun(name: string|string[], options: table, handler: (fun(source: integer, args: table, raw: string))) server
---@field spawnVehicle fun(options: AiLibSpawnVehicleOptions): integer? server
---@field playersNear fun(source: integer, radius: number): integer[] server
---@field inventory table client `openInventory`, `hasItem`, `currentWeapon`; server the item calls through ai-core
---@field vehicleKeys { give: (fun(source: integer, vehicle: integer|string, purpose?: string)), remove: (fun(source: integer, vehicle: integer|string)), has: (fun(source: integer, vehicle: integer|string): boolean) } server
---@field phone table server
---@field dispatch { alert: (fun(alert: AiLibDispatchAlert): boolean) } server: police alerts through ai-core's alert system
---@field world table client `pauseSync` / `resumeSync`; server time and weather
---@diagnostic disable-next-line: lowercase-global
aiLib = setmetatable({ side = side }, {
    __index = function(self, key)
        local value = loadModule(key)
        rawset(self, key, value)
        return value
    end,
})
