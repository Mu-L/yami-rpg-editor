import { $, getElementReader } from '@/util/dom.ts';
import { VariableGetter } from './variable-accessor-window.ts';
import { PresetObject } from '@/tools/scene-preset-window.ts';
import { Window } from '@/tools/window-object.ts';

export const LightGetter = {
	target: null,
	initialize: null,
	open: null,
	confirm: null
};

LightGetter.initialize = function () {
	$('#lightGetter-type').loadItems([
		{ name: 'Event Trigger Light', value: 'trigger' },
		{ name: 'Latest Light', value: 'latest' },
		{ name: 'By Light ID', value: 'by-id' },
		{ name: 'Variable', value: 'variable' }
	]);

	$('#lightGetter-type')
		.enableHiddenMode()
		.relate([
			{ case: 'by-id', targets: [$('#lightGetter-presetId')] },
			{ case: 'variable', targets: [$('#lightGetter-variable')] }
		]);

	$('#lightGetter-confirm').on('click', this.confirm);
};

LightGetter.open = function (target) {
	this.target = target;
	Window.open('lightGetter');

	let presetId = PresetObject.getDefaultPresetId('light');
	let variable = { type: 'local', key: '' };
	const light = target.dataValue;
	switch (light.type) {
		case 'trigger':
		case 'latest':
			break;
		case 'by-id':
			presetId = light.presetId;
			break;
		case 'variable':
			variable = light.variable;
			break;
	}
	$('#lightGetter-type').write(light.type);
	$('#lightGetter-presetId').write(presetId);
	$('#lightGetter-variable').write(variable);
	$('#lightGetter-type').getFocus();
};

LightGetter.confirm = function () {
	const read = getElementReader('lightGetter');
	const type = read('type');
	let getter;
	switch (type) {
		case 'trigger':
		case 'latest':
			getter = { type };
			break;
		case 'by-id': {
			const presetId = read('presetId');
			if (presetId === '') {
				return $('#lightGetter-presetId').getFocus();
			}
			getter = { type, presetId };
			break;
		}
		case 'variable': {
			const variable = read('variable');
			if (VariableGetter.isNone(variable)) {
				return $('#lightGetter-variable').getFocus();
			}
			getter = { type, variable };
			break;
		}
	}
	this.target.input(getter);
	Window.close('lightGetter');
}.bind(LightGetter);
