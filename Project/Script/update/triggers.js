'use strict'

// 更新触发器数据
Updater.updateTriggers = function (verNum) {
	// 更新到1.0.122版本：添加inherit属性
	if (verNum < Updater.getVersionNumber('1.0.122')) {
		const triggers = Data.triggers
		const keys = Object.keys(Inspector.fileTrigger.create())
		for (const [guid, sTrigger] of Object.entries(triggers)) {
			const meta = Data.manifest.guidMap[guid]
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`)
			}
			const dTrigger = Inspector.fileTrigger.create()
			for (const key of keys) {
				if (key in sTrigger) {
					dTrigger[key] = sTrigger[key]
				}
			}
			triggers[guid] = dTrigger
			File.planToSave(meta)
		}
	}
}
