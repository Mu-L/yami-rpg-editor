import { $, getElementWriter } from '@/util/dom.ts';
import { Animation } from '@/animation/animation-window.ts';
import { Inspector } from './inspector.ts';

{
	const AnimParticleLayer = {
		motion: null,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		paramInput: null
	};

	AnimParticleLayer.initialize = function () {
		$('#animParticleLayer-position').loadItems([
			{ name: 'Absolute', value: 'absolute' },
			{ name: 'Relative', value: 'relative' }
		]);

		$('#animParticleLayer-angle').loadItems([
			{ name: 'Default', value: 'default' },
			{ name: 'Inherit', value: 'inherit' }
		]);

		$('#animParticleLayer-order').loadItems([
			{ name: 'Behind Sprites', value: 'before' },
			{ name: 'Front of Sprites', value: 'after' }
		]);

		const elements = $(
			'#animParticleLayer-particleId, #animParticleLayer-position, #animParticleLayer-angle, #animParticleLayer-order'
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

	AnimParticleLayer.create = function () {
		return {
			class: 'particle',
			name: 'Particle',
			hidden: false,
			locked: false,
			particleId: '',
			position: 'absolute',
			angle: 'default',
			order: 'after',
			frames: [Inspector.animParticleFrame.create()]
		};
	};

	AnimParticleLayer.open = function (layer) {
		if (this.target !== layer) {
			this.target = layer;
			this.motion = Animation.motion;

			const write = getElementWriter('animParticleLayer', layer);
			write('particleId');
			write('position');
			write('angle');
			write('order');
		}
	};

	AnimParticleLayer.close = function () {
		if (this.target) {
			this.target = null;
			this.motion = null;
		}
	};

	AnimParticleLayer.update = function (layer, key, value) {
		Animation.planToSave();
		switch (key) {
			case 'particleId':
				if (layer.particleId !== value) {
					layer.particleId = value;
					Animation.player.destroyContextEmitters();
					Animation.updateFrameContexts();
				}
				break;
			case 'position':
			case 'angle':
			case 'order':
				if (layer[key] !== value) {
					layer[key] = value;
				}
				break;
		}
		Animation.requestRendering();
	};

	AnimParticleLayer.paramInput = function (event) {
		AnimParticleLayer.update(AnimParticleLayer.target, Inspector.getKey(this), this.read());
	};

	Inspector.animParticleLayer = AnimParticleLayer;
}
