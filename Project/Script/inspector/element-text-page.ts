import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { Inspector } from './inspector.ts';
import { UI } from '@/ui/ui-window.ts';

{
	const UIText = {
		owner: UI,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		paramInput: null
	};

	UIText.initialize = function () {
		$('#uiText-direction').loadItems([
			{ name: 'Horizontal - TB', value: 'horizontal-tb' },
			{ name: 'Vertical - LR', value: 'vertical-lr' },
			{ name: 'Vertical - RL', value: 'vertical-rl' }
		]);

		$('#uiText-typeface').loadItems([
			{ name: 'Regular', value: 'regular' },
			{ name: 'Bold', value: 'bold' },
			{ name: 'Italic', value: 'italic' },
			{ name: 'Bold Italic', value: 'bold-italic' }
		]);

		$('#uiText-effect-type').loadItems([
			{ name: 'None', value: 'none' },
			{ name: 'Shadow', value: 'shadow' },
			{ name: 'Stroke', value: 'stroke' },
			{ name: 'Outline', value: 'outline' }
		]);

		$('#uiText-overflow').loadItems([
			{ name: 'Visible', value: 'visible' },
			{ name: 'Wrap', value: 'wrap' },
			{ name: 'Truncate', value: 'truncate' },
			{ name: 'Wrap Truncate', value: 'wrap-truncate' }
		]);

		$('#uiText-blend').loadItems([
			{ name: 'Normal', value: 'normal' },
			{ name: 'Additive', value: 'additive' },
			{ name: 'Subtract', value: 'subtract' }
		]);

		$('#uiText-size-slider').synchronize($('#uiText-size'));
		$('#uiText-lineSpacing-slider').synchronize($('#uiText-lineSpacing'));
		$('#uiText-letterSpacing-slider').synchronize($('#uiText-letterSpacing'));

		$('#uiText-effect-type')
			.enableHiddenMode()
			.relate([
				{
					case: 'shadow',
					targets: [
						$('#uiText-effect-shadowOffsetX'),
						$('#uiText-effect-shadowOffsetY'),
						$('#uiText-effect-color')
					]
				},
				{
					case: 'stroke',
					targets: [$('#uiText-effect-strokeWidth'), $('#uiText-effect-color')]
				},
				{ case: 'outline', targets: [$('#uiText-effect-color')] }
			]);

		const elements = $(`#uiText-direction, #uiText-horizontalAlign, #uiText-verticalAlign,
    #uiText-content, #uiText-size, #uiText-lineSpacing, #uiText-letterSpacing, #uiText-color, #uiText-font,
    #uiText-typeface, #uiText-effect-type, #uiText-effect-shadowOffsetX, #uiText-effect-shadowOffsetY,
    #uiText-effect-strokeWidth, #uiText-effect-color, #uiText-overflow, #uiText-blend`);
		const sliders = $(
			'#uiText-size-slider, #uiText-lineSpacing-slider, #uiText-letterSpacing-slider'
		);
		elements.on('input', this.paramInput);
		elements.on('focus', Inspector.inputFocus);
		elements.on('blur', Inspector.inputBlur(this, UI));
		sliders.on('focus', Inspector.sliderFocus);
		sliders.on('blur', Inspector.sliderBlur);
	};

	UIText.create = function () {
		const transform = Inspector.uiElement.createTransform();
		transform.width = 100;
		transform.height = 24;
		return {
			class: 'text',
			name: 'Text',
			enabled: true,
			expanded: false,
			hidden: false,
			locked: false,
			presetId: '',
			direction: 'horizontal-tb',
			horizontalAlign: 'left',
			verticalAlign: 'middle',
			content: 'New Text',
			size: 16,
			lineSpacing: 0,
			letterSpacing: 0,
			color: 'ffffffff',
			font: '',
			typeface: 'regular',
			effect: { type: 'none' },
			overflow: 'visible',
			blend: 'normal',
			pointerEvents: 'enabled',
			transform: transform,
			events: [],
			scripts: [],
			children: []
		};
	};

	UIText.open = function (node) {
		if (this.target !== node) {
			this.target = node;

			const write = getElementWriter('uiText', node);
			write('direction');
			write('horizontalAlign');
			write('verticalAlign');
			write('content');
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
			write('overflow');
			write('blend');
			Inspector.uiElement.open(node);
		}
	};

	UIText.close = function () {
		if (this.target) {
			UI.list.unselect(this.target);
			UI.updateTarget();
			Inspector.uiElement.close();
			this.target = null;
		}
	};

	UIText.update = function (node, key, value) {
		UI.planToSave();
		// const element = node.instance
		switch (key) {
			case 'horizontalAlign':
				if (node.horizontalAlign !== value) {
					const event = window.event;
					if (event && event.type === 'input' && event.value !== undefined) {
						UI.history.save({
							type: 'inspector-change',
							editor: this,
							target: this.target,
							changes: [
								{
									input: $('#uiText-horizontalAlign'),
									oldValue: node.horizontalAlign,
									newValue: value
								}
							]
						});
					}
					node.horizontalAlign = value;
					// element.horizontalAlign = value
					node.instances.setProperty(key, value);
				}
				break;
			case 'verticalAlign':
				if (node.verticalAlign !== value) {
					const event = window.event;
					if (event && event.type === 'input' && event.value !== undefined) {
						UI.history.save({
							type: 'inspector-change',
							editor: this,
							target: this.target,
							changes: [
								{
									input: $('#uiText-verticalAlign'),
									oldValue: node.verticalAlign,
									newValue: value
								}
							]
						});
					}
					node.verticalAlign = value;
					// element.verticalAlign = value
					node.instances.setProperty(key, value);
				}
				break;
			case 'content':
				// 直接复制，更新语言包中的内容
				node[key] = value;
				// element[key] = value
				node.instances.setProperty(key, value);
				break;
			case 'direction':
			case 'size':
			case 'lineSpacing':
			case 'letterSpacing':
			case 'color':
			case 'typeface':
			case 'overflow':
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
					const read = getElementReader('uiText-effect');
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

	UIText.paramInput = function () {
		UIText.update(UIText.target, Inspector.getKey(this), this.read());
	};

	Inspector.uiText = UIText;
}
