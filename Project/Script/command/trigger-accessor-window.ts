import { $, getElementReader } from '@/util/dom.ts';
import { VariableGetter } from './variable-accessor-window.ts';
import { Window } from '@/tools/window-object.ts';

export const TriggerGetter = {
	target: null,
	initialize: null,
	open: null,
	confirm: null
};

TriggerGetter.initialize = function () {
	$('#triggerGetter-type').loadItems([
		{ name: 'Event Trigger', value: 'trigger' },
		{ name: 'Latest Trigger', value: 'latest' },
		{ name: 'Variable', value: 'variable' }
	]);

	$('#triggerGetter-type')
		.enableHiddenMode()
		.relate([{ case: 'variable', targets: [$('#triggerGetter-variable')] }]);

	$('#triggerGetter-confirm').on('click', this.confirm);
};

TriggerGetter.open = function (target) {
	this.target = target;
	Window.open('triggerGetter');

	let variable = { type: 'local', key: '' };
	const trigger = target.dataValue;
	switch (trigger.type) {
		case 'trigger':
		case 'latest':
			break;
		case 'variable':
			variable = trigger.variable;
			break;
	}
	$('#triggerGetter-type').write(trigger.type);
	$('#triggerGetter-variable').write(variable);
	$('#triggerGetter-type').getFocus();
};

TriggerGetter.confirm = function (event) {
	const read = getElementReader('triggerGetter');
	const type = read('type');
	let getter;
	switch (type) {
		case 'trigger':
		case 'latest':
			getter = { type };
			break;
		case 'variable': {
			const variable = read('variable');
			if (VariableGetter.isNone(variable)) {
				return $('#triggerGetter-variable').getFocus();
			}
			getter = { type, variable };
			break;
		}
	}
	this.target.input(getter);
	Window.close('triggerGetter');
}.bind(TriggerGetter);
