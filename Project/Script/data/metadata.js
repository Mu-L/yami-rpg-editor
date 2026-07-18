const require = window.__nodeRequire || window.require
;('use strict')
import { Data } from './data-object.js'
import { FileItem } from '../file/file-item.js'
import { File } from '../file/file-system-core.js'
import { GUID } from '../file/guid.js'
import { Updater } from '../update/updater.js'

// ******************************** 元数据类 ********************************

export const Meta = (function IIFE() {
	// 类型到分组名称映射表
	const typeMapToGroupName = {
		...FileItem.dataMapNames,
		image: 'images',
		audio: 'audio',
		video: 'videos',
		script: 'script',
		font: 'fonts',
		other: 'others'
	}
	const loaderDescriptor = { path: null, type: 'json' }
	const fileDescriptor = { writable: true, value: null }
	const guidDescriptor = { writable: true, value: '' }
	const codeDescriptor = { writable: true, value: '' }
	const groupDescriptor = { value: null }
	const dataMapDescriptor = { value: null }
	const descriptors = {
		file: fileDescriptor,
		guid: guidDescriptor,
		group: groupDescriptor,
		mtimeMs: { writable: true, value: null },
		versionId: { writable: true, value: -1 }
	}
	return class FileMeta {
		path //:string
		size //:number

		constructor(file, guid) {
			const { type, path } = file
			this.path = path
			this.size = Number(file.stats.size)

			// 特殊类型额外附加属性
			switch (type) {
				case 'scene':
					this.x = 10
					this.y = 10
					break
				case 'tileset':
					this.x = 0
					this.y = 0
					break
				case 'script':
					this.parameters = Array.empty
					Object.defineProperty(this, 'code', codeDescriptor)
					break
			}

			// 加载数据文件
			const name = FileItem.dataMapNames[type]
			if (name !== undefined) {
				dataMapDescriptor.value = Data[name]
				Object.defineProperty(this, 'dataMap', dataMapDescriptor)

				const promise = file.promise ?? Promise.resolve()
				file.promise = promise
					.then(async () => {
						// 文件重命名后会改变元数据路径
						loaderDescriptor.path = this.path
						const data = await File.get(loaderDescriptor)
						if (data) {
							guidDescriptor.value = guid
							Object.defineProperty(data, 'guid', guidDescriptor)
						}
						this.dataMap[guid] = data
						switch (type) {
							case 'event':
								Updater.updateGlobalEvent(this)
								break
							case 'scene':
								Data.registerScenePresets(guid)
								break
							case 'ui':
								Data.registerUiPresets(guid)
								break
						}
					})
					.catch((error) => {
						console.log(`读取失败: ${error.message}`)
					})
			}

			// 设置其他内容
			const key = typeMapToGroupName[type]
			if (key === undefined) {
				throw new Error('Unknown meta type')
			}
			const { manifest } = Data
			manifest.changed = true
			manifest[key].push(this)
			manifest.metaList.push(this)
			manifest.guidMap[guid] = this
			manifest.pathMap[path] = this
			fileDescriptor.value = file
			guidDescriptor.value = guid
			groupDescriptor.value = manifest[key]
			Object.defineProperties(this, descriptors)
		}

		// 重定向
		redirect(file) {
			if (this.file.type === file.type) {
				this.file = file
				const sPath = this.path
				const dPath = file.path
				if (sPath !== dPath) {
					this.path = dPath
					this.mtimeMs = file.stats.mtimeMs
					const { manifest } = Data
					const { pathMap } = manifest
					if (pathMap[sPath] === this) {
						delete pathMap[sPath]
					}
					pathMap[dPath] = this
					manifest.changed = true
				}
				return true
			}
			return false
		}

		// 尝试修复因项目更新而丢失的GUID
		tryFixGuid(data) {
			if (data.guid === undefined) {
			}
			guidDescriptor.value = this.guid
			Object.defineProperty(data, 'guid', guidDescriptor)
		}

		// 静态 - 版本ID
		static versionId = 0
	}
})()

const path = require('path')
