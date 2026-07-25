import { $, getElementWriter } from '../util/dom.ts';
import { Animation } from '../animation/animation-window.ts';
import { Inspector } from './inspector.ts';

{
	const AnimSoundLayer = {
		motion: null,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		paramInput: null
	};

	AnimSoundLayer.initialize = function () {
		$('#animSoundLayer-playbackRate').loadItems([
			{ name: 'Default', value: 'default' },
			{ name: 'Inherit', value: 'inherit' }
		]);

		const element = $('#animSoundLayer-playbackRate');
		element.on('input', this.paramInput);
		element.on('focus', Inspector.inputFocus);
		element.on(
			'blur',
			Inspector.inputBlur(this, Animation, (data) => {
				data.type = 'inspector-layer-change';
				data.motion = this.motion;
				data.direction = Animation.direction;
			})
		);
	};

	AnimSoundLayer.create = function () {
		return {
			class: 'sound',
			name: 'Sound',
			hidden: false,
			locked: false,
			playbackRate: 'default',
			frames: [Inspector.animSoundFrame.create()]
		};
	};

	AnimSoundLayer.open = function (layer) {
		if (this.target !== layer) {
			this.target = layer;
			this.motion = Animation.motion;

			const write = getElementWriter('animSoundLayer', layer);
			write('playbackRate');
		}
	};

	AnimSoundLayer.close = function () {
		if (this.target) {
			this.target = null;
			this.motion = null;
		}
	};

	AnimSoundLayer.update = function (layer, key, value) {
		Animation.planToSave();
		switch (key) {
			case 'playbackRate':
				if (layer[key] !== value) {
					layer[key] = value;
				}
				break;
		}
	};

	AnimSoundLayer.paramInput = function (event) {
		AnimSoundLayer.update(AnimSoundLayer.target, Inspector.getKey(this), this.read());
	};

	Inspector.animSoundLayer = AnimSoundLayer;
}
