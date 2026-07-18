'use strict'
import { $, getElementWriter } from '../util/dom.js'
import { Inspector } from './inspector.js'
import { Reference } from '../log/related-references.js'
import { UI } from '../ui/ui-window.js'

// ******************************** 元素 - 引用页面 ********************************

{
	const UIReference = {
		// properties
		owner: UI,
		target: null,
		// methods
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		// events
		paramInput: null
	}

	// 初始化
	UIReference.initialize = function () {
		// 侦听事件
		const elements = $('#uiReference-prefabId, #uiReference-synchronous')
		elements.on('input', this.paramInput)
		elements.on('focus', Inspector.inputFocus)
		elements.on('blur', Inspector.inputBlur(this, UI))
	}

	// 创建引用
	UIReference.create = function () {
		const transform = Inspector.uiElement.createTransform()
		transform.width = 100
		transform.height = 100
		return {
			class: 'reference',
			name: 'Reference',
			enabled: true,
			expanded: false,
			hidden: false,
			locked: false,
			presetId: '',
			prefabId: '',
			synchronous: false,
			transform: transform,
			events: [],
			scripts: [],
			children: []
		}
	}

	// 打开数据
	UIReference.open = function (node) {
		if (this.target !== node) {
			this.target = node

			// 写入数据
			const write = getElementWriter('uiReference', node)
			write('prefabId')
			write('synchronous')
			Inspector.uiElement.open(node)
		}
	}

	// 关闭数据
	UIReference.close = function () {
		if (this.target) {
			UI.list.unselect(this.target)
			UI.updateTarget()
			Inspector.uiElement.close()
			this.target = null
		}
	}

	// 更新数据
	UIReference.update = function (node, key, value) {
		UI.planToSave()
		// const element = node.instance
		switch (key) {
			case 'prefabId':
				if (node[key] !== value) {
					node[key] = value
					// element[key] = value
					node.instance.historyEnabled = true
					node.instances.set(key, value)
					node.instance.historyEnabled = false
					UI.list.updateIcon(node)
				}
				break
			case 'synchronous':
				if (node[key] !== value) {
					node[key] = value
					node.instance.historyEnabled = true
					node.instances.set(key, value)
					node.instance.historyEnabled = false
				}
				break
		}
		UI.requestRendering()
	}

	// 参数 - 输入事件
	UIReference.paramInput = function (event) {
		UIReference.update(
			UIReference.target,
			Inspector.getKey(this),
			this.read()
		)
	}

	Inspector.uiReference = UIReference
}
