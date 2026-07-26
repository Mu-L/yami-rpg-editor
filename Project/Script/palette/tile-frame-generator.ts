import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';

export const FrameGenerator = {
	callback: null,
	initialize: null,
	open: null,
	windowClosed: null,
	confirm: null
};

FrameGenerator.initialize = function () {
	$('#autoTile-generateFrames-strideX').write(0);
	$('#autoTile-generateFrames-strideY').write(0);
	$('#autoTile-generateFrames-count').write(1);

	$('#autoTile-generateFrames').on('closed', this.windowClosed);
	$('#autoTile-generateFrames-confirm').on('click', this.confirm);
};

FrameGenerator.open = function (callback) {
	this.callback = callback;
	Window.open('autoTile-generateFrames');
	$('#autoTile-generateFrames-strideX').getFocus('all');
};

FrameGenerator.windowClosed = function () {
	this.callback = null;
}.bind(FrameGenerator);

FrameGenerator.confirm = function () {
	const strideX = $('#autoTile-generateFrames-strideX').read();
	const strideY = $('#autoTile-generateFrames-strideY').read();
	const count = $('#autoTile-generateFrames-count').read();
	if (strideX === 0 && strideY === 0) {
		return $('#autoTile-generateFrames-strideX').getFocus();
	}
	this.callback(strideX, strideY, count);
	Window.close('autoTile-generateFrames');
}.bind(FrameGenerator);
