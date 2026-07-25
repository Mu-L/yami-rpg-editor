import { $, getElementWriter } from '../util/dom.ts';
import { Inspector } from './inspector.ts';
import { UI } from '../ui/ui-window.ts';

{
	const UITextBox = {
		owner: UI,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		paramInput: null
	};

	UITextBox.initialize = function () {
		$('#uiTextBox-type').loadItems([
			{ name: 'Text', value: 'text' },
			{ name: 'Number', value: 'number' }
		]);

		$('#uiTextBox-align').loadItems([
			{ name: 'Left', value: 'left' },
			{ name: 'Center', value: 'center' },
			{ name: 'Right', value: 'right' }
		]);

		$('#uiTextBox-type')
			.enableHiddenMode()
			.relate([
				{
					case: 'text',
					targets: [$('#uiTextBox-text'), $('#uiTextBox-maxLength')]
				},
				{
					case: 'number',
					targets: [
						$('#uiTextBox-number'),
						$('#uiTextBox-min'),
						$('#uiTextBox-max'),
						$('#uiTextBox-decimals')
					]
				}
			]);

		const elements = $(`#uiTextBox-type, #uiTextBox-align, #uiTextBox-text,
    #uiTextBox-maxLength, #uiTextBox-number, #uiTextBox-min, #uiTextBox-max,
    #uiTextBox-decimals, #uiTextBox-padding, #uiTextBox-size, #uiTextBox-font,
    #uiTextBox-color, #uiTextBox-selectionColor, #uiTextBox-selectionBgColor`);
		elements.on('input', this.paramInput);
		elements.on('focus', Inspector.inputFocus);
		elements.on('blur', Inspector.inputBlur(this, UI));
	};

	UITextBox.create = function () {
		const transform = Inspector.uiElement.createTransform();
		transform.width = 100;
		transform.height = 24;
		return {
			class: 'textbox',
			name: 'TextBox',
			enabled: true,
			expanded: false,
			hidden: false,
			locked: false,
			presetId: '',
			type: 'text',
			align: 'left',
			text: 'Content',
			maxLength: 16,
			number: 0,
			min: 0,
			max: 0,
			decimals: 0,
			padding: 4,
			size: 16,
			font: '',
			color: 'ffffffff',
			selectionColor: 'ffffffff',
			selectionBgColor: '0090ccff',
			pointerEvents: 'enabled',
			transform: transform,
			events: [],
			scripts: [],
			children: []
		};
	};

	UITextBox.open = function (node) {
		if (this.target !== node) {
			this.target = node;

			const write = getElementWriter('uiTextBox', node);
			const number = $('#uiTextBox-number');
			number.input.min = node.min;
			number.input.max = node.max;
			number.decimals = node.decimals;
			write('type');
			write('align');
			write('text');
			write('maxLength');
			write('number');
			write('min');
			write('max');
			write('decimals');
			write('padding');
			write('size');
			write('font');
			write('color');
			write('selectionColor');
			write('selectionBgColor');
			Inspector.uiElement.open(node);
		}
	};

	UITextBox.close = function () {
		if (this.target) {
			UI.list.unselect(this.target);
			UI.updateTarget();
			Inspector.uiElement.close();
			this.target = null;
		}
	};

	UITextBox.update = function (node, key, value) {
		UI.planToSave();
		// const element = node.instance
		switch (key) {
			case 'type':
			case 'align':
			case 'maxLength':
			case 'padding':
			case 'size':
			case 'font':
			case 'color':
			case 'selectionColor':
			case 'selectionBgColor':
				if (node[key] !== value) {
					node[key] = value;
					// element[key] = value
					node.instances.setProperty(key, value);
				}
				break;
			case 'text':
			case 'number':
				if (node[key] !== value) {
					node[key] = value;
					// element.content = value.toString()
					node.instances.setProperty('content', value.toString());
				}
				break;
			case 'min':
			case 'max':
				if (node[key] !== value) {
					node[key] = value;
					// element[key] = value
					node.instances.setProperty(key, value);
					$('#uiTextBox-number').input[key] = value;
				}
				break;
			case 'decimals':
				if (node.decimals !== value) {
					node.decimals = value;
					// element.decimals = value
					node.instances.setProperty(key, value);
					$('#uiTextBox-number').decimals = value;
				}
				break;
		}
		UI.requestRendering();
	};

	UITextBox.paramInput = function (event) {
		UITextBox.update(UITextBox.target, Inspector.getKey(this), this.read());
	};

	Inspector.uiTextBox = UITextBox;
}
