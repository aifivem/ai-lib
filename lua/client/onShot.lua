-- `IsPedShooting` is true only in the frame of the shot, so it is read every frame, but only while a weapon is held.
---@type fun(weapon: integer)[]
local handlers = {}
local running = false
local watching = false

local function start()
    if running or #handlers == 0 or not aiLib.cache.weapon then return end
    running = true
    CreateThread(function()
        local cache = aiLib.cache
        while cache.weapon and #handlers > 0 do
            if IsPedShooting(cache.ped) then
                for i = 1, #handlers do handlers[i](cache.weapon) end
            end
            Wait(0)
        end
        running = false
    end)
end

---Runs `handler(weapon)` in the frame the local ped fires a shot (stress, shot alerts). One per-frame thread for the
---resource, running only while a weapon is in hand. Keep the handler cheap.
---@param handler fun(weapon: integer)
return function(handler)
    handlers[#handlers + 1] = handler
    if not watching then
        watching = true
        aiLib.cache.onChange('weapon', start)
    end
    start()
end
