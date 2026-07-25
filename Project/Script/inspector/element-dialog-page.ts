import { $, getElementReader, getElementWriter } from '../util/dom.ts';
import { Inspector } from './inspector.ts';
import { UI } from '../ui/ui-window.ts';

{
	const UIDialogBox = {
		owner: UI,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		paramInput: null
	};

	UIDialogBox.initialize = function () {
		$('#uiDialogBox-typeface').loadItems([
			{ name: 'Regular', value: 'regular' },
			{ name: 'Bold', value: 'bold' },
			{ name: 'Italic', value: 'italic' },
			{ name: 'Bold Italic', value: 'bold-italic' }
		]);

		$('#uiDialogBox-effect-type').loadItems([
			{ name: 'None', value: 'none' },
			{ name: 'Shadow', value: 'shadow' },
			{ name: 'Stroke', value: 'stroke' },
			{ name: 'Outline', value: 'outline' }
		]);

		$('#uiDialogBox-blend').loadItems([
			{ name: 'Normal', value: 'normal' },
			{ name: 'Additive', value: 'additive' },
			{ name: 'Subtract', value: 'subtract' }
		]);

		$('#uiDialogBox-size-slider').synchronize($('#uiDialogBox-size'));
		$('#uiDialogBox-lineSpacing-slider').synchronize($('#uiDialogBox-lineSpacing'));
		$('#uiDialogBox-letterSpacing-slider').synchronize($('#uiDialogBox-letterSpacing'));

		$('#uiDialogBox-effect-type')
			.enableHiddenMode()
			.relate([
				{
					case: 'shadow',
					targets: [
						$('#uiDialogBox-effect-shadowOffsetX'),
						$('#uiDialogBox-effect-shadowOffsetY'),
						$('#uiDialogBox-effect-color')
					]
				},
				{
					case: 'stroke',
					targets: [$('#uiDialogBox-effect-strokeWidth'), $('#uiDialogBox-effect-color')]
				},
				{
					case: 'outline',
					targets: [$('#uiDialogBox-effect-color')]
				}
			]);

		const elements = $(`#uiDialogBox-content, #uiDialogBox-interval, #uiDialogBox-size,
    #uiDialogBox-lineSpacing, #uiDialogBox-letterSpacing, #uiDialogBox-color, #uiDialogBox-font,
    #uiDialogBox-typeface, #uiDialogBox-effect-type, #uiDialogBox-effect-shadowOffsetX, #uiDialogBox-effect-shadowOffsetY,
    #uiDialogBox-effect-strokeWidth, #uiDialogBox-effect-color, #uiDialogBox-blend`);
		const sliders = $(
			'#uiDialogBox-size-slider, #uiDialogBox-lineSpacing-slider, #uiDialogBox-letterSpacing-slider'
		);
		elements.on('input', this.paramInput);
		elements.on('focus', Inspector.inputFocus);
		elements.on('blur', Inspector.inputBlur(this, UI));
		sliders.on('focus', Inspector.sliderFocus);
		sliders.on('blur', Inspector.sliderBlur);
	};

	UIDialogBox.create = function () {
		const transform = Inspector.uiElement.createTransform();
		transform.width = 100;
		transform.height = 24;
		return {
			class: 'dialogbox',
			name: 'DialogBox',
			enabled: true,
			expanded: false,
			hidden: false,
			locked: false,
			presetId: '',
			content: 'Content',
			interval: 16.6666,
			size: 16,
			lineSpacing: 0,
			letterSpacing: 0,
			color: 'ffffffff',
			font: '',
			typeface: 'regular',
			effect: { type: 'none' },
			blend: 'normal',
			pointerEvents: 'enabled',
			transform: transform,
			events: [],
			scripts: [],
			children: []
		};
	};

	UIDialogBox.open = function (node) {
		if (this.target !== node) {
			this.target = node;

			const write = getElementWriter('uiDialogBox', node);
			write('content');
			write('interval');
			write('size');
			write('lineSpacing');
			write('letterSpacing');
			write('color');
			write('font');
			write('typeface');
			write('effect-type');
			write('effect-shadowOffsetX', node.effect.shadowOffsetX || 1);
			write('effect-shadowOffsetY', node.effect.shadowOffsetY || 1);
			write('effect-strokeWidth', node.effect.strokeWidth || 1);
			write('effect-color', node.effect.color || '000000ff');
			write('blend');
			Inspector.uiElement.open(node);
		}
	};

	UIDialogBox.close = function () {
		if (this.target) {
			UI.list.unselect(this.target);
			UI.updateTarget();
			Inspector.uiElement.close();
			this.target = null;
		}
	};

	UIDialogBox.update = function (node, key, value) {
		UI.planToSave();
		// const element = node.instance
		switch (key) {
			case 'content':
				// 直接复制，更新语言包中的内容
				node[key] = value;
				// element[key] = value
				node.instances.setProperty(key, value);
				break;
			case 'interval':
			case 'size':
			case 'lineSpacing':
			case 'letterSpacing':
			case 'color':
			case 'typeface':
			case 'blend':
				if (node[key] !== value) {
					node[key] = value;
					// element[key] = value
					node.instances.setProperty(key, value);
				}
				break;
			case 'font': {
				const font = value.trim();
				if (node.font !== font) {
					node.font = font;
					// element.font = font
					node.instances.setProperty(key, font);
				}
				break;
			}
			case 'effect-type':
				if (node.effect.type !== value) {
					const read = getElementReader('uiDialogBox-effect');
					const effect: any = { type: value };
					switch (value) {
						case 'none':
							break;
						case 'shadow':
							effect.shadowOffsetX = read('shadowOffsetX');
							effect.shadowOffsetY = read('shadowOffsetY');
							effect.color = read('color');
							break;
						case 'stroke':
							effect.strokeWidth = read('strokeWidth');
							effect.color = read('color');
							break;
						case 'outline':
							effect.color = read('color');
							break;
					}
					node.effect = effect;
					// element.effect = effect
					node.instances.setProperty('effect', effect);
				}
				break;
			case 'effect-shadowOffsetX':
			case 'effect-shadowOffsetY':
			case 'effect-strokeWidth':
			case 'effect-color': {
				const index = key.indexOf('-') + 1;
				const property = key.slice(index);
				if (node.effect[property] !== value) {
					node.effect[property] = value;
					// element.effect = node.effect
					node.instances.setProperty('effect', node.effect);
				}
				break;
			}
		}
		UI.requestRendering();
	};

	UIDialogBox.paramInput = function (event) {
		UIDialogBox.update(UIDialogBox.target, Inspector.getKey(this), this.read());
	};

	Inspector.uiDialogBox = UIDialogBox;
}
