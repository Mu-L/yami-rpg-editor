import { $, getElementReader } from '@/util/dom.ts';
import { VariableGetter } from './variable-accessor-window.ts';
import { PresetObject } from '@/tools/scene-preset-window.ts';
import { Window } from '@/tools/window-object.ts';

interface AccessorConfig {
	domKey: string;
	presetCategory: string;
	items: { name: string; value: string }[];
	relate: { case: string | string[]; targets: any[] }[];
}

function createPresetAccessor(config: AccessorConfig) {
	const { domKey, presetCategory, items, relate } = config;
	const accessor = {
		target: null,
		initialize: null,
		open: null,
		confirm: null
	} as any;

	accessor.initialize = function () {
		$(`#${domKey}-type`).loadItems(items);
		$(`#${domKey}-type`).enableHiddenMode().relate(relate);
		$(`#${domKey}-confirm`).on('click', this.confirm);
	};

	accessor.open = function (target) {
		this.target = target;
		Window.open(domKey);

		let presetId = PresetObject.getDefaultPresetId(presetCategory);
		let variable = { type: 'local', key: '' };
		const data = target.dataValue;
		switch (data.type) {
			case 'trigger':
			case 'latest':
				break;
			case 'by-id':
				presetId = data.presetId;
				break;
			case 'variable':
				variable = data.variable;
				break;
		}
		$(`#${domKey}-type`).write(data.type);
		$(`#${domKey}-presetId`).write(presetId);
		$(`#${domKey}-variable`).write(variable);
		$(`#${domKey}-type`).getFocus();
	};

	accessor.confirm = function (event) {
		const read = getElementReader(domKey);
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
					return $(`#${domKey}-presetId`).getFocus();
				}
				getter = { type, presetId };
				break;
			}
			case 'variable': {
				const variable = read('variable');
				if (VariableGetter.isNone(variable)) {
					return $(`#${domKey}-variable`).getFocus();
				}
				getter = { type, variable };
				break;
			}
		}
		this.target.input(getter);
		Window.close(domKey);
	}.bind(accessor);

	return accessor;
}

export const LightGetter = createPresetAccessor({
	domKey: 'lightGetter',
	presetCategory: 'light',
	items: [
		{ name: 'Event Trigger Light', value: 'trigger' },
		{ name: 'Latest Light', value: 'latest' },
		{ name: 'By Light ID', value: 'by-id' },
		{ name: 'Variable', value: 'variable' }
	],
	relate: [
		{ case: 'by-id', targets: [$('#lightGetter-presetId')] },
		{ case: 'variable', targets: [$('#lightGetter-variable')] }
	]
});

export const ObjectGetter = createPresetAccessor({
	domKey: 'objectGetter',
	presetCategory: 'any',
	items: [
		{ name: 'Event Trigger Object', value: 'trigger' },
		{ name: 'Latest Scene Object', value: 'latest' },
		{ name: 'By Object ID', value: 'by-id' },
		{ name: 'Variable', value: 'variable' }
	],
	relate: [
		{ case: 'by-id', targets: [$('#objectGetter-presetId')] },
		{ case: 'variable', targets: [$('#objectGetter-variable')] }
	]
});
