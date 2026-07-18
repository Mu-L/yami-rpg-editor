'use strict'
import { $, getElementWriter } from '../util/dom.js'
import { Animation } from '../animation/animation-window.js'
import { Inspector } from './inspector.js'
import { UI } from '../ui/ui-window.js'

// ******************************** 元素 - 动画页面 ********************************

{
	const UIAnimation = {
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
		paramInput: null,
		animationIdWrite: null
	}

	// 初始化
	UIAnimation.initialize = function () {
		// 侦听事件
		$('#uiAnimation-animation').on('write', this.animationIdWrite)
		const elements = $(`#uiAnimation-animation, #uiAnimation-motion,
    #uiAnimation-autoplay, #uiAnimation-rotatable, #uiAnimation-angle,
    #uiAnimation-frame, #uiAnimation-offsetX, #uiAnimation-offsetY`)
		elements.on('input', this.paramInput)
		elements.on('focus', Inspector.inputFocus)
		elements.on('blur', Inspector.inputBlur(this, UI))
	}

	// 创建动画
	UIAnimation.create = function () {
		const transform = Inspector.uiElement.createTransform()
		transform.width = 100
		transform.height = 100
		return {
			class: 'animation',
			name: 'Animation',
			enabled: true,
			expanded: false,
			hidden: false,
			locked: false,
			presetId: '',
			animation: '',
			motion: '',
			autoplay: true,
			rotatable: false,
			angle: 0,
			frame: 0,
			offsetX: 0,
			offsetY: 0,
			pointerEvents: 'enabled',
			transform: transform,
			events: [],
			scripts: [],
			children: []
		}
	}

	// 打开数据
	UIAnimation.open = function (node) {
		if (this.target !== node) {
			this.target = node

			// 写入数据
			const write = getElementWriter('uiAnimation', node)
			write('animation')
			write('motion')
			write('autoplay')
			write('rotatable')
			write('angle')
			write('frame')
			write('offsetX')
			write('offsetY')
			Inspector.uiElement.open(node)
		}
	}

	// 关闭数据
	UIAnimation.close = function () {
		if (this.target) {
			UI.list.unselect(this.target)
			UI.updateTarget()
			Inspector.uiElement.close()
			this.target = null
		}
	}

	// 更新数据
	UIAnimation.update = function (node, key, value) {
		UI.planToSave()
		// const element = node.instance
		switch (key) {
			case 'animation':
			case 'motion':
			case 'autoplay':
			case 'rotatable':
			case 'angle':
			case 'frame':
			case 'offsetX':
			case 'offsetY':
				if (node[key] !== value) {
					node[key] = value
					// element[key] = value
					node.instances.set(key, value)
				}
				break
		}
		UI.requestRendering()
	}

	// 参数 - 输入事件
	UIAnimation.paramInput = function (event) {
		UIAnimation.update(
			UIAnimation.target,
			Inspector.getKey(this),
			this.read()
		)
	}

	// 动画ID - 写入事件
	UIAnimation.animationIdWrite = function (event) {
		const elMotion = $('#uiAnimation-motion')
		elMotion.loadItems(Animation.getMotionListItems(event.value))
		elMotion.write(elMotion.read())
	}

	Inspector.uiAnimation = UIAnimation
}
