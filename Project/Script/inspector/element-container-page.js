import { Inspector } from './inspector.js'
import { UI } from '../ui/ui-window.js'

// ******************************** 元素 - 容器页面 ********************************

{
	const UIContainer = {
		// properties
		owner: UI,
		target: null,
		// methods
		create: null,
		open: null,
		close: null
	}

	// 创建容器
	UIContainer.create = function () {
		const transform = Inspector.uiElement.createTransform()
		transform.width = 100
		transform.height = 100
		return {
			class: 'container',
			name: 'Container',
			enabled: true,
			expanded: false,
			hidden: false,
			locked: false,
			presetId: '',
			pointerEvents: 'enabled',
			transform: transform,
			events: [],
			scripts: [],
			children: []
		}
	}

	// 打开数据
	UIContainer.open = function (node) {
		if (this.target !== node) {
			this.target = node
			Inspector.uiElement.open(node)
		}
	}

	// 关闭数据
	UIContainer.close = function () {
		if (this.target) {
			UI.list.unselect(this.target)
			UI.updateTarget()
			Inspector.uiElement.close()
			this.target = null
		}
	}

	Inspector.uiContainer = UIContainer
}
