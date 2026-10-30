name 'ai-lib'
author 'ai-core'
version '0.1.0'
license 'GPL-3.0-only'
description 'The @aicore-fivem/lib helpers for JavaScript resources that do not bundle it: load @ai-lib/dist/client.js or server.js'
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
	'dist/client.js',
}
