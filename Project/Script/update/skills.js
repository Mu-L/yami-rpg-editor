'use strict'
import { Data } from '../data/data-object.js'
import { File } from '../file/file-system-core.js'
import { Inspector } from '../inspector/inspector.js'
import { Updater } from './updater.js'

// 更新技能数据
Updater.updateSkills = function (verNum) {
	// 更新到1.0.122版本：添加inherit属性
	if (verNum < Updater.getVersionNumber('1.0.122')) {
		const skills = Data.skills
		const keys = Object.keys(Inspector.fileSkill.create())
		for (const [guid, sSkill] of Object.entries(skills)) {
			const meta = Data.manifest.guidMap[guid]
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`)
			}
			const dSkill = Inspector.fileSkill.create()
			for (const key of keys) {
				if (key in sSkill) {
					dSkill[key] = sSkill[key]
				}
			}
			skills[guid] = dSkill
			File.planToSave(meta)
		}
	}
}
