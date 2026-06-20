'use strict'

// 创建本地化数据
Updater.createLocalization = async function (verNum) {
	if (verNum < Updater.getVersionNumber('1.0.54')) {
		const path = File.route('Data/localization.json')
		const json = JSON.stringify({ list: [] }, null, 2)
		await FSP.writeFile(path, json)
	}
}
