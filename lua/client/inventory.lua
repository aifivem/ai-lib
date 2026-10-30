---Items through ai-core's inventory layer (whatever inventory runs).
return {
    ---Opens the player's own inventory screen.
    openInventory = function() exports['ai-core']:OpenInventory() end,
    ---@param item string
    ---@param count? integer
    ---@return boolean
    hasItem = function(item, count) return exports['ai-core']:HasItem(item, count or 1) end,
}
