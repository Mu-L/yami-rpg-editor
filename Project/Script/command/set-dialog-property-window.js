'use strict'

import { createPropertyWindow } from './property-window-factory.js'

// ******************************** 设置对话框 - 属性窗口 ********************************

const dialogEffectRelate = [
	{
		case: 'shadow',
		targets: [
			'effect-shadowOffsetX',
			'effect-shadowOffsetY',
			'effect-color'
		]
	},
	{
		case: 'stroke',
		targets: ['effect-strokeWidth', 'effect-color']
	},
	{
		case: 'outline',
		targets: ['effect-color']
	}
]

export const DialogBoxProperty = createPropertyWindow({
	prefix: 'setDialogBox',
	locale: 'command.setDialogBox',
	keys: [
		{ name: 'Content', value: 'content', default: '' },
		{ name: 'Print Interval', value: 'interval', default: 0 },
		{ name: 'Size', value: 'size', default: 16 },
		{ name: 'Line Spacing', value: 'lineSpacing', default: 0 },
		{ name: 'Letter Spacing', value: 'letterSpacing', default: 0 },
		{ name: 'Color', value: 'color', default: 'ffffffff' },
		{ name: 'Font', value: 'font', default: '' },
		{
			name: 'Effect',
			value: 'effect',
			targets: ['effect-type'],
			default: 'none'
		},
		{ name: 'Blend', value: 'blend', default: 'normal' }
	],
	subRelates: [{ selector: 'effect-type', cases: dialogEffectRelate }],
	init() {
		$('#setDialogBox-property-effect-type').loadItems(
			$('#uiDialogBox-effect-type').dataItems
		)
		$('#setDialogBox-property-blend').loadItems(
			$('#uiDialogBox-blend').dataItems
		)
	},
	openData(defaults, key, value) {
		if (key === 'effect') {
			defaults['effect-type'] = value.type
			defaults['effect-shadowOffsetX'] = value.shadowOffsetX ?? 1
			defaults['effect-shadowOffsetY'] = value.shadowOffsetY ?? 1
			defaults['effect-strokeWidth'] = value.strokeWidth ?? 1
			defaults['effect-color'] = value.color ?? '000000ff'
		} else {
			defaults[key] = value
		}
	},
	saveData(key, read) {
		if (key === 'effect') {
			switch (read('effect-type')) {
				case 'none':
					return { type: 'none' }
				case 'shadow':
					return {
						type: 'shadow',
						shadowOffsetX: read('effect-shadowOffsetX'),
						shadowOffsetY: read('effect-shadowOffsetY'),
						color: read('effect-color')
					}
				case 'stroke':
					return {
						type: 'stroke',
						strokeWidth: read('effect-strokeWidth'),
						color: read('effect-color')
					}
				case 'outline':
					return {
						type: 'outline',
						color: read('effect-color')
					}
			}
		}
		return read(key)
	},
	parsers: {
		content: (value) => Command.parseVariableTemplate(value),
		interval: (value) => Command.setNumberColor(value),
		size: (value) => Command.setNumberColor(value),
		lineSpacing: (value) => Command.setNumberColor(value),
		letterSpacing: (value) => Command.setNumberColor(value),
		color: (value) => Command.parseHexColor(Color.simplifyHexColor(value)),
		font: (value, get) =>
			value ? Command.setStringColor(value) : get('font.default'),
		effect: (value, get, name) => {
			switch (value.type) {
				case 'none':
					return name + Token('(') + get('effect.none') + Token(')')
				case 'shadow': {
					const x = Command.setNumberColor(value.shadowOffsetX)
					const y = Command.setNumberColor(value.shadowOffsetY)
					const color = Command.parseHexColor(
						Color.simplifyHexColor(value.color)
					)
					return (
						name +
						Token('(') +
						get('effect.shadow') +
						Token(', ') +
						x +
						Token(', ') +
						y +
						Token(', ') +
						color +
						Token(')')
					)
				}
				case 'stroke': {
					const width = Command.setNumberColor(value.strokeWidth)
					const color = Command.parseHexColor(
						Color.simplifyHexColor(value.color)
					)
					return (
						name +
						Token('(') +
						get('effect.stroke') +
						Token(', ') +
						width +
						Token(', ') +
						color +
						Token(')')
					)
				}
				case 'outline': {
					const color = Command.parseHexColor(
						Color.simplifyHexColor(value.color)
					)
					return (
						name +
						Token('(') +
						get('effect.outline') +
						Token(', ') +
						color +
						Token(')')
					)
				}
			}
		},
		blend: (value) => Command.parseBlend(value)
	}
})

window.DialogBoxProperty = DialogBoxProperty
