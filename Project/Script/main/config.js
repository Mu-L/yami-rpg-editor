'use strict'

// 保存配置文件
Editor.saveConfig = function () {
	const { config } = this
	if (!config) {
		return
	}
	try {
		Title.saveToConfig(config)
		Layout.saveToConfig(config)
		Scene.saveToConfig(config)
		UI.saveToConfig(config)
		Animation.saveToConfig(config)
		Particle.saveToConfig(config)

		// 写入配置文件
		const json = JSON.stringify(config, null, 2)
		const last = config.code
		if (json && json !== last) {
			const path = Path.resolve(GlobalPath, 'config.json')
			FSP.writeFile(path, json).catch((error) => {
				Log.throw(error)
			})
		}
	} catch (error) {
		Log.throw(error)
	}
}

// 加载配置文件
Editor.loadConfig = function () {
	const { config } = this
	Title.loadFromConfig(config)
	Layout.loadFromConfig(config)
	Scene.loadFromConfig(config)
	UI.loadFromConfig(config)
	Animation.loadFromConfig(config)
	Particle.loadFromConfig(config)
}
