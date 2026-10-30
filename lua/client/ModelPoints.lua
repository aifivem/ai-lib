-- Points on world objects of some models (used through `Points:addModel`), like the TypeScript lib's model points:
-- a target option on the models in target mode, otherwise a prompt near the closest one. One scan for the resource,
-- two times a second, only while model points exist. Vehicle models scan the vehicle pool (the object scan never
-- finds vehicles).

local TARGET = 'ox_target'
local SCAN_MS = 500
---@type table<table, boolean>
local scanning = {}
local byPrompt = {}
local running = false
local busy = false

---@param point table
---@param entity integer
local function allowed(point, entity)
    if not point.options.canShow then return true end
    local ok, result = pcall(point.options.canShow, entity)
    return ok and result ~= false
end

---@param point table
---@param entity integer
local function run(point, entity)
    if busy or entity == 0 or not allowed(point, entity) then return end
    busy = true
    local ok, err = pcall(point.options.onPressed, entity)
    busy = false
    if not ok then print(('^1[%s] model point onPressed failed: %s^0'):format(GetCurrentResourceName(), err)) end
end

---@param point table
---@param text string?
local function show(point, text)
    if text == point.shown then return end
    point.shown = text
    if text then exports['ai-core']:ShowPrompt(point.promptId, text) else exports['ai-core']:HidePrompt(point.promptId) end
end

---@param point table
---@param x number
---@param y number
---@param z number
---@return integer
local function nearest(point, x, y, z)
    local radius = point.options.radius or 1.5
    if point.options.vehicles then
        local best, bestDist = 0, radius
        for _, vehicle in ipairs(GetGamePool('CVehicle')) do
            if (point.global and NetworkGetEntityIsNetworked(vehicle)) or point.hashSet[GetEntityModel(vehicle)] then
                local d = #(GetEntityCoords(vehicle) - vector3(x, y, z))
                if d < bestDist then best, bestDist = vehicle, d end
            end
        end
        return best
    end
    for _, hash in ipairs(point.hashes) do
        local found = GetClosestObjectOfType(x, y, z, radius, hash, false, false, false)
        if found ~= 0 then return found end
    end
    return 0
end

local function scan()
    while next(scanning) do
        local x, y, z = table.unpack(GetEntityCoords(aiLib.cache.ped))
        for point in pairs(scanning) do
            local found = nearest(point, x, y, z)
            point.entity = found
            show(point, found ~= 0 and allowed(point, found) and point.options.label or nil)
        end
        Wait(SCAN_MS)
    end
    running = false
end

---@param point table
---@param mode 'prompt'|'target'
local function attach(point, mode)
    if mode == 'target' then
        local option = {
            name = point.promptId,
            label = point.options.label,
            icon = point.options.icon,
            distance = point.options.radius or 1.5,
            canInteract = function(entity) return allowed(point, entity) end,
            onSelect = function(data) run(point, type(data) == 'table' and data.entity or 0) end,
        }
        if point.global then
            exports[TARGET]:addGlobalVehicle({ option })
        else
            exports[TARGET]:addModel(point.options.models, { option })
        end
        point.attached = true
        return
    end
    scanning[point] = true
    if not running then
        running = true
        CreateThread(scan)
    end
end

---@param point table
local function detach(point)
    if point.attached and GetResourceState(TARGET) == 'started' then
        if point.global then
            exports[TARGET]:removeGlobalVehicle(point.promptId)
        else
            exports[TARGET]:removeModel(point.options.models, point.promptId)
        end
    end
    point.attached = false
    scanning[point] = nil
    show(point, nil)
    point.entity = 0
end

local ModelPoints = {}

---@param promptId string
---@param options table
---@param mode 'prompt'|'target'
---@return table
function ModelPoints.add(promptId, options, mode)
    local hashes, hashSet = {}, {}
    for i, model in ipairs(options.models) do
        local hash = type(model) == 'number' and model or GetHashKey(model)
        hashes[i] = hash
        hashSet[hash] = true
    end
    -- No models on a vehicle point: every networked vehicle (`Points:addVehicle`).
    local global = options.vehicles == true and #options.models == 0
    local point = { promptId = promptId, options = options, hashes = hashes, hashSet = hashSet, entity = 0, global = global }
    byPrompt[promptId] = point
    attach(point, mode)
    return point
end

---@param point table
function ModelPoints.remove(point)
    byPrompt[point.promptId] = nil
    detach(point)
end

---@param point table
---@param mode 'prompt'|'target'
function ModelPoints.restyle(point, mode)
    detach(point)
    attach(point, mode)
end

---The interaction key on a model point's prompt.
---@param promptId string
function ModelPoints.press(promptId)
    local point = byPrompt[promptId]
    if point then run(point, point.entity) end
end

return ModelPoints
