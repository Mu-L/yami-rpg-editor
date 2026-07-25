import { $ } from '@/util/dom.ts';
import { Window } from './window-object.ts';

export const SetKey = {
	callback: null,
	initialize: null,
	open: null,
	windowClosed: null,
	confirm: null
};

SetKey.initialize = function () {
	$('#setKey').on('closed', this.windowClosed);
	$('#setKey-confirm').on('click', this.confirm);
};

SetKey.open = function (key, callback) {
	this.callback = callback;
	Window.open('setKey');
	$('#setKey-key').write(key);
	$('#setKey-key').getFocus('all');
};

SetKey.windowClosed = function (event) {
	this.callback = null;
}.bind(SetKey);

SetKey.confirm = function (event) {
	this.callback($('#setKey-key').read());
	Window.close('setKey');
}.bind(SetKey);
