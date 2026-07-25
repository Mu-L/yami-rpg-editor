import { $, getElementWriter } from '../util/dom.ts';
import { Animation } from '../animation/animation-window.ts';
import { Curve } from '../animation/curve-window.ts';
import { Inspector } from './inspector.ts';

{
	const AnimJointFrame = {
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

	AnimJointFrame.initialize = function () {
		const elements = $(`#animJointFrame-x, #animJointFrame-y, #animJointFrame-rotation,
    #animJointFrame-scaleX, #animJointFrame-scaleY, #animJointFrame-opacity`);
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

	AnimJointFrame.create = function () {
		return {
			start: 0,
			end: 1,
			easingId: '',
			x: 0,
			y: 0,
			rotation: 0,
			scaleX: 1,
			scaleY: 1,
			opacity: 1
		};
	};

	AnimJointFrame.open = function (frame) {
		if (this.target !== frame) {
			this.target = frame;
			this.motion = Animation.motion;
			Curve.load(frame);

			const write = getElementWriter('animJointFrame', frame);
			write('x');
			write('y');
			write('rotation');
			write('scaleX');
			write('scaleY');
			write('opacity');
		}
	};

	AnimJointFrame.close = function () {
		if (this.target) {
			Animation.unselectMarquee(this.target);
			Curve.load(null);
			this.target = null;
			this.motion = null;
		}
	};

	AnimJointFrame.write = function (options) {
		if (options.x !== undefined) {
			$('#animJointFrame-x').write(options.x);
		}
		if (options.y !== undefined) {
			$('#animJointFrame-y').write(options.y);
		}
		if (options.rotation !== undefined) {
			$('#animJointFrame-rotation').write(options.rotation);
		}
		if (options.scaleX !== undefined) {
			$('#animJointFrame-scaleX').write(options.scaleX);
		}
		if (options.scaleY !== undefined) {
			$('#animJointFrame-scaleY').write(options.scaleY);
		}
	};

	AnimJointFrame.update = function (frame, key, value) {
		Animation.planToSave();
		switch (key) {
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
		}
		Animation.requestRendering();
	};

	AnimJointFrame.paramInput = function (event) {
		AnimJointFrame.update(AnimJointFrame.target, Inspector.getKey(this), this.read());
	};

	Inspector.animJointFrame = AnimJointFrame;
}
