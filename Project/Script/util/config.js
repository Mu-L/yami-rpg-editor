'use strict'

const require = window.__nodeRequire || window.require
export const Path = require('path')

// const GlobalPathForDir = require('electron').ipcRenderer.sendSync(
// 	'get-dir-path-sync',
// 	'app-data'
// )
// const ConfigDir = 'Open Yami RPG Editor'
export const GlobalPathForDir = require('os').homedir()
export const ConfigDir = '.openyami'
export const GlobalPath = Path.resolve(GlobalPathForDir, ConfigDir)

// ******************************** 读取配置文件 ********************************

{
	const dir = require('path').resolve(GlobalPath)
	if (!require('fs').existsSync(dir)) {
		require('fs').mkdirSync(dir, { recursive: true })
	}
	// 提前读取配置文件以减少等待时间
	// promise.then的执行顺序在main.js之后
	const path = require('path').resolve(GlobalPath, 'config.json')
	window.config = require('fs')
		.promises.readFile(path, 'utf8')
		.then((json) => JSON.parse(json))
		.catch(() => {
			// 如果不存在配置文件或加载出错
			return File.get({
				local: 'default.json',
				type: 'json'
			}).then((config) => {
				// 设置默认配置属性
				config.theme = 'dark'
				config.language = ''
				config.project = ''
				config.recent = []
				config.scriptEditor = {
					mode: 'by-file-extension',
					path: ''
				}
				return require('electron')
					.ipcRenderer.invoke('get-dir-path', 'documents')
					.catch((error) => 'C:')
					.then((path) => {
						for (const key of Object.keys(config.dialogs)) {
							config.dialogs[key] = Path.slash(path)
						}
						return config
					})
			})
		})
}

window.Path = Path
window.GlobalPathForDir = GlobalPathForDir
window.ConfigDir = ConfigDir
window.GlobalPath = GlobalPath
