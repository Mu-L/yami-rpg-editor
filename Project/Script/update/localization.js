;('use strict')
import { Data } from '../data/data-object.js'
import { File } from '../file/file-system-core.js'
import { FSP } from '../file/file-system.js'
import { Updater } from './updater.js'

// 创建本地化数据
Updater.createLocalization = async function (verNum) {
	if (verNum < Updater.getVersionNumber('1.0.54')) {
		const path = File.path('Data/localization.json')
		const json = JSON.stringify({ list: [] }, null, 2)
		await FSP.writeFile(path, json)
	}
}

import path from 'node:path'
