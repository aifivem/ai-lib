# Changelog

## [0.5.0](https://github.com/aifivem/ai-lib/compare/v0.4.0...v0.5.0) (2026-11-02)


### New Features

* **lua:** online jobCount, jobPlayers and onJobState from a job mirror ([4b99991](https://github.com/aifivem/ai-lib/commit/4b999915a5c145b430d8b13694fef271d91650d6))

## [0.4.0](https://github.com/aifivem/ai-lib/compare/v0.3.0...v0.4.0) (2026-11-01)


### New Features

* **lib:** Lua inventory.items and inventory.onCount ([ca53d60](https://github.com/aifivem/ai-lib/commit/ca53d60bf5694f02f102ddef4b2f7789b2be10d9))
* **lib:** Lua item definition lists ([0841eff](https://github.com/aifivem/ai-lib/commit/0841eff2602ead816a787401806194060b8c925a))
* **lib:** Lua money, jobs, characters, definitions, fuel, medical, doors, garages, buckets, bans, prime time and needs ([805df56](https://github.com/aifivem/ai-lib/commit/805df56888daf620fa66a0f3cb88756a7baa5303))
* **lib:** Lua needs.add ([ae849cc](https://github.com/aifivem/ai-lib/commit/ae849cc2aa744d3dc2fd8ee53b2e6dbffd11c6a0))
* **lib:** Lua online.sourceOf / characters, inventory itemsBySlot / firstStack ([9c2ac5f](https://github.com/aifivem/ai-lib/commit/9c2ac5f6320a3fa57dbab139c439ead34722e8c9))
* **lua:** inventory.canCarryItems, jobs.unemployed and characters.hasJobMember ([ad8d292](https://github.com/aifivem/ai-lib/commit/ad8d292e00ba76389b7569cf16de71ec0b85e8a6))

## [0.3.0](https://github.com/aifivem/ai-lib/compare/v0.2.1...v0.3.0) (2026-11-01)


### New Features

* **lib:** Lua attachProp, entity searches, scaleform loader, players near a point and notification titles ([b7726dd](https://github.com/aifivem/ai-lib/commit/b7726ddaa6bf8841b90b8ea0645d1d0f98675846))
* **lib:** Lua item metadata, weight limits, item definitions and key checks ([22384a3](https://github.com/aifivem/ai-lib/commit/22384a3da5b5259744310bebfa7a99b41b0117fc))
* **lib:** Lua vehicleType and spawnVehicle take a model hash; fuel goes through ai-core's fuel layer ([4ed7848](https://github.com/aifivem/ai-lib/commit/4ed784854aee2601067c9e771053102c8879b1b9))


### Bug Fixes

* **lib:** keep Lua callback ids apart from the TypeScript lib's in the same resource ([f1dd78b](https://github.com/aifivem/ai-lib/commit/f1dd78b77f2b95c61c8ecdb2f53497531280d34b))
* **lib:** Lua playersNear includes the player, as the TypeScript lib does ([9cb508b](https://github.com/aifivem/ai-lib/commit/9cb508bf253e21467ef792db2e453f7bcdcf818d))
* **lib:** ship the nested Lua module parts to clients ([7270592](https://github.com/aifivem/ai-lib/commit/7270592e949c0aae582a2fcbb55be9ea357cc808))


### Code Refactoring

* entry files only import, dialogs and minigames split, Lua module parts ([01a559d](https://github.com/aifivem/ai-lib/commit/01a559d835f49168df980cf47d1131a1240ab516))

## [0.2.1](https://github.com/aifivem/ai-lib/compare/v0.2.0...v0.2.1) (2026-10-31)


### Miscellaneous Chores

* rebuild with the current lib ([26d2996](https://github.com/aifivem/ai-lib/commit/26d2996d67fadfdf5da8ea0afaf349f295c45e89))

## [0.2.0](https://github.com/aifivem/ai-lib/compare/v0.1.0...v0.2.0) (2026-10-31)


### New Features

* **billing:** Lua bill helper follows database-backed bills ([6fbabcd](https://github.com/aifivem/ai-lib/commit/6fbabcdfe342464fbea1f61731895adcc2b7e253))
* target adapters, model point host, Lua twins of the new layers, notifications can go to another UI ([b916f87](https://github.com/aifivem/ai-lib/commit/b916f870f4004ac5d3dbb64b933e8cec0a0e9903))


### Bug Fixes

* fixed NUI layer (notifications on top, police alerts over the HUD) ([452e46e](https://github.com/aifivem/ai-lib/commit/452e46e086bcb87962acdb39f98cc7d082e5cc75))
* world prompts follow a moving entity; Lua points detect ai-target ([e1fba19](https://github.com/aifivem/ai-lib/commit/e1fba1986e489e7a04002789ee3b462a0bdc3191))


### Performance

* one zone checker for every resource ([002bde9](https://github.com/aifivem/ai-lib/commit/002bde9a9eab6ee82e2ae2201e0ab6b3d8527b79))


### Miscellaneous Chores

* rebuild with the current lib ([d8e5b44](https://github.com/aifivem/ai-lib/commit/d8e5b441a337d2bfc9db8bfa8395666fe90a3b0f))
* rebuild with the current lib ([88d666f](https://github.com/aifivem/ai-lib/commit/88d666f71bbdc1956deb6b6a9f85c6197c905cb1))
