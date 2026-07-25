import { $, getElementReader } from '@/util/dom.ts';
import { VariableGetter } from './variable-accessor-window.ts';
import { PresetElement } from '@/tools/preset-element-window.ts';
import { Window } from '@/tools/window-object.ts';

export const AncestorGetter = {
	target: null,
	dependsOn: ['ElementGetter'],
	initialize: null,
	open: null,
	confirm: null
};

AncestorGetter.initialize = function () {
	const inclusions = new Set(['trigger', 'latest', 'by-id', 'variable']);
	$('#ancestorGetter-type').loadItems(
		$('#elementGetter-type').dataItems.filter((a) => inclusions.has(a.value))
	);

	$('#ancestorGetter-type')
		.enableHiddenMode()
		.relate([
			{ case: 'by-id', targets: [$('#ancestorGetter-presetId')] },
			{ case: 'variable', targets: [$('#ancestorGetter-variable')] }
		]);

	$('#ancestorGetter-confirm').on('click', this.confirm);
};

AncestorGetter.open = function (target) {
	this.target = target;
	Window.open('ancestorGetter');

	let presetId = PresetElement.getDefaultPresetId();
	let variable = { type: 'local', key: '' };
	const element = target.dataValue;
	switch (element.type) {
		case 'trigger':
		case 'latest':
			break;
		case 'by-id':
			presetId = element.presetId;
			break;
		case 'variable':
			variable = element.variable;
			break;
	}
	$('#ancestorGetter-type').write(element.type);
	$('#ancestorGetter-presetId').write(presetId);
	$('#ancestorGetter-variable').write(variable);
	$('#ancestorGetter-type').getFocus();
};

AncestorGetter.confirm = function (event) {
	const read = getElementReader('ancestorGetter');
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
				return $('#ancestorGetter-presetId').getFocus();
			}
			getter = { type, presetId };
			break;
		}
		case 'variable': {
			const variable = read('variable');
			if (VariableGetter.isNone(variable)) {
				return $('#ancestorGetter-variable').getFocus();
			}
			getter = { type, variable };
			break;
		}
	}
	this.target.input(getter);
	Window.close('ancestorGetter');
}.bind(AncestorGetter);
