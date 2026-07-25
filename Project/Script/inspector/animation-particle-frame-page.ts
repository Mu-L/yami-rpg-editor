import { $, getElementWriter } from '../util/dom.ts';
import { Animation } from '../animation/animation-window.ts';
import { Curve } from '../animation/curve-window.ts';
import { Inspector } from './inspector.ts';

{
	const AnimParticleFrame = {
		motion: null,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		write: null,
		update: null,
		paramInput: null
	};

	AnimParticleFrame.initialize = function () {
		const elements = $(`#animParticleFrame-x, #animParticleFrame-y, #animParticleFrame-rotation,
    #animParticleFrame-scaleX, #animParticleFrame-scaleY, #animParticleFrame-opacity,
    #animParticleFrame-scale, #animParticleFrame-speed`);
		elements.on('input', this.paramInput);
		elements.on('focus', Inspector.inputFocus);
		elements.on(
			'blur',
			Inspector.inputBlur(this, Animation, (data) => {
				data.type = 'inspector-frame-change';
				data.motion = this.motion;
				data.direction = Animation.direction;
			})
		);
	};

	AnimParticleFrame.create = function () {
		return {
			start: 0,
			end: 1,
			easingId: '',
			x: 0,
			y: 0,
			rotation: 0,
			scaleX: 1,
			scaleY: 1,
			opacity: 1,
			scale: 1,
			speed: 1
		};
	};

	AnimParticleFrame.open = function (frame) {
		if (this.target !== frame) {
			this.target = frame;
			this.motion = Animation.motion;
			Curve.load(frame);

			const write = getElementWriter('animParticleFrame', frame);
			write('x');
			write('y');
			write('rotation');
			write('scaleX');
			write('scaleY');
			write('opacity');
			write('scale');
			write('speed');
		}
	};

	AnimParticleFrame.close = function () {
		if (this.target) {
			Animation.unselectMarquee(this.target);
			Curve.load(null);
			this.target = null;
			this.motion = null;
		}
	};

	AnimParticleFrame.write = function (options) {
		if (options.x !== undefined) {
			$('#animParticleFrame-x').write(options.x);
		}
		if (options.y !== undefined) {
			$('#animParticleFrame-y').write(options.y);
		}
		if (options.rotation !== undefined) {
			$('#animParticleFrame-rotation').write(options.rotation);
		}
		if (options.scaleX !== undefined) {
			$('#animParticleFrame-scaleX').write(options.scaleX);
		}
		if (options.scaleY !== undefined) {
			$('#animParticleFrame-scaleY').write(options.scaleY);
		}
	};

	AnimParticleFrame.update = function (frame, key, value) {
		Animation.planToSave();
		switch (key) {
			case 'x':
			case 'y':
			case 'rotation':
			case 'scaleX':
			case 'scaleY':
			case 'opacity':
			case 'scale':
				if (frame[key] !== value) {
					frame[key] = value;
					Animation.updateFrameContexts();
				}
				break;
			case 'speed':
				if (frame[key] !== value) {
					frame[key] = value;
				}
				break;
		}
		Animation.requestRendering();
	};

	AnimParticleFrame.paramInput = function (event) {
		AnimParticleFrame.update(AnimParticleFrame.target, Inspector.getKey(this), this.read());
	};

	Inspector.animParticleFrame = AnimParticleFrame;
}
