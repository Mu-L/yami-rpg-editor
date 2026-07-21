import { $, getElementWriter } from '../util/dom.ts';
import { Inspector } from './inspector.ts';
import { UI } from '../ui/ui-window.ts';

// ******************************** 元素 - 视频页面 ********************************

{
	const UIVideo = {
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
	UIVideo.initialize = function () {
		// 创建循环选项
		$('#uiVideo-loop').loadItems([
			{ name: 'Once', value: false },
			{ name: 'Loop', value: true }
		]);

		// 创建翻转选项
		$('#uiVideo-flip').loadItems([
			{ name: 'None', value: 'none' },
			{ name: 'Horizontal', value: 'horizontal' },
			{ name: 'Vertical', value: 'vertical' },
			{ name: 'Both', value: 'both' }
		]);

		// 创建混合模式选项
		$('#uiVideo-blend').loadItems([
			{ name: 'Normal', value: 'normal' },
			{ name: 'Additive', value: 'additive' },
			{ name: 'Subtract', value: 'subtract' }
		]);

		// 侦听事件
		const elements = $(
			'#uiVideo-video, #uiVideo-playbackRate, #uiVideo-loop, #uiVideo-flip, #uiVideo-blend'
		);
		elements.on('input', this.paramInput);
		elements.on('focus', Inspector.inputFocus);
		elements.on('blur', Inspector.inputBlur(this, UI));
	};

	// 创建视频
	UIVideo.create = function () {
		const transform = Inspector.uiElement.createTransform();
		transform.width = 100;
		transform.height = 100;
		return {
			class: 'video',
			name: 'Video',
			enabled: true,
			expanded: false,
			hidden: false,
			locked: false,
			presetId: '',
			video: '',
			playbackRate: 1,
			loop: false,
			flip: 'none',
			blend: 'normal',
			pointerEvents: 'enabled',
			transform: transform,
			events: [],
			scripts: [],
			children: []
		};
	};

	// 打开数据
	UIVideo.open = function (node) {
		if (this.target !== node) {
			this.target = node;

			// 写入数据
			const write = getElementWriter('uiVideo', node);
			write('video');
			write('playbackRate');
			write('loop');
			write('flip');
			write('blend');
			Inspector.uiElement.open(node);
		}
	};

	// 关闭数据
	UIVideo.close = function () {
		if (this.target) {
			UI.list.unselect(this.target);
			UI.updateTarget();
			Inspector.uiElement.close();
			this.target = null;
		}
	};

	// 更新数据
	UIVideo.update = function (node, key, value) {
		UI.planToSave();
		switch (key) {
			case 'video':
			case 'playbackRate':
			case 'loop':
			case 'flip':
			case 'blend':
				if (node[key] !== value) {
					node[key] = value;
				}
				break;
		}
		UI.requestRendering();
	};

	// 参数 - 输入事件
	UIVideo.paramInput = function (event) {
		UIVideo.update(UIVideo.target, Inspector.getKey(this), this.read());
	};

	Inspector.uiVideo = UIVideo;
}
