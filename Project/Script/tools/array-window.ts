import { $ } from '@/util/dom.ts';
import { Command } from '@/command/command-object.ts';
import { Local } from './localization.ts';
import { Window } from './window-object.ts';

export const ArrayList = {
	list: $('#arrayList-list'),
	target: null,
	changed: false,
	interface: null,
	initialize: null,
	open: null,
	windowClose: null,
	windowClosed: null,
	listChange: null,
	confirm: null
};

ArrayList.initialize = function () {
	this.list.bind(this.interface);

	$('#arrayList').on('close', this.windowClose);
	$('#arrayList').on('closed', this.windowClosed);
	this.list.on('change', this.listChange);
	$('#arrayList-confirm').on('click', this.confirm);
};

ArrayList.open = function (target) {
	this.target = target;
	const label = target.previousSibling;
	const alias = label.textContent;
	$('#arrayList').setTitle(alias);
	Window.open('arrayList');

	this.list.write(target.read().slice());
	this.list.getFocus();
};

ArrayList.windowClose = function (event) {
	if (this.changed) {
		event.preventDefault();
		const get = Local.createGetter('confirmation');
		Window.confirm(
			{
				message: get('closeUnsavedData')
			},
			[
				{
					label: get('yes'),
					click: () => {
						this.changed = false;
						Window.close('arrayList');
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
}.bind(ArrayList);

ArrayList.windowClosed = function () {
	ArrayList.target = null;
	ArrayList.list.clear();
};

ArrayList.listChange = function () {
	ArrayList.changed = true;
};

ArrayList.confirm = function () {
	this.changed = false;
	this.target.input(this.list.read());
	Window.close('arrayList');
}.bind(ArrayList);

ArrayList.interface = {
	parsers: {
		number: (number) => number.toString(),
		string: (string) => Command.parseMultiLineString(string)
	},
	defaults: {
		number: 0,
		string: ''
	},
	windows: {
		number: 'arrayList-number',
		string: 'arrayList-string'
	},
	inputs: {
		number: $('#arrayList-number-value'),
		string: $('#arrayList-string-value')
	},
	initialize: function (list) {
		$('#arrayList-number-confirm').on('click', () => list.save());
		$('#arrayList-string-confirm').on('click', () => list.save());
	},
	parse: function (value, data, index) {
		const { filter } = ArrayList.target;
		const indexText = document.createElement('text');
		indexText.addClass('array-index');
		indexText.textContent = Number.padZero(index, data.length, ' ') + ':';

		const valueText = document.createElement('text');
		valueText.addClass('array-value');
		valueText.textContent = this.parsers[filter](value);

		return [indexText, valueText];
	},
	open: function (value) {
		const { filter } = ArrayList.target;
		value = value ?? this.defaults[filter];
		Window.open(this.windows[filter]);
		const input = this.inputs[filter];
		input.write(value);
		input.getFocus('all');
	},
	save: function () {
		const { filter } = ArrayList.target;
		const value = this.inputs[filter].read();
		Window.close(this.windows[filter]);
		return value;
	}
};
