import { createPropertyWindow } from './property-window-factory.ts';
import { Command } from './command-object.ts';

// ******************************** 移动元素 - 属性窗口 ********************************

export const TransformProperty = createPropertyWindow({
	prefix: 'moveElement',
	locale: 'command.moveElement',
	keys: [
		{ name: 'Anchor X', value: 'anchorX', default: 0 },
		{ name: 'Anchor Y', value: 'anchorY', default: 0 },
		{ name: 'X', value: 'x', default: 0 },
		{ name: 'Y', value: 'y', default: 0 },
		{ name: 'Width', value: 'width', default: 0 },
		{ name: 'Height', value: 'height', default: 0 },
		{ name: 'X2', value: 'x2', default: 0 },
		{ name: 'Y2', value: 'y2', default: 0 },
		{ name: 'Width2', value: 'width2', default: 0 },
		{ name: 'Height2', value: 'height2', default: 0 },
		{ name: 'Rotation', value: 'rotation', default: 0 },
		{ name: 'Scale X', value: 'scaleX', default: 1 },
		{ name: 'Scale Y', value: 'scaleY', default: 1 },
		{ name: 'Skew X', value: 'skewX', default: 0 },
		{ name: 'Skew Y', value: 'skewY', default: 0 },
		{ name: 'Opacity', value: 'opacity', default: 1 }
	],
	parseValue: (key, value) => Command.parseVariableNumber(value)
});
