import { $ } from '@/util/dom.ts';
import { Window } from './window-object.ts';

export const Rename = {
	callback: null,
	initialize: null,
	open: null,
	windowClosed: null,
	confirm: null
};

Rename.initialize = function () {
	$('#rename').on('closed', this.windowClosed);
	$('#rename-confirm').on('click', this.confirm);
};

Rename.open = function (name, callback) {
	this.callback = callback;
	Window.open('rename');
	$('#rename-name').write(name);
	$('#rename-name').getFocus('all');
};

Rename.windowClosed = function (event) {
	this.callback = null;
}.bind(Rename);

Rename.confirm = function (event) {
	this.callback($('#rename-name').read());
	Window.close('rename');
}.bind(Rename);
