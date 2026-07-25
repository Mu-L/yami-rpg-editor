import { $ } from '../util/dom.ts';
import { Window } from '../tools/window-object.ts';

export const SceneShift = {
	callback: null,
	initialize: null,
	open: null,
	windowClosed: null,
	confirm: null
};

SceneShift.initialize = function () {
	$('#scene-shift').on('closed', this.windowClosed);
	$('#scene-shift-confirm').on('click', this.confirm);
};

SceneShift.open = function (callback) {
	this.callback = callback;
	Window.open('scene-shift');
	$('#scene-shift-x').write(0);
	$('#scene-shift-y').write(0);
	$('#scene-shift-x').getFocus('all');
};

SceneShift.windowClosed = function (event) {
	SceneShift.callback = null;
};

SceneShift.confirm = function (event) {
	const x = $('#scene-shift-x').read();
	const y = $('#scene-shift-y').read();
	if (x === 0 && y === 0) {
		return $('#scene-shift-x').getFocus();
	}
	SceneShift.callback(x, y);
	Window.close('scene-shift');
};
