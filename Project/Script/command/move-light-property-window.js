'use strict'

import { createPropertyWindow } from './property-window-factory.js'

// ******************************** 移动光源 - 属性窗口 ********************************

export const LightProperty = createPropertyWindow({
	prefix: 'moveLight',
	locale: 'command.moveLight',
	keys: [
		{ name: 'X', value: 'x', default: 0 },
		{ name: 'Y', value: 'y', default: 0 },
		{ name: 'Range', value: 'range', default: 1 },
		{ name: 'Intensity', value: 'intensity', default: 0.5 },
		{ name: 'Anchor X', value: 'anchorX', default: 0.5 },
		{ name: 'Anchor Y', value: 'anchorY', default: 0.5 },
		{ name: 'Width', value: 'width', default: 1 },
		{ name: 'Height', value: 'height', default: 1 },
		{ name: 'Angle', value: 'angle', default: 0 },
		{ name: 'Red', value: 'red', default: 0 },
		{ name: 'Green', value: 'green', default: 0 },
		{ name: 'Blue', value: 'blue', default: 0 }
	],
	parseValue: (key, value) => Command.parseVariableNumber(value)
})

window.LightProperty = LightProperty
