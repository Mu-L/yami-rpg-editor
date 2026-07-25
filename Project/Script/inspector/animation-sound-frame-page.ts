import { $, getElementWriter } from '@/util/dom.ts';
import { Animation } from '@/animation/animation-window.ts';
import { Inspector } from './inspector.ts';

{
	const AnimSoundFrame = {
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

	AnimSoundFrame.initialize = function () {
		const elements = $('#animSoundFrame-sound, #animSoundFrame-volume');
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

	AnimSoundFrame.create = function () {
		return {
			start: 0,
			end: 1,
			sound: '',
			volume: 1
		};
	};

	AnimSoundFrame.open = function (frame) {
		if (this.target !== frame) {
			this.target = frame;
			this.motion = Animation.motion;

			const write = getElementWriter('animSoundFrame', frame);
			write('sound');
			write('volume');
		}
	};

	AnimSoundFrame.close = function () {
		if (this.target) {
			Animation.unselectMarquee(this.target);
			this.target = null;
			this.motion = null;
		}
	};

	AnimSoundFrame.write = function (options) {
		if (options.sound !== undefined) {
			$('#animSoundFrame-sound').write(options.sound);
		}
		if (options.volume !== undefined) {
			$('#animSoundFrame-volume').write(options.volume);
		}
	};

	AnimSoundFrame.update = function (frame, key, value) {
		Animation.planToSave();
		switch (key) {
			case 'sound':
			case 'volume':
				if (frame[key] !== value) {
					frame[key] = value;
				}
				break;
		}
	};

	AnimSoundFrame.paramInput = function (event) {
		AnimSoundFrame.update(AnimSoundFrame.target, Inspector.getKey(this), this.read());
	};

	Inspector.animSoundFrame = AnimSoundFrame;
}
