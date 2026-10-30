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
---@field locale fun(resource?: string): (fun(key: string, ...: string|number): string), (table<string, string>)
---@field triggerServerCallback fun(name: string, args?: any[], timeout?: integer): (any), (string?) client
---@field onServerCallback fun(name: string, handler: (fun(...: any): any)) client
---@field notify fun(...: any) client `(text, kind?, duration?)`; server `(source, text, kind?, duration?)`
---@field progress fun(options: { label: string, duration: integer, anim?: { dict: string, clip: string, flag?: integer }, allowVehicle?: boolean }): boolean client
---@field menu { show: (fun(request: table): string?), input: (fun(request: table): table?) } client
---@field input fun(request: table): table? client
---@field showPrompt fun(id: string, text: string) client
---@field hidePrompt fun(id: string) client
---@field onPromptPressed fun(handler: (fun(id: string))) client
---@field cache AiLibCache client
---@field Keybind AiLibKeybind client
---@field Points AiLibPoints client
---@field controls { disable: (fun(reason: string, controls: integer[], group?: integer)), enable: (fun(reason: string)) } client
---@field hud { hide: (fun(reason: string)), show: (fun(reason: string)), visible: (fun(): boolean) } client
---@field gestures { isHandsUp: (fun(): boolean), isPointing: (fun(): boolean), provider: (fun(): string?) } client
---@field requestModel fun(model: string|integer, timeout?: integer): integer? client
---@field requestAnimDict fun(dict: string, timeout?: integer): string? client
---@field requestPtfxAsset fun(asset: string, timeout?: integer): string? client
---@field onClientCallback fun(name: string, handler: (fun(source: integer, ...: any): any), options?: AiLibClientInputOptions) server
---@field triggerClientCallback fun(name: string, source: integer, args?: any[], timeout?: integer): (any), (string?) server
---@field addCommand fun(name: string|string[], options: table, handler: (fun(source: integer, args: table, raw: string))) server
---@field spawnVehicle fun(options: AiLibSpawnVehicleOptions): integer? server
---@field playersNear fun(source: integer, radius: number): integer[] server
---@field inventory table client `openInventory`, `hasItem`; server the item calls through ai-core
---@field vehicleKeys { give: (fun(source: integer, vehicle: integer|string, purpose?: string)), remove: (fun(source: integer, vehicle: integer|string)), has: (fun(source: integer, vehicle: integer|string): boolean) } server
---@field phone table server
---@field world table client `pauseSync` / `resumeSync`; server time and weather
---@diagnostic disable-next-line: lowercase-global
aiLib = setmetatable({ side = side }, {
    __index = function(self, key)
        local value = loadModule(key)
        rawset(self, key, value)
        return value
    end,
})
