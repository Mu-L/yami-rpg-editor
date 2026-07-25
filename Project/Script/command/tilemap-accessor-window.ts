import { $, getElementReader } from '../util/dom.ts';
import { VariableGetter } from './variable-accessor-window.ts';
import { PresetObject } from '../tools/scene-preset-window.ts';
import { Window } from '../tools/window-object.ts';

export const TilemapGetter = {
	target: null,
	initialize: null,
	open: null,
	confirm: null
};

TilemapGetter.initialize = function () {
	$('#tilemapGetter-type').loadItems([
		{ name: 'Event Trigger Tilemap', value: 'trigger' },
		{ name: 'By Tilemap ID', value: 'by-id' },
		{ name: 'Variable', value: 'variable' }
	]);

	$('#tilemapGetter-type')
		.enableHiddenMode()
		.relate([
			{ case: 'by-id', targets: [$('#tilemapGetter-presetId')] },
			{ case: 'variable', targets: [$('#tilemapGetter-variable')] }
		]);

	$('#tilemapGetter-confirm').on('click', this.confirm);
};

TilemapGetter.open = function (target) {
	this.target = target;
	Window.open('tilemapGetter');

	let presetId = PresetObject.getDefaultPresetId('tilemap');
	let variable = { type: 'local', key: '' };
	const tilemap = target.dataValue;
	switch (tilemap.type) {
		case 'trigger':
			break;
		case 'by-id':
			presetId = tilemap.presetId;
			break;
		case 'variable':
			variable = tilemap.variable;
			break;
	}
	$('#tilemapGetter-type').write(tilemap.type);
	$('#tilemapGetter-presetId').write(presetId);
	$('#tilemapGetter-variable').write(variable);
	$('#tilemapGetter-type').getFocus();
};

TilemapGetter.confirm = function (event) {
	const read = getElementReader('tilemapGetter');
	const type = read('type');
	let getter;
	switch (type) {
		case 'trigger':
			getter = { type };
			break;
		case 'by-id': {
			const presetId = read('presetId');
			if (presetId === '') {
				return $('#tilemapGetter-presetId').getFocus();
			}
			getter = { type, presetId };
			break;
		}
		case 'variable': {
			const variable = read('variable');
			if (VariableGetter.isNone(variable)) {
				return $('#tilemapGetter-variable').getFocus();
			}
			getter = { type, variable };
			break;
		}
	}
	this.target.input(getter);
	Window.close('tilemapGetter');
}.bind(TilemapGetter);
