'use strict'

import { createPropertyWindow } from './property-window-factory.js'

// ******************************** 设置窗口 - 属性窗口 ********************************

export const WindowProperty = createPropertyWindow({
	prefix: 'setWindow',
	locale: 'command.setWindow',
	keys: [
		{ name: 'Scroll X', value: 'scrollX', default: 0 },
		{ name: 'Scroll Y', value: 'scrollY', default: 0 },
		{ name: 'Grid Width', value: 'gridWidth', default: 0 },
		{ name: 'Grid Height', value: 'gridHeight', default: 0 },
		{ name: 'Grid Gap X', value: 'gridGapX', default: 0 },
		{ name: 'Grid Gap Y', value: 'gridGapY', default: 0 },
		{ name: 'Padding X', value: 'paddingX', default: 0 },
		{ name: 'Padding Y', value: 'paddingY', default: 0 }
	],
	parseValue: (key, value) => Command.parseVariableNumber(value)
})

window.WindowProperty = WindowProperty
