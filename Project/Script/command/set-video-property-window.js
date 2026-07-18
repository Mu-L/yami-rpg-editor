'use strict'

import { $ } from '../util/dom.js'
import { createPropertyWindow } from './property-window-factory.js'
import { Command } from './command-object.js'

// ******************************** 设置视频 - 属性窗口 ********************************

export const VideoProperty = createPropertyWindow({
	prefix: 'setVideo',
	locale: 'command.setVideo',
	keys: [
		{ name: 'Video', value: 'video', default: '' },
		{ name: 'Playback Rate', value: 'playbackRate', default: 1 },
		{ name: 'Loop', value: 'loop', default: false },
		{ name: 'Flip', value: 'flip', default: 'none' },
		{ name: 'Blend', value: 'blend', default: 'normal' }
	],
	init() {
		$('#setVideo-property-loop').loadItems($('#uiVideo-loop').dataItems)
		$('#setVideo-property-flip').loadItems($('#uiVideo-flip').dataItems)
		$('#setVideo-property-blend').loadItems($('#uiVideo-blend').dataItems)
	},
	parsers: {
		video: (value) => Command.parseFileName(value),
		playbackRate: (value) => Command.parseVariableNumber(value),
		loop: (value, get) => get('loop.' + value),
		flip: (value, get) => get('flip.' + value),
		blend: (value) => Command.parseBlend(value)
	}
})
