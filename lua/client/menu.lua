-- ai-core's shared menu and input dialog (the same ones every TypeScript script opens through lib `menu` / `input`).
local resource = GetCurrentResourceName()
local waiting = {}
local nextId = 0

local function answer(owner, id, value)
    if owner ~= resource then return end
    local entry = waiting[id]
    if not entry then return end
    waiting[id] = nil
    entry:resolve(value)
end
AddEventHandler('ai-core:client:menuResult', answer)
AddEventHandler('ai-core:client:inputResult', answer)

---@param open fun(id: integer)
---@return any
local function ask(open)
    nextId = nextId + 1
    local id = nextId
    local p = promise.new()
    waiting[id] = p
    open(id)
    return Citizen.Await(p)
end

---@class AiLibMenuItem
---@field id string
---@field label string
---@field icon? string Font Awesome solid name without `fa-`
---@field description? string
---@field disabled? boolean

local menu = {}

---Shows the menu and waits (call from a thread): the picked item id, `'__back'` for a short Escape in a sub menu
---(`back = true`), or nil when the player closed it.
---@param request { title: string, items: AiLibMenuItem[], back?: boolean }
---@return string?
function menu.show(request)
    local picked = ask(function(id) exports['ai-core']:OpenMenu(id, request) end)
    return type(picked) == 'string' and picked or nil
end

---Shows the input dialog and waits: the values by field name, or nil when closed. Field types: `number`
---(`min`, `max`), `text` (`maxLength`, `multiline`, `value`, `readOnly`).
---@param request { title: string, confirm: string, fields: table[] }
---@return table<string, string|number>?
function menu.input(request)
    local values = ask(function(id) exports['ai-core']:OpenInput(id, request) end)
    return type(values) == 'table' and values or nil
end

return menu
