-- Disabled controls of this resource: one per-frame thread for every reason, running only while any reason holds.
local sets = {}
local flat = {}
local running = false

local function rebuild()
    flat = {}
    for _, set in pairs(sets) do
        for _, control in ipairs(set.controls) do
            flat[#flat + 1] = set.group
            flat[#flat + 1] = control
        end
    end
    if #flat == 0 or running then return end
    running = true
    CreateThread(function()
        while #flat > 0 do
            for i = 1, #flat, 2 do DisableControlAction(flat[i], flat[i + 1], true) end
            Wait(0)
        end
        running = false
    end)
end

return {
    ---Disables `controls` (input group `group`, default 0) every frame until `enable(reason)`.
    ---@param reason string
    ---@param controls integer[]
    ---@param group? integer
    disable = function(reason, controls, group)
        sets[reason] = { group = group or 0, controls = controls }
        rebuild()
    end,
    ---@param reason string
    enable = function(reason)
        if sets[reason] == nil then return end
        sets[reason] = nil
        rebuild()
    end,
}
