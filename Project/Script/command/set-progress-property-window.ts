import { $ } from '../util/dom.ts';
import { createPropertyWindow } from './property-window-factory.ts';
import { Command } from './command-object.ts';

export const ProgressBarProperty = createPropertyWindow({
	prefix: 'setProgressBar',
	locale: 'command.setProgressBar',
	keys: [
		{ name: 'Image', value: 'image', default: '' },
		{ name: 'Display', value: 'display', default: 'stretch' },
		{ name: 'Blend', value: 'blend', default: 'normal' },
		{ name: 'Progress', value: 'progress', default: 0 },
		{ name: 'Clip X', value: 'clip-0', default: 0 },
		{ name: 'Clip Y', value: 'clip-1', default: 0 },
		{ name: 'Clip Width', value: 'clip-2', default: 0 },
		{ name: 'Clip Height', value: 'clip-3', default: 0 },
		{ name: 'Color Red', value: 'color-0', default: 0 },
		{ name: 'Color Green', value: 'color-1', default: 0 },
		{ name: 'Color Blue', value: 'color-2', default: 0 },
		{ name: 'Color Alpha', value: 'color-3', default: 0 }
	],
	init() {
		$('#setProgressBar-property-display').loadItems($('#uiProgressBar-display').dataItems);
		$('#setProgressBar-property-blend').loadItems($('#uiProgressBar-blend').dataItems);
	},
	parsers: {
		image: (value) => Command.parseFileName(value),
		display: (value, get) => get('display.' + value),
		blend: (value) => Command.parseBlend(value),
		progress: (value) => Command.parseVariableNumber(value),
		'clip-0': (value) => Command.parseVariableNumber(value),
		'clip-1': (value) => Command.parseVariableNumber(value),
		'clip-2': (value) => Command.parseVariableNumber(value),
		'clip-3': (value) => Command.parseVariableNumber(value),
		'color-0': (value) => Command.parseVariableNumber(value),
		'color-1': (value) => Command.parseVariableNumber(value),
		'color-2': (value) => Command.parseVariableNumber(value),
		'color-3': (value) => Command.parseVariableNumber(value)
	}
});
