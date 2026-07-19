import { $ } from '../util/dom.js'
import { createPropertyWindow } from './property-window-factory.js'
import { Command } from './command-object.js'
import { Color } from '../tools/color-picker-window.js'

// ******************************** 设置文本框 - 属性窗口 ********************************

export const TextBoxProperty = createPropertyWindow({
	prefix: 'setTextBox',
	locale: 'command.setTextBox',
	keys: [
		{ name: 'Type', value: 'type', default: 'text' },
		{ name: 'Text', value: 'text', default: '' },
		{ name: 'Number', value: 'number', default: 0 },
		{ name: 'Min', value: 'min', default: 0 },
		{ name: 'Max', value: 'max', default: 0 },
		{ name: 'Decimal Places', value: 'decimals', default: 0 },
		{ name: 'Color', value: 'color', default: 'ffffffff' }
	],
	init() {
		$('#setTextBox-property-type').loadItems($('#uiTextBox-type').dataItems)
	},
	parsers: {
		type: (value, get) => get('type.' + value),
		text: (value) => {
			let text = value
			if (typeof text === 'string' && text.length > 80) {
				text = text.slice(0, 80) + '...'
			}
			return Command.parseVariableString(text)
		},
		number: (value) => Command.parseVariableNumber(value),
		min: (value) => Command.parseVariableNumber(value),
		max: (value) => Command.parseVariableNumber(value),
		decimals: (value) => Command.setNumberColor(value),
		color: (value) => Command.parseHexColor(Color.simplifyHexColor(value))
	}
})
