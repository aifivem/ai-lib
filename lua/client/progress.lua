---Runs a timed action with ai-core's progress bar and an optional animation; waits and returns true when it ran out,
---false when cancelled (death, getting into a vehicle unless `allowVehicle`). Checks ten times a second.
---@param options { label: string, duration: integer, anim?: { dict: string, clip: string, flag?: integer }, allowVehicle?: boolean }
---@return boolean
return function(options)
    local cache = aiLib.cache
    local ped = cache.ped
    local anim = options.anim
    if anim and aiLib.requestAnimDict(anim.dict) then
        TaskPlayAnim(ped, anim.dict, anim.clip, 3.0, 3.0, options.duration, anim.flag or 49, 0, false, false, false)
    end
    exports['ai-core']:ShowProgress(options.label, options.duration)
    local finish = GetGameTimer() + options.duration
    local done = true
    while GetGameTimer() < finish do
        if IsEntityDead(cache.ped) or (not options.allowVehicle and cache.vehicle) then
            done = false
            break
        end
        Wait(100)
    end
    if anim then StopAnimTask(ped, anim.dict, anim.clip, 1.0) end
    exports['ai-core']:HideProgress()
    return done
end
