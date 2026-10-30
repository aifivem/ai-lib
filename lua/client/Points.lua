-- Interaction points of a resource (counters, doors, NPC spots): ai-core's prompt (its interaction key) or a target
-- option, as the owner picks in ai-core's panel (Interaction); the same `onPressed` runs either way.

local resource = GetCurrentResourceName()
local TARGET = 'ox_target'
local CHECK_MS = 500
local groups = {}
local byPrompt = {}
local nextGroup = 0
local busy = false
local watching = false
local watch

---@return 'prompt'|'target'
local function style()
    return GlobalState['ai:interaction'] == 'target' and GetResourceState(TARGET) == 'started' and 'target' or 'prompt'
end

---@param value string|fun(): string
local function readLabel(value)
    if type(value) ~= 'function' then return value end
    local ok, text = pcall(value)
    return ok and text or ''
end

---@class AiLibPointOptions
---@field coords vector3|{x: number, y: number, z: number}
---@field label string|fun(): string prompt text or target label (already translated)
---@field icon? string Font Awesome name (`store` or `fa-solid fa-store`)
---@field radius? number metres (default 2)
---@field height? number a cylinder: metres up and down from `coords`
---@field targetRadius? number target mode: size of the aim spot (default 1)
---@field promptOnly? boolean always a prompt (actions done from a vehicle)
---@field canShow? fun(): boolean
---@field onPressed fun()
---@field onEnter? fun()
---@field onExit? fun()
---@field blip? { sprite: integer, color: integer, scale?: number, label?: string }

---@class AiLibPoint
---@field promptId string
---@field options AiLibPointOptions
---@field inside boolean
---@field shown string?
---@field zone any
---@field blip integer?
local Point = {}
Point.__index = Point

function Point:allowed()
    if not self.options.canShow then return true end
    local ok, result = pcall(self.options.canShow)
    return ok and result ~= false
end

function Point:press()
    if busy or not self:allowed() then return end
    busy = true
    local ok, err = pcall(self.options.onPressed)
    busy = false
    if not ok then print(('^1[%s] point onPressed failed: %s^0'):format(resource, err)) end
end

---@param mode 'prompt'|'target'
function Point:sync(mode)
    if self.options.promptOnly then mode = 'prompt' end
    local text = mode == 'prompt' and self.inside and self:allowed() and readLabel(self.options.label) or nil
    if text == self.shown then return end
    self.shown = text
    if text then exports['ai-core']:ShowPrompt(self.promptId, text) else exports['ai-core']:HidePrompt(self.promptId) end
end

function Point:targetOption()
    return { {
        name = self.promptId,
        label = readLabel(self.options.label),
        icon = self.options.icon,
        distance = self.options.radius or 2,
        canInteract = function() return self:allowed() end,
        onSelect = function() self:press() end,
    } }
end

---@param x number
---@param y number
---@param z number
function Point:contains(x, y, z)
    local c = self.options.coords
    local r = self.options.radius or 2
    if self.options.height then
        return (x - c.x) ^ 2 + (y - c.y) ^ 2 <= r * r and math.abs(z - c.z) <= self.options.height
    end
    return (x - c.x) ^ 2 + (y - c.y) ^ 2 + (z - c.z) ^ 2 <= r * r
end

---@class AiLibPoints
---@field private prefix string
---@field private points table<string, AiLibPoint>
local Points = {}
Points.__index = Points

---A new group of points; `clear()` + `add()` rebuilds it when its data changes.
---@return AiLibPoints
function Points.new()
    nextGroup = nextGroup + 1
    local self = setmetatable({ prefix = ('pt%d:'):format(nextGroup), points = {} }, Points)
    groups[#groups + 1] = self
    return self
end

---Adds (or replaces) a point.
---@param id string
---@param options AiLibPointOptions
function Points:add(id, options)
    self:remove(id)
    local point = setmetatable({ promptId = self.prefix .. id, options = options, inside = false }, Point)
    self.points[id] = point
    byPrompt[point.promptId] = point
    if not watching then
        watching = true
        CreateThread(watch)
    end
    local b = options.blip
    if b then
        local blip = AddBlipForCoord(options.coords.x, options.coords.y, options.coords.z)
        SetBlipSprite(blip, b.sprite)
        SetBlipColour(blip, b.color)
        SetBlipScale(blip, b.scale or 0.8)
        SetBlipAsShortRange(blip, true)
        if b.label then
            AddTextEntry('AI_LIB_BLIP', '~a~')
            BeginTextCommandSetBlipName('AI_LIB_BLIP')
            AddTextComponentSubstringPlayerName(b.label)
            EndTextCommandSetBlipName(blip)
        end
        point.blip = blip
    end
    self:attach(point, style())
end

---@param id string
function Points:remove(id)
    local point = self.points[id]
    if not point then return end
    self.points[id] = nil
    byPrompt[point.promptId] = nil
    self:detach(point)
    if point.shown then exports['ai-core']:HidePrompt(point.promptId) end
    if point.blip then RemoveBlip(point.blip) end
end

function Points:clear()
    for id in pairs(self.points) do self:remove(id) end
end

---Reads `canShow` and function labels again (call when what they read changed: job, duty, vehicle).
function Points:refresh()
    local mode = style()
    for _, point in pairs(self.points) do
        if mode == 'target' and point.zone then
            self:detach(point)
            self:attach(point, mode)
        end
        point:sync(mode)
    end
end

---@private
function Points:attach(point, mode)
    if mode ~= 'target' or point.options.promptOnly then return end
    point.zone = exports[TARGET]:addSphereZone({
        coords = point.options.coords,
        radius = point.options.targetRadius or 1,
        options = point:targetOption(),
    })
end

---@private
function Points:detach(point)
    if point.zone and GetResourceState(TARGET) == 'started' then exports[TARGET]:removeZone(point.zone) end
    point.zone = nil
end

local function restyleAll()
    local mode = style()
    for _, group in ipairs(groups) do
        for _, point in pairs(group.points) do
            group:detach(point)
            group:attach(point, mode)
            point:sync(mode)
        end
    end
end

-- One check for every point of this resource, two times a second, started with the first point; enters and exits
-- run whatever the style.
watch = function()
    while true do
        Wait(CHECK_MS)
        local any = false
        local x, y, z = table.unpack(GetEntityCoords(aiLib.cache.ped))
        local mode = style()
        for _, group in ipairs(groups) do
            for _, point in pairs(group.points) do
                any = true
                local inside = point:contains(x, y, z)
                if inside ~= point.inside then
                    point.inside = inside
                    local hook = inside and point.options.onEnter or point.options.onExit
                    if hook then pcall(hook) end
                end
                if point.inside or point.shown then point:sync(mode) end
            end
        end
        if not any then Wait(1000) end
    end
end

AddEventHandler('ai-core:client:promptPressed', function(owner, id)
    if owner ~= resource then return end
    local point = byPrompt[id]
    if point then point:press() end
end)
AddStateBagChangeHandler('ai:interaction', 'global', function() SetTimeout(0, restyleAll) end)
AddEventHandler('onClientResourceStart', function(name)
    if name == TARGET or name == 'ai-target' then SetTimeout(0, restyleAll) end
end)
AddEventHandler('onClientResourceStop', function(name)
    if name == TARGET or name == 'ai-target' then SetTimeout(0, restyleAll) end
end)

return Points
