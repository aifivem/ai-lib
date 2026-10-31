name 'ai-lib'
author 'TGIANN'
version '0.1.0'
license 'GPL-3.0-only'
description 'The shared player UI (notifications, progress bar, prompts, menus, inputs, minigames) and the @aicore-fivem/lib helpers for resources that do not bundle it: @ai-lib/init.lua (Lua) or @ai-lib/dist/client.js / server.js (JavaScript)'
repository 'https://github.com/aifivem/ai-lib'
fx_version 'cerulean'
game 'gta5'
node_version '22'

client_script 'dist/ui.js'
ui_page 'dist/web/index.html'

dependencies {
	'/onesync',
}

files {
	'locales/*.json',
	'dist/web/assets/*.css',
	'dist/web/assets/*.js',
	'dist/web/assets/*.woff',
	'dist/web/assets/*.woff2',
	'dist/web/*.html',
	'init.lua',
	'lua/shared/*.lua',
	'lua/client/*.lua',
	'dist/client.js',
}
