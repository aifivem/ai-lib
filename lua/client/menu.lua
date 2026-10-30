-- ai-core's shared menu and input dialog (the same ones every TypeScript script opens through lib `menu` / `input`).
local resource = GetCurrentResourceName()
local waiting = {}
---@type table<integer, AiLibMenuListeners>
local listening = {}
local nextId = 0

local function answer(owner, id, value)
    if owner ~= resource then return end
    local entry = waiting[id]
    if not entry then return end
    waiting[id] = nil
    listening[id] = nil
    entry:resolve(value)
end
AddEventHandler('ai-core:client:menuResult', answer)
AddEventHandler('ai-core:client:inputResult', answer)
AddEventHandler('ai-core:client:menuHover', function(owner, id, item)
    local l = owner == resource and listening[id]
    if l and l.onHover then l.onHover(item) end
end)
AddEventHandler('ai-core:client:menuToggle', function(owner, id, item, checked)
    local l = owner == resource and listening[id]
    if l and l.onToggle then l.onToggle(item, checked) end
end)
AddEventHandler('ai-core:client:itemPicked', function(owner, id, name, count)
    local l = owner == resource and listening[id]
    if l and l.onPick then l.onPick(name, count) end
end)

---@param open fun(id: integer)
---@param listeners? AiLibMenuListeners
---@return any
local function ask(open, listeners)
    nextId = nextId + 1
    local id = nextId
    local p = promise.new()
    waiting[id] = p
    listening[id] = listeners
    open(id)
    return Citizen.Await(p)
end

---@class AiLibMenuItem
---@field id string
---@field label string
---@field icon? string Font Awesome solid name without `fa-`
---@field description? string
---@field disabled? boolean
---@field checked? boolean a switch row: picking it flips it in place and the menu stays open (`onToggle`)

---@class AiLibMenuListeners
---@field onHover? fun(item: string) the item under the pointer or focus
---@field onToggle? fun(item: string, checked: boolean) a switch row was flipped
---@field onPick? fun(name: string, count: integer) an item picked in the item picker

local menu = {}

---Shows the menu and waits (call from a thread): the picked item id, `'__back'` for a short Escape in a sub menu
---(`back = true`), or nil when the player closed it. `listeners` hears hovers and switch row flips.
---@param request { title: string, items: AiLibMenuItem[], back?: boolean }
---@param listeners? AiLibMenuListeners
---@return string?
function menu.show(request, listeners)
    local picked = ask(function(id) exports['ai-core']:OpenMenu(id, request) end, listeners)
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

---Shows ai-core's item picker (admin tools; the list only reaches admins) and waits until it is closed (call from a
---thread); `onPick(name, count)` runs for every pick while it stays open.
---@param request { title: string }
---@param onPick fun(name: string, count: integer)
function menu.itemPicker(request, onPick)
    ask(function(id) exports['ai-core']:OpenItemPicker(id, request) end, { onPick = onPick })
end

return menu
