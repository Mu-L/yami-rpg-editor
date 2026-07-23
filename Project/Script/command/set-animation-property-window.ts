import { createPropertyWindow } from './property-window-factory.ts';
import { Command } from './command-object.ts';

// ******************************** 设置动画 - 属性窗口 ********************************

export const AnimationProperty = createPropertyWindow({
	prefix: 'setAnimation',
	locale: 'command.setAnimation',
	keys: [
		{ name: 'Animation', value: 'animation', default: '' },
		{
			name: 'Animation(from actor)',
			value: 'animation-from-actor',
			uiName: 'actor',
			default: { type: 'trigger' }
		},
		{ name: 'Motion', value: 'motion', default: '' },
		{ name: 'Angle', value: 'angle', default: 0 },
		{ name: 'Frame', value: 'frame', default: 0 }
	],
	parsers: {
		animation: (value) => Command.parseFileName(value),
		'animation-from-actor': (value) => Command.parseActor(value),
		motion: (value) => Command.parseEnumString(value),
		angle: (value) => Command.parseVariableNumber(value),
		frame: (value) => Command.parseVariableNumber(value)
	}
});
