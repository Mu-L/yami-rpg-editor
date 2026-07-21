import { $, getElementReader, getElementWriter } from '../util/dom.ts';
import { Inspector } from './inspector.ts';
import { UI } from '../ui/ui-window.ts';

// ******************************** 元素 - 按钮页面 ********************************

{
	const UIButton = {
		// properties
		owner: UI,
		target: null,
		// methods
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		// events
		paramInput: null
	};

	// 初始化
	UIButton.initialize = function () {
		// 创建显示选项
		$('#uiButton-display').loadItems([
			{ name: 'Stretch', value: 'stretch' },
			{ name: 'Tile', value: 'tile' },
			{ name: 'Clip', value: 'clip' },
			{ name: 'Slice', value: 'slice' }
		]);

		// 设置显示模式关联元素
		$('#uiButton-display')
			.enableHiddenMode()
			.relate([
				{
					case: ['stretch', 'tile'],
					targets: [$('#uiButton-flip')]
				},
				{
					case: 'clip',
					targets: [
						$('#uiButton-flip'),
						$('#uiButton-normalClip'),
						$('#uiButton-hoverClip'),
						$('#uiButton-activeClip')
					]
				},
				{
					case: 'slice',
					targets: [
						$('#uiButton-normalClip'),
						$('#uiButton-hoverClip'),
						$('#uiButton-activeClip'),
						$('#uiButton-border')
					]
				}
			]);

		// 创建翻转选项
		$('#uiButton-flip').loadItems([
			{ name: 'None', value: 'none' },
			{ name: 'Horizontal', value: 'horizontal' },
			{ name: 'Vertical', value: 'vertical' },
			{ name: 'Both', value: 'both' }
		]);

		// 创建图像效果选项
		$('#uiButton-imageEffect').loadItems([
			{ name: 'None', value: 'none' },
			{ name: 'Tint', value: 'tint-1' },
			{ name: 'Tint (Normal, Hover)', value: 'tint-2' },
			{ name: 'Tint (Normal, Hover, Active)', value: 'tint-3' }
		]);

		// 设置图像效果关联元素
		$('#uiButton-imageEffect')
			.enableHiddenMode()
			.relate([
				{
					case: 'tint-1',
					targets: [$('#uiButton-normalTint-box')]
				},
				{
					case: 'tint-2',
					targets: [
						$('#uiButton-normalTint-box'),
						$('#uiButton-hoverTint-box')
					]
				},
				{
					case: 'tint-3',
					targets: [
						$('#uiButton-normalTint-box'),
						$('#uiButton-hoverTint-box'),
						$('#uiButton-activeTint-box')
					]
				}
			]);

		// 创建文本方向选项
		$('#uiButton-direction').loadItems([
			{ name: 'Horizontal', value: 'horizontal-tb' },
			{ name: 'Vertical', value: 'vertical-lr' }
		]);

		// 创建字型选项
		$('#uiButton-typeface').loadItems([
			{ name: 'Regular', value: 'regular' },
			{ name: 'Bold', value: 'bold' },
			{ name: 'Italic', value: 'italic' },
			{ name: 'Bold Italic', value: 'bold-italic' }
		]);

		// 创建文字效果类型选项
		$('#uiButton-textEffect-type').loadItems([
			{ name: 'None', value: 'none' },
			{ name: 'Shadow', value: 'shadow' },
			{ name: 'Stroke', value: 'stroke' },
			{ name: 'Outline', value: 'outline' }
		]);

		// 设置文字效果类型关联元素
		$('#uiButton-textEffect-type')
			.enableHiddenMode()
			.relate([
				{
					case: 'shadow',
					targets: [
						$('#uiButton-textEffect-shadowOffsetX'),
						$('#uiButton-textEffect-shadowOffsetY'),
						$('#uiButton-textEffect-color')
					]
				},
				{
					case: 'stroke',
					targets: [
						$('#uiButton-textEffect-strokeWidth'),
						$('#uiButton-textEffect-color')
					]
				},
				{
					case: 'outline',
					targets: [$('#uiButton-textEffect-color')]
				}
			]);

		// 同步滑动框和数字框的数值
		$('#uiButton-imagePadding-slider').synchronize(
			$('#uiButton-imagePadding')
		);
		$('#uiButton-imageOpacity-slider').synchronize(
			$('#uiButton-imageOpacity')
		);
		$('#uiButton-size-slider').synchronize($('#uiButton-size'));
		$('#uiButton-letterSpacing-slider').synchronize(
			$('#uiButton-letterSpacing')
		);
		$('#uiButton-textPadding-slider').synchronize(
			$('#uiButton-textPadding')
		);

		// 侦听事件
		const elements = $(`#uiButton-display,
    #uiButton-normalImage, #uiButton-normalClip,
    #uiButton-hoverImage, #uiButton-hoverClip,
    #uiButton-activeImage, #uiButton-activeClip,
    #uiButton-flip, #uiButton-border, #uiButton-imagePadding, #uiButton-imageOpacity, #uiButton-imageEffect,
    #uiButton-normalTint-0, #uiButton-normalTint-1, #uiButton-normalTint-2, #uiButton-normalTint-3,
    #uiButton-hoverTint-0, #uiButton-hoverTint-1, #uiButton-hoverTint-2, #uiButton-hoverTint-3,
    #uiButton-activeTint-0, #uiButton-activeTint-1, #uiButton-activeTint-2, #uiButton-activeTint-3,
    #uiButton-direction, #uiButton-horizontalAlign, #uiButton-verticalAlign,
    #uiButton-content, #uiButton-size, #uiButton-letterSpacing, #uiButton-textPadding,
    #uiButton-font, #uiButton-typeface, #uiButton-textEffect-type, #uiButton-textEffect-shadowOffsetX,
    #uiButton-textEffect-shadowOffsetY, #uiButton-textEffect-strokeWidth, #uiButton-textEffect-color,
    #uiButton-normalColor, #uiButton-hoverColor, #uiButton-activeColor,
    #uiButton-hoverSound, #uiButton-clickSound`);
		const sliders =
			$(`#uiButton-imagePadding-slider, #uiButton-imageOpacity-slider,
    #uiButton-size-slider, #uiButton-letterSpacing-slider, #uiButton-textPadding-slider`);
		elements.on('input', this.paramInput);
		elements.on('focus', Inspector.inputFocus);
		elements.on('blur', Inspector.inputBlur(this, UI));
		sliders.on('focus', Inspector.sliderFocus);
		sliders.on('blur', Inspector.sliderBlur);
	};

	// 创建按钮
	UIButton.create = function () {
		const transform = Inspector.uiElement.createTransform();
		transform.width = 100;
		transform.height = 24;
		return {
			class: 'button',
			name: 'Button',
			enabled: true,
			expanded: false,
			hidden: false,
			locked: false,
			presetId: '',
			display: 'stretch',
			normalImage: '',
			normalClip: [0, 0, 32, 32],
			hoverImage: '',
			hoverClip: [0, 0, 32, 32],
			activeImage: '',
			activeClip: [0, 0, 32, 32],
			flip: 'none',
			clip: [0, 0, 32, 32],
			border: 1,
			imagePadding: 0,
			imageOpacity: 1,
			imageEffect: 'none',
			normalTint: [0, 0, 0, 0],
			hoverTint: [0, 0, 0, 0],
			activeTint: [0, 0, 0, 0],
			direction: 'horizontal-tb',
			horizontalAlign: 'center',
			verticalAlign: 'middle',
			content: 'New Button',
			size: 16,
			letterSpacing: 0,
			textPadding: 0,
			font: '',
			typeface: 'regular',
			textEffect: { type: 'none' },
			normalColor: 'ffffffff',
			hoverColor: 'ffffffff',
			activeColor: 'ffffffff',
			hoverSound: '',
			clickSound: '',
			pointerEvents: 'enabled',
			transform: transform,
			events: [],
			scripts: [],
			children: []
		};
	};

	// 打开数据
	UIButton.open = function (node) {
		if (this.target !== node) {
			this.target = node;

			// 写入数据
			const write = getElementWriter('uiButton', node);
			write('display');
			write('normalImage');
			write('normalClip');
			write('hoverImage');
			write('hoverClip');
			write('activeImage');
			write('activeClip');
			write('flip');
			write('border');
			write('imagePadding');
			write('imageOpacity');
			write('imageEffect');
			write('normalTint-0');
			write('normalTint-1');
			write('normalTint-2');
			write('normalTint-3');
			write('hoverTint-0');
			write('hoverTint-1');
			write('hoverTint-2');
			write('hoverTint-3');
			write('activeTint-0');
			write('activeTint-1');
			write('activeTint-2');
			write('activeTint-3');
			write('direction');
			write('horizontalAlign');
			write('verticalAlign');
			write('content');
			write('size');
			write('letterSpacing');
			write('textPadding');
			write('font');
			write('typeface');
			write('textEffect-type');
			write(
				'textEffect-shadowOffsetX',
				node.textEffect.shadowOffsetX || 1
			);
			write(
				'textEffect-shadowOffsetY',
				node.textEffect.shadowOffsetY || 1
			);
			write('textEffect-strokeWidth', node.textEffect.strokeWidth || 1);
			write('textEffect-color', node.textEffect.color || '000000ff');
			write('normalColor');
			write('hoverColor');
			write('activeColor');
			write('hoverSound');
			write('clickSound');
			Inspector.uiElement.open(node);
		}
	};

	// 关闭数据
	UIButton.close = function () {
		if (this.target) {
			UI.list.unselect(this.target);
			UI.updateTarget();
			Inspector.uiElement.close();
			this.target = null;
		}
	};

	// 更新数据
	UIButton.update = function (node, key, value) {
		UI.planToSave();
		// const element = node.instance
		switch (key) {
			case 'horizontalAlign':
				if (node.horizontalAlign !== value) {
					const event = window.event;
					if (
						event &&
						event.type === 'input' &&
						event.value !== undefined
					) {
						UI.history.save({
							type: 'inspector-change',
							editor: this,
							target: this.target,
							changes: [
								{
									input: $('#uiButton-horizontalAlign'),
									oldValue: node.horizontalAlign,
									newValue: value
								}
							]
						});
					}
					node.horizontalAlign = value;
					// element.horizontalAlign = value
					node.instances.set(key, value);
				}
				break;
			case 'verticalAlign':
				if (node.verticalAlign !== value) {
					const event = window.event;
					if (
						event &&
						event.type === 'input' &&
						event.value !== undefined
					) {
						UI.history.save({
							type: 'inspector-change',
							editor: this,
							target: this.target,
							changes: [
								{
									input: $('#uiButton-verticalAlign'),
									oldValue: node.verticalAlign,
									newValue: value
								}
							]
						});
					}
					node.verticalAlign = value;
					// element.verticalAlign = value
					node.instances.set(key, value);
				}
				break;
			case 'normalImage':
			case 'normalClip':
			case 'hoverImage':
			case 'hoverClip':
			case 'activeImage':
			case 'activeClip':
			case 'normalColor':
			case 'hoverColor':
			case 'activeColor':
				if (node[key] !== value) {
					node[key] = value;
					// element[key] = value
					// element.state = 'changed'
					node.instances.set(key, value);
					node.instances.set('state', 'changed');
				}
				break;
			case 'content':
				// 直接复制，更新语言包中的内容
				node[key] = value;
				// element[key] = value
				node.instances.set(key, value);
				break;
			case 'display':
			case 'flip':
			case 'clip':
			case 'border':
			case 'imagePadding':
			case 'imageOpacity':
			case 'imageEffect':
			case 'direction':
			case 'size':
			case 'letterSpacing':
			case 'textPadding':
			case 'font':
			case 'typeface':
			case 'hoverSound':
			case 'clickSound':
				if (node[key] !== value) {
					node[key] = value;
					// element[key] = value
					node.instances.set(key, value);
				}
				break;
			case 'normalTint-0':
			case 'normalTint-1':
			case 'normalTint-2':
			case 'normalTint-3':
			case 'hoverTint-0':
			case 'hoverTint-1':
			case 'hoverTint-2':
			case 'hoverTint-3':
			case 'activeTint-0':
			case 'activeTint-1':
			case 'activeTint-2':
			case 'activeTint-3': {
				const [property, index] = key.split('-');
				if (node[property][index] !== value) {
					node[property][index] = value;
					// element[property][index] = value
					// element.state = 'changed'
					node.instances.set(key, value);
					node.instances.set('state', 'changed');
				}
				break;
			}
			case 'textEffect-type':
				if (node.textEffect.type !== value) {
					const read = getElementReader('uiButton-textEffect');
					const textEffect = { type: value };
					switch (value) {
						case 'none':
							break;
						case 'shadow':
							textEffect.shadowOffsetX = read('shadowOffsetX');
							textEffect.shadowOffsetY = read('shadowOffsetY');
							textEffect.color = read('color');
							break;
						case 'stroke':
							textEffect.strokeWidth = read('strokeWidth');
							textEffect.color = read('color');
							break;
						case 'outline':
							textEffect.color = read('color');
							break;
					}
					node.textEffect = textEffect;
					// element.textEffect = textEffect
					node.instances.set('textEffect', textEffect);
				}
				break;
			case 'textEffect-shadowOffsetX':
			case 'textEffect-shadowOffsetY':
			case 'textEffect-strokeWidth':
			case 'textEffect-color': {
				const index = key.indexOf('-') + 1;
				const property = key.slice(index);
				if (node.textEffect[property] !== value) {
					node.textEffect[property] = value;
					// element.textEffect = node.textEffect
					node.instances.set('textEffect', node.textEffect);
				}
				break;
			}
		}
		UI.requestRendering();
	};

	// 参数 - 输入事件
	UIButton.paramInput = function (event) {
		UIButton.update(UIButton.target, Inspector.getKey(this), this.read());
	};

	Inspector.uiButton = UIButton;
}
