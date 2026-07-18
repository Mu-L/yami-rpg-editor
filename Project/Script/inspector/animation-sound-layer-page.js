'use strict'
import { $, getElementWriter } from '../util/dom.js'
import { Animation } from '../animation/animation-window.js'
import { Inspector } from './inspector.js'

// ******************************** 动画 - 音效层页面 ********************************

{
	const AnimSoundLayer = {
		// properties
		motion: null,
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
	AnimSoundLayer.initialize = function () {
		// 创建播放速度选项
		$('#animSoundLayer-playbackRate').loadItems([
			{ name: 'Default', value: 'default' },
			{ name: 'Inherit', value: 'inherit' }
		])

		// 侦听事件
		const element = $('#animSoundLayer-playbackRate')
		element.on('input', this.paramInput)
		element.on('focus', Inspector.inputFocus)
		element.on(
			'blur',
			Inspector.inputBlur(this, Animation, (data) => {
				data.type = 'inspector-layer-change'
				data.motion = this.motion
				data.direction = Animation.direction
			})
		)
	}

	// 创建音效层
	AnimSoundLayer.create = function () {
		return {
			class: 'sound',
			name: 'Sound',
			hidden: false,
			locked: false,
			playbackRate: 'default',
			frames: [Inspector.animSoundFrame.create()]
		}
	}

	// 打开数据
	AnimSoundLayer.open = function (layer) {
		if (this.target !== layer) {
			this.target = layer
			this.motion = Animation.motion

			// 写入数据
			const write = getElementWriter('animSoundLayer', layer)
			write('playbackRate')
		}
	}

	// 关闭数据
	AnimSoundLayer.close = function () {
		if (this.target) {
			this.target = null
			this.motion = null
		}
	}

	// 更新数据
	AnimSoundLayer.update = function (layer, key, value) {
		Animation.planToSave()
		switch (key) {
			case 'playbackRate':
				if (layer[key] !== value) {
					layer[key] = value
				}
				break
		}
	}

	// 参数 - 输入事件
	AnimSoundLayer.paramInput = function (event) {
		AnimSoundLayer.update(
			AnimSoundLayer.target,
			Inspector.getKey(this),
			this.read()
		)
	}

	Inspector.animSoundLayer = AnimSoundLayer
}
