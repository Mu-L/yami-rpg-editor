import { $, getElementReader } from '@/util/dom.ts';
import { VariableGetter } from './variable-accessor-window.ts';
import { Window } from '@/tools/window-object.ts';

export const StateGetter = {
	target: null,
	initialize: null,
	open: null,
	checkDataForPlugin: null,
	createDefaultForPlugin: null,
	confirm: null
};

StateGetter.initialize = function () {
	$('#stateGetter-type').loadItems([
		{ name: 'Event Trigger State', value: 'trigger' },
		{ name: 'Latest State', value: 'latest' },
		{ name: 'By State ID', value: 'by-id' },
		{ name: 'Variable', value: 'variable' }
	]);

	$('#stateGetter-type')
		.enableHiddenMode()
		.relate([
			{
				case: 'by-id',
				targets: [$('#stateGetter-actor'), $('#stateGetter-stateId')]
			},
			{ case: 'variable', targets: [$('#stateGetter-variable')] }
		]);

	$('#stateGetter-confirm').on('click', this.confirm);
};

StateGetter.open = function (target) {
	this.target = target;
	Window.open('stateGetter');

	let actor = { type: 'trigger' };
	let stateId = '';
	let variable = { type: 'local', key: '' };
	const state = target.dataValue;
	switch (state.type) {
		case 'trigger':
		case 'latest':
			break;
		case 'by-id':
			actor = state.actor;
			stateId = state.stateId;
			break;
		case 'variable':
			variable = state.variable;
			break;
	}
	$('#stateGetter-type').write(state.type);
	$('#stateGetter-actor').write(actor);
	$('#stateGetter-stateId').write(stateId);
	$('#stateGetter-variable').write(variable);
	$('#stateGetter-type').getFocus();
};

StateGetter.checkDataForPlugin = function (data) {
	if (data instanceof Object) {
		return data.getter === 'state';
	}
	return false;
};

StateGetter.createDefaultForPlugin = function () {
	return { getter: 'state', type: 'trigger' };
};

StateGetter.confirm = function (event) {
	const read = getElementReader('stateGetter');
	const type = read('type');
	let getter;
	switch (type) {
		case 'trigger':
		case 'latest':
			getter = { type };
			break;
		case 'by-id': {
			const actor = read('actor');
			const stateId = read('stateId');
			if (stateId === '') {
				return $('#stateGetter-stateId').getFocus();
			}
			getter = { type, actor, stateId };
			break;
		}
		case 'variable': {
			const variable = read('variable');
			if (VariableGetter.isNone(variable)) {
				return $('#stateGetter-variable').getFocus();
			}
			getter = { type, variable };
			break;
		}
	}
	if (this.target.isPluginInput) {
		getter = { getter: 'state', ...getter };
	}
	this.target.input(getter);
	Window.close('stateGetter');
}.bind(StateGetter);
