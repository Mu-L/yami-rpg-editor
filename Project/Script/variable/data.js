'use strict'
import { Data } from '../data/data-object.js'
import { File } from '../file/file-system-core.js'
import { Variable } from './variable.js'

// 解包变量数据
Variable.unpackVariables = (function IIFE() {
	// 使用引用文件夹类来保存展开状态
	class ReferencedFolder {
		constructor(item) {
			this.data = item
			this.class = item.class
			this.name = item.name
			this.children = clone(item.children)
		}

		// 读取展开状态
		get expanded() {
			return this.data.expanded
		}

		// 写入展开状态
		set expanded(value) {
			this.data.expanded = value
			File.planToSave(Data.manifest.project.variables)
		}
	}
	const clone = (items) => {
		const length = items.length
		const copies = new Array(length)
		for (let i = 0; i < length; i++) {
			const item = items[i]
			if (item.class !== 'folder') {
				Variable.idMap[item.id] = true
				copies[i] = Object.clone(item)
			} else {
				copies[i] = new ReferencedFolder(item)
			}
		}
		return copies
	}
	return function () {
		this.idMap = {}
		this.data = clone(Data.variables)
	}
})()

// 打包变量数据
Variable.packVariables = (function IIFE() {
	const clone = (items) => {
		const length = items.length
		const copies = new Array(length)
		for (let i = 0; i < length; i++) {
			const item = items[i]
			if (item.class !== 'folder') {
				copies[i] = Object.clone(item)
			} else {
				copies[i] = {
					class: item.class,
					name: item.name,
					expanded: item.expanded,
					children: clone(item.children)
				}
			}
		}
		return copies
	}
	return function () {
		Data.variables = clone(this.data)
		Data.createVariableMap()
	}
})()
