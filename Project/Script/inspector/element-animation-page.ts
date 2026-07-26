import { $, getElementWriter } from '@/util/dom.ts';
import { Animation } from '@/animation/animation-window.ts';
import { Inspector } from './inspector.ts';
import { UI } from '@/ui/ui-window.ts';

{
	const UIAnimation = {
		owner: UI,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		paramInput: null,
		animationIdWrite: null
	};

	UIAnimation.initialize = function () {
		$('#uiAnimation-animation').on('write', this.animationIdWrite);
		const elements = $(`#uiAnimation-animation, #uiAnimation-motion,
    #uiAnimation-autoplay, #uiAnimation-rotatable, #uiAnimation-angle,
    #uiAnimation-frame, #uiAnimation-offsetX, #uiAnimation-offsetY`);
		elements.on('input', this.paramInput);
		elements.on('focus', Inspector.inputFocus);
		elements.on('blur', Inspector.inputBlur(this, UI));
	};

	UIAnimation.create = function () {
		const transform = Inspector.uiElement.createTransform();
		transform.width = 100;
		transform.height = 100;
		return {
			class: 'animation',
			name: 'Animation',
			enabled: true,
			expanded: false,
			hidden: false,
			locked: false,
			presetId: '',
			animation: '',
			motion: '',
			autoplay: true,
			rotatable: false,
			angle: 0,
			frame: 0,
			offsetX: 0,
			offsetY: 0,
			pointerEvents: 'enabled',
			transform: transform,
			events: [],
			scripts: [],
			children: []
		};
	};

	UIAnimation.open = function (node) {
		if (this.target !== node) {
			this.target = node;

			const write = getElementWriter('uiAnimation', node);
			write('animation');
			write('motion');
			write('autoplay');
			write('rotatable');
			write('angle');
			write('frame');
			write('offsetX');
			write('offsetY');
			Inspector.uiElement.open(node);
		}
	};

	UIAnimation.close = function () {
		if (this.target) {
			UI.list.unselect(this.target);
			UI.updateTarget();
			Inspector.uiElement.close();
			this.target = null;
		}
	};

	UIAnimation.update = function (node, key, value) {
		UI.planToSave();
		// const element = node.instance
		switch (key) {
			case 'animation':
			case 'motion':
			case 'autoplay':
			case 'rotatable':
			case 'angle':
			case 'frame':
			case 'offsetX':
			case 'offsetY':
				if (node[key] !== value) {
					node[key] = value;
					// element[key] = value
					node.instances.setProperty(key, value);
				}
				break;
		}
		UI.requestRendering();
	};

	UIAnimation.paramInput = function () {
		UIAnimation.update(UIAnimation.target, Inspector.getKey(this), this.read());
	};

	UIAnimation.animationIdWrite = function (event) {
		const elMotion = $('#uiAnimation-motion');
		elMotion.loadItems(Animation.getMotionListItems(event.value));
		elMotion.write(elMotion.read());
	};

	Inspector.uiAnimation = UIAnimation;
}
