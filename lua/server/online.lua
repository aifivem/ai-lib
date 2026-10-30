-- Loaded players through ai-core's exports (character, jobs, duty). For lookups at an action, not for every tick.
local core = exports['ai-core']
return {
    ---@param src integer
    ---@return table? character { id, citizenid, firstname, lastname, birthdate, sex, nationality }
    character = function(src) return core:GetCharacter(src) end,
    ---@param src integer
    ---@return table[] jobs { job, grade, ... }
    jobs = function(src) return core:GetJobs(src) or {} end,
    ---@param src integer
    ---@return string?
    dutyJob = function(src) return core:GetDutyJob(src) end,
    ---Server ids of every player with a loaded character.
    ---@return integer[]
    sources = function() return core:GetLoadedSources() or {} end,
}
