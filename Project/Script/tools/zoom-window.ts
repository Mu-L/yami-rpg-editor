import { $ } from '@/util/dom.ts';
import { Window } from './window-object.ts';
import { Editor } from '@/main/editor.ts';
import { webFrame } from 'electron';

export const Zoom = {
	initialize: null,
	getFactor: null,
	open: null,
	confirm: null
};

Zoom.initialize = function () {
	$('#zoom-confirm').on('click', this.confirm);
};

Zoom.open = function () {
	Window.open('zoom');
	$('#zoom-factor').write(this.getFactor());
	$('#zoom-factor').getFocus('all');
};

Zoom.getFactor = function () {
	return webFrame.getZoomFactor();
};

Zoom.confirm = function (event) {
	Window.close('zoom');
	webFrame.setZoomFactor((Editor.config.zoom = $('#zoom-factor').read()));
};
