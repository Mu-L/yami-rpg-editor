'use strict'

// 更新装备数据
Updater.updateEquipments = function (verNum) {
	// 更新到1.0.122版本：添加inherit属性
	if (verNum < Updater.getVersionNumber('1.0.122')) {
		const equipments = Data.equipments
		const keys = Object.keys(Inspector.fileEquipment.create())
		for (const [guid, sEquipment] of Object.entries(equipments)) {
			const meta = Data.manifest.guidMap[guid]
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`)
			}
			const dEquipment = Inspector.fileEquipment.create()
			for (const key of keys) {
				if (key in sEquipment) {
					dEquipment[key] = sEquipment[key]
				}
			}
			equipments[guid] = dEquipment
			File.planToSave(meta)
		}
	}
}
