import { $, getElementWriter } from '../util/dom.ts';
import { Animation } from '../animation/animation-window.ts';
import { Inspector } from './inspector.ts';

// ******************************** 动画 - 音效帧页面 ********************************

{
	const AnimSoundFrame = {
		// properties
		motion: null,
		target: null,
		// methods
		initialize: null,
		create: null,
		open: null,
		close: null,
		write: null,
		update: null,
		// events
		paramInput: null
	};

	// 初始化
	AnimSoundFrame.initialize = function () {
		// 侦听事件
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

	// 创建关键帧
	AnimSoundFrame.create = function () {
		return {
			start: 0, // 帧起始位置
			end: 1, // 帧结束位置
			sound: '', // 音效文件
			volume: 1 // 音量
		};
	};

	// 打开数据
	AnimSoundFrame.open = function (frame) {
		if (this.target !== frame) {
			this.target = frame;
			this.motion = Animation.motion;

			// 写入数据
			const write = getElementWriter('animSoundFrame', frame);
			write('sound');
			write('volume');
		}
	};

	// 关闭数据
	AnimSoundFrame.close = function () {
		if (this.target) {
			Animation.unselectMarquee(this.target);
			this.target = null;
			this.motion = null;
		}
	};

	// 写入数据
	AnimSoundFrame.write = function (options) {
		if (options.sound !== undefined) {
			$('#animSoundFrame-sound').write(options.sound);
		}
		if (options.volume !== undefined) {
			$('#animSoundFrame-volume').write(options.volume);
		}
	};

	// 更新数据
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

	// 参数 - 输入事件
	AnimSoundFrame.paramInput = function (event) {
		AnimSoundFrame.update(AnimSoundFrame.target, Inspector.getKey(this), this.read());
	};

	Inspector.animSoundFrame = AnimSoundFrame;
}
