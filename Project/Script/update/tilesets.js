'use strict'

// 更新图块组数据
Updater.updateTilesets = function (verNum) {
	// 更新到1.0.60版本：添加terrains属性
	if (verNum < Updater.getVersionNumber('1.0.60')) {
		const tilesets = Data.tilesets
		for (const [guid, tileset] of Object.entries(tilesets)) {
			const meta = Data.manifest.guidMap[guid]
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`)
			}
			const length = tileset.width * tileset.height
			tileset.terrains = new Array(length).fill(0)
			File.planToSave(meta)
		}
	}
	// 更新到1.0.85版本：添加tags属性
	if (verNum < Updater.getVersionNumber('1.0.85')) {
		const tilesets = Data.tilesets
		for (const [guid, tileset] of Object.entries(tilesets)) {
			const meta = Data.manifest.guidMap[guid]
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`)
			}
			const length = tileset.width * tileset.height
			tileset.tags = new Array(length).fill(0)
			File.planToSave(meta)
		}
	}
}
