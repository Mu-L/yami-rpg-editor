'use strict'

import { $ } from '../util/dom.js'
import { createPropertyWindow } from './property-window-factory.js'
import { Command } from './command-object.js'

// ******************************** 设置图像 - 属性窗口 ********************************

export const ImageProperty = createPropertyWindow({
	prefix: 'setImage',
	locale: 'command.setImage',
	keys: [
		{ name: 'Image', value: 'image', default: '' },
		{ name: 'Display', value: 'display', default: 'stretch' },
		{ name: 'Flip', value: 'flip', default: 'none' },
		{ name: 'Blend', value: 'blend', default: 'normal' },
		{ name: 'Shift X', value: 'shiftX', default: 0 },
		{ name: 'Shift Y', value: 'shiftY', default: 0 },
		{ name: 'Clip X', value: 'clip-0', default: 0 },
		{ name: 'Clip Y', value: 'clip-1', default: 0 },
		{ name: 'Clip Width', value: 'clip-2', default: 0 },
		{ name: 'Clip Height', value: 'clip-3', default: 0 }
	],
	init() {
		$('#setImage-property-display').loadItems(
			$('#uiImage-display').dataItems
		)
		$('#setImage-property-flip').loadItems($('#uiImage-flip').dataItems)
		$('#setImage-property-blend').loadItems($('#uiImage-blend').dataItems)
	},
	parsers: {
		image: (value) => Command.parseFileName(value),
		display: (value, get) => get('display.' + value),
		flip: (value, get) => get('flip.' + value),
		blend: (value) => Command.parseBlend(value),
		shiftX: (value) => Command.parseVariableNumber(value),
		shiftY: (value) => Command.parseVariableNumber(value),
		'clip-0': (value) => Command.parseVariableNumber(value),
		'clip-1': (value) => Command.parseVariableNumber(value),
		'clip-2': (value) => Command.parseVariableNumber(value),
		'clip-3': (value) => Command.parseVariableNumber(value)
	}
})
