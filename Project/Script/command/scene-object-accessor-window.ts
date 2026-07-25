import { $, getElementReader } from '../util/dom.ts';
import { VariableGetter } from './variable-accessor-window.ts';
import { PresetObject } from '../tools/scene-preset-window.ts';
import { Window } from '../tools/window-object.ts';

export const ObjectGetter = {
	target: null,
	initialize: null,
	open: null,
	confirm: null
};

ObjectGetter.initialize = function () {
	$('#objectGetter-type').loadItems([
		{ name: 'Event Trigger Object', value: 'trigger' },
		{ name: 'Latest Scene Object', value: 'latest' },
		{ name: 'By Object ID', value: 'by-id' },
		{ name: 'Variable', value: 'variable' }
	]);

	$('#objectGetter-type')
		.enableHiddenMode()
		.relate([
			{ case: 'by-id', targets: [$('#objectGetter-presetId')] },
			{ case: 'variable', targets: [$('#objectGetter-variable')] }
		]);

	$('#objectGetter-confirm').on('click', this.confirm);
};

ObjectGetter.open = function (target) {
	this.target = target;
	Window.open('objectGetter');

	let presetId = PresetObject.getDefaultPresetId('any');
	let variable = { type: 'local', key: '' };
	const object = target.dataValue;
	switch (object.type) {
		case 'trigger':
		case 'latest':
			break;
		case 'by-id':
			presetId = object.presetId;
			break;
		case 'variable':
			variable = object.variable;
			break;
	}
	$('#objectGetter-type').write(object.type);
	$('#objectGetter-presetId').write(presetId);
	$('#objectGetter-variable').write(variable);
	$('#objectGetter-type').getFocus();
};

ObjectGetter.confirm = function (event) {
	const read = getElementReader('objectGetter');
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
				return $('#objectGetter-presetId').getFocus();
			}
			getter = { type, presetId };
			break;
		}
		case 'variable': {
			const variable = read('variable');
			if (VariableGetter.isNone(variable)) {
				return $('#objectGetter-variable').getFocus();
			}
			getter = { type, variable };
			break;
		}
	}
	this.target.input(getter);
	Window.close('objectGetter');
}.bind(ObjectGetter);
