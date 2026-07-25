import { $, getElementReader } from '../util/dom.ts';
import { Window } from '../tools/window-object.ts';

export const AngleGetter = {
	target: null,
	initialize: null,
	open: null,
	confirm: null
};

AngleGetter.initialize = function () {
	$('#angleGetter-type').loadItems([
		{ name: 'Towards Position', value: 'position' },
		{ name: 'Absolute Angle', value: 'absolute' },
		{ name: 'Relative Angle', value: 'relative' },
		{ name: 'Direction Angle', value: 'direction' },
		{ name: 'Random Angle', value: 'random' }
	]);

	$('#angleGetter-type')
		.enableHiddenMode()
		.relate([
			{
				case: 'position',
				targets: [$('#angleGetter-position-position')]
			},
			{
				case: ['absolute', 'relative', 'direction'],
				targets: [$('#angleGetter-common-degrees')]
			}
		]);

	$('#angleGetter-confirm').on('click', this.confirm);
};

AngleGetter.open = function (target) {
	this.target = target;
	Window.open('angleGetter');

	let positionPosition = { type: 'actor', actor: { type: 'trigger' } };
	let commonDegrees = 0;
	const angle = target.dataValue;
	switch (angle.type) {
		case 'position':
			positionPosition = angle.position;
			break;
		case 'absolute':
		case 'relative':
		case 'direction':
			commonDegrees = angle.degrees;
			break;
		case 'random':
			break;
	}
	$('#angleGetter-type').write(angle.type);
	$('#angleGetter-position-position').write(positionPosition);
	$('#angleGetter-common-degrees').write(commonDegrees);
	$('#angleGetter-type').getFocus();
};

AngleGetter.confirm = function (event) {
	const read = getElementReader('angleGetter');
	const type = read('type');
	let getter;
	switch (type) {
		case 'position': {
			const position = read('position-position');
			getter = { type, position };
			break;
		}
		case 'absolute':
		case 'relative':
		case 'direction': {
			const degrees = read('common-degrees');
			getter = { type, degrees };
			break;
		}
		case 'random':
			getter = { type };
			break;
	}
	this.target.input(getter);
	Window.close('angleGetter');
}.bind(AngleGetter);
