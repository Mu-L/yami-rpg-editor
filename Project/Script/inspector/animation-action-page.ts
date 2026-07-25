import { $, getElementWriter } from '@/util/dom.ts';
import { Animation } from '@/animation/animation-window.ts';
import { Inspector } from './inspector.ts';

{
	const AnimMotion = {
		owner: null,
		target: null,
		initialize: null,
		create: null,
		createDir: null,
		open: null,
		close: null,
		write: null,
		update: null,
		paramInput: null
	};

	AnimMotion.initialize = function () {
		this.owner = {
			setTarget: (motion) => {
				Animation.setMotion(motion);
				Inspector.open('animMotion', motion);
			}
		};

		$('#animMotion-mode').loadItems([
			{ name: '1 Directional', value: '1-dir' },
			{ name: '2 Directional', value: '2-dir' },
			{ name: '4 Directional', value: '4-dir' },
			{ name: '8 Directional', value: '8-dir' },
			{ name: '1 Directional - Mirror', value: '1-dir-mirror' },
			{ name: '2 Directional - Mirror', value: '2-dir-mirror' },
			{ name: '3 Directional - Mirror', value: '3-dir-mirror' },
			{ name: '5 Directional - Mirror', value: '5-dir-mirror' }
		]);

		$('#animMotion-loop').relate([$('#animMotion-loopStart')]);

		const elMode = $('#animMotion-mode');
		const elements = $('#animMotion-skip, #animMotion-loop, #animMotion-loopStart');
		elMode.on('input', this.paramInput);
		elements.on('input', this.paramInput);
		elements.on('focus', Inspector.inputFocus);
		elements.on('blur', Inspector.inputBlur(this, Animation));
	};

	AnimMotion.create = function (motionId) {
		return {
			class: 'motion',
			id: motionId,
			mode: '1-dir',
			skip: false,
			loop: false,
			loopStart: 0,
			dirCases: [this.createDir()]
		};
	};

	AnimMotion.createDir = function () {
		return { layers: [] };
	};

	AnimMotion.open = function (motion) {
		if (this.target !== motion) {
			this.target = motion;

			const write = getElementWriter('animMotion', motion);
			write('mode');
			write('skip');
			write('loop');
			write('loopStart');
		}
	};

	AnimMotion.close = function () {
		if (this.target) {
			// 此处不能unselect并update Animation.list.unselect(this.target) Animation.updateTarget()
			this.target = null;
		}
	};

	AnimMotion.write = function (options) {
		if (options.mode !== undefined) {
			$('#animMotion-mode').write(options.mode);
		}
	};

	AnimMotion.update = function (motion, key, value) {
		Animation.planToSave();
		switch (key) {
			case 'mode':
				if (motion.mode !== value) {
					Animation.setMotionMode(value);
					Animation.createDirItems();
				}
				break;
			case 'skip':
			case 'loopStart':
				if (motion[key] !== value) {
					motion[key] = value;
				}
				break;
			case 'loop':
				if (motion.loop !== value) {
					motion.loop = value;
					Animation.list.updateLoopIcon(motion);
				}
				break;
		}
	};

	AnimMotion.paramInput = function (event) {
		AnimMotion.update(AnimMotion.target, Inspector.getKey(this), this.read());
	};

	Inspector.animMotion = AnimMotion;
}
