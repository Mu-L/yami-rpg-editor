;('use strict')
import { Path } from '../util/config.js'
import { Editor } from './editor.js'

// 更新路径
Editor.updatePath = function (path) {
	const { config } = this

	// 设置打开的项目路径
	config.project = path

	// 设置打开对话框路径
	config.dialogs.open = Path.dirname(path)

	// 设置最近的项目路径
	const items = config.recent
	const date = Date.now()
	const item = items.find((a) => a.path === path)
	if (item) {
		item.date = date
		items.remove(item)
		items.unshift(item)
	} else {
		items.unshift({ path, date })
		while (items.length > 3) {
			items.pop()
		}
	}
}

import path from 'node:path'
