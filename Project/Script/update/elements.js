'use strict'

// 更新元素数据
Updater.updateElements = function (verNum) {
	// 替换界面元素
	const replaceUIElement = (replacer) => {
		// 遍历元素列表中的所有元素
		const forEachElement = (nodes, replacer, meta) => {
			const length = nodes.length
			for (let i = 0; i < length; i++) {
				const node = nodes[i]
				// 如果替换器函数返回对象，则替换原对象
				const replacement = replacer(node)
				if (replacement instanceof Object) {
					nodes[i] = replacement
					// 计划保存界面文件
					File.planToSave(meta)
				}
				// 遍历下一级目录的对象
				if (node.children instanceof Array) {
					forEachElement(node.children, replacer, meta)
				}
			}
		}
		// 遍历所有界面
		for (const [guid, ui] of Object.entries(Data.ui)) {
			const meta = Data.manifest.guidMap[guid]
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`)
			}
			forEachElement(ui.nodes, replacer, meta)
		}
	}
	// 更新到1.0.40版本
	// 添加button.normalClip属性
	// 添加button.hoverClip属性
	// 添加button.activeClip属性
	// 添加button.imageOpacity属性
	if (verNum < Updater.getVersionNumber('1.0.40')) {
		const keys = Object.keys(Inspector.uiButton.create())
		replaceUIElement((sNode) => {
			if (sNode.class === 'button') {
				const dNode = Inspector.uiButton.create()
				for (const key of keys) {
					if (key in sNode) {
						dNode[key] = sNode[key]
						continue
					}
					switch (key) {
						case 'normalClip':
						case 'hoverClip':
						case 'activeClip':
							dNode[key] = sNode.clip.slice()
							continue
						case 'textPadding':
							dNode[key] = sNode.padding
							continue
					}
				}
				return dNode
			}
		})
	}
	// 更新到1.0.61版本
	// 添加element.pointerEvents属性
	if (verNum < Updater.getVersionNumber('1.0.61')) {
		const keysMap = {}
		replaceUIElement((sNode) => {
			let keys = keysMap[sNode.class]
			if (keys === undefined) {
				const type = UI.inspectorTypeMap[sNode.class]
				const node = Inspector[type].create()
				keys = keysMap[sNode.class] = Object.keys(node)
			}
			const dNode = {}
			for (const key of keys) {
				if (key in sNode) {
					dNode[key] = sNode[key]
					continue
				}
				switch (key) {
					case 'pointerEvents':
						dNode[key] = 'enabled'
						continue
				}
			}
			return dNode
		})
	}
	// 更新到1.0.118版本
	// 添加video.playbackRate属性
	if (verNum < Updater.getVersionNumber('1.0.118')) {
		const keys = Object.keys(Inspector.uiVideo.create())
		replaceUIElement((sNode) => {
			if (sNode.class === 'video') {
				const dNode = Inspector.uiVideo.create()
				for (const key of keys) {
					if (key in sNode) {
						dNode[key] = sNode[key]
					}
				}
				return dNode
			}
		})
	}
}
