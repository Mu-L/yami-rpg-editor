import { $, getElementWriter } from '@/util/dom.ts';
import { Animation } from '@/animation/animation-window.ts';
import { Curve } from '@/animation/curve-window.ts';
import { Inspector } from './inspector.ts';
import { Sprite } from '@/sprite/sprite.ts';

{
	const AnimSpriteFrame = {
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

	AnimSpriteFrame.initialize = function () {
		$('#animSpriteFrame-tint-0-slider').synchronize($('#animSpriteFrame-tint-0'));
		$('#animSpriteFrame-tint-1-slider').synchronize($('#animSpriteFrame-tint-1'));
		$('#animSpriteFrame-tint-2-slider').synchronize($('#animSpriteFrame-tint-2'));
		$('#animSpriteFrame-tint-3-slider').synchronize($('#animSpriteFrame-tint-3'));

		const elements = $(`
    #animSpriteFrame-anchorX, #animSpriteFrame-anchorY,
    #animSpriteFrame-pivotX, #animSpriteFrame-pivotY,
    #animSpriteFrame-x, #animSpriteFrame-y, #animSpriteFrame-rotation,
    #animSpriteFrame-scaleX, #animSpriteFrame-scaleY, #animSpriteFrame-opacity,
    #animSpriteFrame-tint-0, #animSpriteFrame-tint-1, #animSpriteFrame-tint-2, #animSpriteFrame-tint-3`);
		const sliders = $(`
    #animSpriteFrame-tint-0-slider, #animSpriteFrame-tint-1-slider,
    #animSpriteFrame-tint-2-slider, #animSpriteFrame-tint-3-slider`);
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
		sliders.on('focus', Inspector.sliderFocus);
		sliders.on('blur', Inspector.sliderBlur);

		Sprite.initialize();
	};

	AnimSpriteFrame.create = function () {
		return {
			start: 0,
			end: 1,
			easingId: '',
			anchorX: 0.5,
			anchorY: 0.5,
			pivotX: 0,
			pivotY: 0,
			x: 0,
			y: 0,
			rotation: 0,
			scaleX: 1,
			scaleY: 1,
			opacity: 1,
			spriteX: 0,
			spriteY: 0,
			tint: [0, 0, 0, 0]
		};
	};

	AnimSpriteFrame.open = function (frame) {
		if (this.target !== frame) {
			this.target = frame;
			this.motion = Animation.motion;
			Sprite.open(frame);
			Curve.load(frame);

			const write = getElementWriter('animSpriteFrame', frame);
			write('anchorX');
			write('anchorY');
			write('pivotX');
			write('pivotY');
			write('x');
			write('y');
			write('rotation');
			write('scaleX');
			write('scaleY');
			write('opacity');
			write('tint-0');
			write('tint-1');
			write('tint-2');
			write('tint-3');
		}
	};

	AnimSpriteFrame.close = function () {
		if (this.target) {
			Animation.unselectMarquee(this.target);
			Sprite.close();
			Curve.load(null);
			this.target = null;
			this.motion = null;
		}
	};

	AnimSpriteFrame.write = function (options) {
		if (options.anchorX !== undefined) {
			$('#animSpriteFrame-anchorX').write(options.anchorX);
		}
		if (options.anchorY !== undefined) {
			$('#animSpriteFrame-anchorY').write(options.anchorY);
		}
		if (options.pivotX !== undefined) {
			$('#animSpriteFrame-pivotX').write(options.pivotX);
		}
		if (options.pivotY !== undefined) {
			$('#animSpriteFrame-pivotY').write(options.pivotY);
		}
		if (options.x !== undefined) {
			$('#animSpriteFrame-x').write(options.x);
		}
		if (options.y !== undefined) {
			$('#animSpriteFrame-y').write(options.y);
		}
		if (options.rotation !== undefined) {
			$('#animSpriteFrame-rotation').write(options.rotation);
		}
		if (options.scaleX !== undefined) {
			$('#animSpriteFrame-scaleX').write(options.scaleX);
		}
		if (options.scaleY !== undefined) {
			$('#animSpriteFrame-scaleY').write(options.scaleY);
		}
	};

	AnimSpriteFrame.update = function (frame, key, value) {
		Animation.planToSave();
		switch (key) {
			case 'anchorX':
			case 'anchorY':
			case 'pivotX':
			case 'pivotY':
			case 'x':
			case 'y':
			case 'rotation':
			case 'scaleX':
			case 'scaleY':
			case 'opacity':
				if (frame[key] !== value) {
					frame[key] = value;
					Animation.updateFrameContexts();
				}
				break;
			case 'tint-0':
			case 'tint-1':
			case 'tint-2':
			case 'tint-3': {
				const index = key.slice(-1);
				if (frame.tint[index] !== value) {
					frame.tint[index] = value;
					Animation.updateFrameContexts();
				}
				break;
			}
		}
		Animation.requestRendering();
	};

	AnimSpriteFrame.paramInput = function (event) {
		AnimSpriteFrame.update(AnimSpriteFrame.target, Inspector.getKey(this), this.read());
	};

	Inspector.animSpriteFrame = AnimSpriteFrame;
}
