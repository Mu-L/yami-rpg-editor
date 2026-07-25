import { $, getElementReader } from '../util/dom.ts';
import { PresetObject } from '../tools/scene-preset-window.ts';
import { Window } from '../tools/window-object.ts';

export const RegionGetter = {
	target: null,
	initialize: null,
	open: null,
	confirm: null
};

RegionGetter.initialize = function () {
	$('#regionGetter-type').loadItems([
		{ name: 'Event Trigger Region', value: 'trigger' },
		{ name: 'By Region ID', value: 'by-id' }
	]);

	$('#regionGetter-type')
		.enableHiddenMode()
		.relate([{ case: 'by-id', targets: [$('#regionGetter-presetId')] }]);

	$('#regionGetter-confirm').on('click', this.confirm);
};

RegionGetter.open = function (target) {
	this.target = target;
	Window.open('regionGetter');

	let presetId = PresetObject.getDefaultPresetId('region');
	const region = target.dataValue;
	switch (region.type) {
		case 'trigger':
			break;
		case 'by-id':
			presetId = region.presetId;
			break;
	}
	$('#regionGetter-type').write(region.type);
	$('#regionGetter-presetId').write(presetId);
	$('#regionGetter-type').getFocus();
};

RegionGetter.confirm = function (event) {
	const read = getElementReader('regionGetter');
	const type = read('type');
	let getter;
	switch (type) {
		case 'trigger':
			getter = { type };
			break;
		case 'by-id': {
			const presetId = read('presetId');
			if (presetId === '') {
				return $('#regionGetter-presetId').getFocus();
			}
			getter = { type, presetId };
			break;
		}
	}
	this.target.input(getter);
	Window.close('regionGetter');
}.bind(RegionGetter);
