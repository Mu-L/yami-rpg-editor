import { $, getElementWriter } from '../util/dom.ts';
import { Animation } from '../animation/animation-window.ts';
import { Inspector } from './inspector.ts';

{
	const AnimSpriteLayer = {
		motion: null,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		paramInput: null
	};

	AnimSpriteLayer.initialize = function () {
		$('#animSpriteLayer-blend').loadItems([
			{ name: 'Normal', value: 'normal' },
			{ name: 'Additive', value: 'additive' },
			{ name: 'Subtract', value: 'subtract' }
		]);

		$('#animSpriteLayer-light').loadItems([
			{ name: 'Raw', value: 'raw' },
			{ name: 'Global Sampling', value: 'global' },
			{ name: 'Anchor Sampling', value: 'anchor' }
		]);

		const elements = $(
			'#animSpriteLayer-sprite, #animSpriteLayer-blend, #animSpriteLayer-light'
		);
		elements.on('input', this.paramInput);
		elements.on('focus', Inspector.inputFocus);
		elements.on(
			'blur',
			Inspector.inputBlur(this, Animation, (data) => {
				data.type = 'inspector-layer-change';
				data.motion = this.motion;
				data.direction = Animation.direction;
			})
		);
	};

	AnimSpriteLayer.create = function () {
		return {
			class: 'sprite',
			name: 'Sprite',
			hidden: false,
			locked: false,
			sprite: '',
			blend: 'normal',
			light: 'raw',
			frames: [Inspector.animSpriteFrame.create()]
		};
	};

	AnimSpriteLayer.open = function (layer) {
		if (this.target !== layer) {
			this.target = layer;
			this.motion = Animation.motion;

			const id = Animation.meta.guid;
			const items = Animation.getSpriteListItems(id);
			$('#animSpriteLayer-sprite').loadItems(items);

			const write = getElementWriter('animSpriteLayer', layer);
			write('sprite');
			write('blend');
			write('light');
		}
	};

	AnimSpriteLayer.close = function () {
		if (this.target) {
			this.target = null;
			this.motion = null;
		}
	};

	AnimSpriteLayer.update = function (layer, key, value) {
		Animation.planToSave();
		switch (key) {
			case 'sprite':
			case 'blend':
			case 'light':
				if (layer[key] !== value) {
					layer[key] = value;
				}
				break;
		}
		Animation.requestRendering();
	};

	AnimSpriteLayer.paramInput = function (event) {
		AnimSpriteLayer.update(AnimSpriteLayer.target, Inspector.getKey(this), this.read());
	};

	Inspector.animSpriteLayer = AnimSpriteLayer;
}
