import { $, getElementWriter } from '../util/dom.ts';
import { Inspector } from './inspector.ts';
import { UI } from '../ui/ui-window.ts';

{
	const UIVideo = {
		owner: UI,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		paramInput: null
	};

	UIVideo.initialize = function () {
		$('#uiVideo-loop').loadItems([
			{ name: 'Once', value: false },
			{ name: 'Loop', value: true }
		]);

		$('#uiVideo-flip').loadItems([
			{ name: 'None', value: 'none' },
			{ name: 'Horizontal', value: 'horizontal' },
			{ name: 'Vertical', value: 'vertical' },
			{ name: 'Both', value: 'both' }
		]);

		$('#uiVideo-blend').loadItems([
			{ name: 'Normal', value: 'normal' },
			{ name: 'Additive', value: 'additive' },
			{ name: 'Subtract', value: 'subtract' }
		]);

		const elements = $(
			'#uiVideo-video, #uiVideo-playbackRate, #uiVideo-loop, #uiVideo-flip, #uiVideo-blend'
		);
		elements.on('input', this.paramInput);
		elements.on('focus', Inspector.inputFocus);
		elements.on('blur', Inspector.inputBlur(this, UI));
	};

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

	UIVideo.open = function (node) {
		if (this.target !== node) {
			this.target = node;

			const write = getElementWriter('uiVideo', node);
			write('video');
			write('playbackRate');
			write('loop');
			write('flip');
			write('blend');
			Inspector.uiElement.open(node);
		}
	};

	UIVideo.close = function () {
		if (this.target) {
			UI.list.unselect(this.target);
			UI.updateTarget();
			Inspector.uiElement.close();
			this.target = null;
		}
	};

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

	UIVideo.paramInput = function (event) {
		UIVideo.update(UIVideo.target, Inspector.getKey(this), this.read());
	};

	Inspector.uiVideo = UIVideo;
}
