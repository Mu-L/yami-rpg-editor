import { $, getElementWriter } from '../util/dom.ts';
import { Inspector } from './inspector.ts';
import { UI } from '../ui/ui-window.ts';

{
	const UIImage = {
		owner: UI,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		paramInput: null
	};

	UIImage.initialize = function () {
		$('#uiImage-display').loadItems([
			{ name: 'Stretch', value: 'stretch' },
			{ name: 'Tile', value: 'tile' },
			{ name: 'Clip', value: 'clip' },
			{ name: 'Slice', value: 'slice' }
		]);

		$('#uiImage-display')
			.enableHiddenMode()
			.relate([
				{
					case: ['stretch', 'tile'],
					targets: [$('#uiImage-flip'), $('#uiImage-shift-box')]
				},
				{
					case: 'clip',
					targets: [$('#uiImage-flip'), $('#uiImage-clip')]
				},
				{
					case: 'slice',
					targets: [$('#uiImage-clip'), $('#uiImage-border')]
				}
			]);

		$('#uiImage-flip').loadItems([
			{ name: 'None', value: 'none' },
			{ name: 'Horizontal', value: 'horizontal' },
			{ name: 'Vertical', value: 'vertical' },
			{ name: 'Both', value: 'both' }
		]);

		$('#uiImage-blend').loadItems([
			{ name: 'Normal', value: 'normal' },
			{ name: 'Additive', value: 'additive' },
			{ name: 'Subtract', value: 'subtract' },
			{ name: 'Mask', value: 'mask' }
		]);

		$('#uiImage-tint-0-slider').synchronize($('#uiImage-tint-0'));
		$('#uiImage-tint-1-slider').synchronize($('#uiImage-tint-1'));
		$('#uiImage-tint-2-slider').synchronize($('#uiImage-tint-2'));
		$('#uiImage-tint-3-slider').synchronize($('#uiImage-tint-3'));

		const elements = $(`#uiImage-image,
    #uiImage-display, #uiImage-flip, #uiImage-blend,
    #uiImage-shiftX, #uiImage-shiftY, #uiImage-clip, #uiImage-border,
    #uiImage-tint-0, #uiImage-tint-1, #uiImage-tint-2, #uiImage-tint-3`);
		const sliders = $(`
    #uiImage-tint-0-slider, #uiImage-tint-1-slider,
    #uiImage-tint-2-slider, #uiImage-tint-3-slider`);
		elements.on('input', this.paramInput);
		elements.on('focus', Inspector.inputFocus);
		elements.on('blur', Inspector.inputBlur(this, UI));
		sliders.on('focus', Inspector.sliderFocus);
		sliders.on('blur', Inspector.sliderBlur);
	};

	UIImage.create = function () {
		const transform = Inspector.uiElement.createTransform();
		transform.width = 100;
		transform.height = 100;
		return {
			class: 'image',
			name: 'Image',
			enabled: true,
			expanded: false,
			hidden: false,
			locked: false,
			presetId: '',
			image: '',
			display: 'stretch',
			flip: 'none',
			blend: 'normal',
			shiftX: 0,
			shiftY: 0,
			clip: [0, 0, 32, 32],
			border: 1,
			tint: [0, 0, 0, 0],
			pointerEvents: 'enabled',
			transform: transform,
			events: [],
			scripts: [],
			children: []
		};
	};

	UIImage.open = function (node) {
		if (this.target !== node) {
			this.target = node;

			const write = getElementWriter('uiImage', node);
			write('image');
			write('display');
			write('flip');
			write('blend');
			write('shiftX');
			write('shiftY');
			write('clip');
			write('border');
			write('tint-0');
			write('tint-1');
			write('tint-2');
			write('tint-3');
			Inspector.uiElement.open(node);
		}
	};

	UIImage.close = function () {
		if (this.target) {
			UI.list.unselect(this.target);
			UI.updateTarget();
			Inspector.uiElement.close();
			this.target = null;
		}
	};

	UIImage.update = function (node, key, value) {
		UI.planToSave();
		// const element = node.instance
		switch (key) {
			case 'image':
			case 'display':
			case 'flip':
			case 'blend':
			case 'shiftX':
			case 'shiftY':
			case 'clip':
			case 'border':
				if (node[key] !== value) {
					node[key] = value;
					// element[key] = value
					node.instances.setProperty(key, value);
				}
				break;
			case 'tint-0':
			case 'tint-1':
			case 'tint-2':
			case 'tint-3': {
				const index = key.indexOf('-') + 1;
				const color = key.slice(index);
				if (node.tint[color] !== value) {
					node.tint[color] = value;
					// element.tint[color] = value
					node.instances.setProperty(key, value);
				}
				break;
			}
		}
		UI.requestRendering();
	};

	UIImage.paramInput = function (event) {
		UIImage.update(UIImage.target, Inspector.getKey(this), this.read());
	};

	Inspector.uiImage = UIImage;
}
