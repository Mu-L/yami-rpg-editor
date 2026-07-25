import { $ } from '@/util/dom.ts';
import { Window } from './window-object.ts';

export const SetQuantity = {
	callback: null,
	initialize: null,
	open: null,
	windowClosed: null,
	confirm: null
};

SetQuantity.initialize = function () {
	$('#setQuantity').on('closed', this.windowClosed);
	$('#setQuantity-confirm').on('click', this.confirm);
};

SetQuantity.open = function (quantity, maximum, callback) {
	this.callback = callback;
	Window.open('setQuantity');
	$('#setQuantity-quantity').input.max = maximum;
	$('#setQuantity-quantity').write(quantity);
	$('#setQuantity-quantity').getFocus('all');
};

SetQuantity.windowClosed = function (event) {
	this.callback = null;
}.bind(SetQuantity);

SetQuantity.confirm = function (event) {
	this.callback($('#setQuantity-quantity').read());
	Window.close('setQuantity');
}.bind(SetQuantity);
