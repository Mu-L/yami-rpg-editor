import { $, getElementReader } from '@/util/dom.ts';
import { VariableGetter } from './variable-accessor-window.ts';
import { Enum } from '@/enum/enum-window.ts';
import { Window } from '@/tools/window-object.ts';

export const ItemGetter = {
	target: null,
	initialize: null,
	open: null,
	checkDataForPlugin: null,
	createDefaultForPlugin: null,
	confirm: null
};

ItemGetter.initialize = function () {
	$('#itemGetter-type').loadItems([
		{ name: 'Event Trigger Item', value: 'trigger' },
		{ name: 'Latest Item', value: 'latest' },
		{ name: 'By Shortcut Key', value: 'by-key' },
		{ name: 'By Item ID', value: 'by-id' },
		{ name: 'Variable', value: 'variable' }
	]);

	$('#itemGetter-type')
		.enableHiddenMode()
		.relate([
			{
				case: 'by-key',
				targets: [$('#itemGetter-actor'), $('#itemGetter-key')]
			},
			{
				case: 'by-id',
				targets: [$('#itemGetter-actor'), $('#itemGetter-itemId')]
			},
			{ case: 'variable', targets: [$('#itemGetter-variable')] }
		]);

	$('#itemGetter-confirm').on('click', this.confirm);
};

ItemGetter.open = function (target) {
	this.target = target;
	Window.open('itemGetter');

	$('#itemGetter-key').loadItems(Enum.getStringItems('shortcut-key'));

	let actor = { type: 'trigger' };
	let key = Enum.getDefStringId('shortcut-key');
	let itemId = '';
	let variable = { type: 'local', key: '' };
	const item = target.dataValue;
	switch (item.type) {
		case 'trigger':
		case 'latest':
			break;
		case 'by-key':
			actor = item.actor;
			key = item.key;
			break;
		case 'by-id':
			actor = item.actor;
			itemId = item.itemId;
			break;
		case 'variable':
			variable = item.variable;
			break;
	}
	$('#itemGetter-type').write(item.type);
	$('#itemGetter-actor').write(actor);
	$('#itemGetter-key').write(key);
	$('#itemGetter-itemId').write(itemId);
	$('#itemGetter-variable').write(variable);
	$('#itemGetter-type').getFocus();
};

ItemGetter.checkDataForPlugin = function (data) {
	if (data instanceof Object) {
		return data.getter === 'item';
	}
	return false;
};

ItemGetter.createDefaultForPlugin = function () {
	return { getter: 'item', type: 'trigger' };
};

ItemGetter.confirm = function () {
	const read = getElementReader('itemGetter');
	const type = read('type');
	let getter;
	switch (type) {
		case 'trigger':
		case 'latest':
			getter = { type };
			break;
		case 'by-key': {
			const actor = read('actor');
			const key = read('key');
			if (key === '') {
				return $('#itemGetter-key').getFocus();
			}
			getter = { type, actor, key };
			break;
		}
		case 'by-id': {
			const actor = read('actor');
			const itemId = read('itemId');
			if (itemId === '') {
				return $('#itemGetter-itemId').getFocus();
			}
			getter = { type, actor, itemId };
			break;
		}
		case 'variable': {
			const variable = read('variable');
			if (VariableGetter.isNone(variable)) {
				return $('#itemGetter-variable').getFocus();
			}
			getter = { type, variable };
			break;
		}
	}
	if (this.target.isPluginInput) {
		getter = { getter: 'item', ...getter };
	}
	this.target.input(getter);
	Window.close('itemGetter');
}.bind(ItemGetter);
