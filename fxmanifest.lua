name 'ai-lib'
author 'TGIANN'
version '0.1.0'
license 'GPL-3.0-only'
description 'The @aicore-fivem/lib helpers for resources that do not bundle it: @ai-lib/init.lua (Lua) or @ai-lib/dist/client.js / server.js (JavaScript)'
repository 'https://github.com/TGIANN/ai-lib'
fx_version 'cerulean'
game 'gta5'
node_version '22'



dependencies {
	'/onesync',
	'ai-core',
}

files {
	'locales/*.json',
	'init.lua',
	'lua/shared/*.lua',
	'lua/client/*.lua',
	'dist/client.js',
}
