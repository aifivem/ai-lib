---The closest vehicle within `metres` of a player (the one they sit in first); 0 when none. Walks every vehicle: for
---commands and actions, not ticks.
---@param src integer
---@param metres number
---@return integer
return function(src, metres)
    local ped = GetPlayerPed(src)
    local own = GetVehiclePedIsIn(ped, false)
    if own ~= 0 then return own end
    local origin = GetEntityCoords(ped)
    local best, bestDist = 0, metres
    for _, vehicle in ipairs(GetAllVehicles()) do
        local d = #(GetEntityCoords(vehicle) - origin)
        if d < bestDist then best, bestDist = vehicle, d end
    end
    return best
end
