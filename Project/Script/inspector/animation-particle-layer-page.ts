import { $, getElementWriter } from '../util/dom.ts';
import { Animation } from '../animation/animation-window.ts';
import { Inspector } from './inspector.ts';
import { Particle } from '../particle/particle-window.ts';

// ******************************** 动画 - 粒子层页面 ********************************

{
	const AnimParticleLayer = {
		// properties
		motion: null,
		target: null,
		// methods
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		// events
		paramInput: null
	};

	// 初始化
	AnimParticleLayer.initialize = function () {
		// 创建位置选项
		$('#animParticleLayer-position').loadItems([
			{ name: 'Absolute', value: 'absolute' },
			{ name: 'Relative', value: 'relative' }
		]);

		// 创建角度选项
		$('#animParticleLayer-angle').loadItems([
			{ name: 'Default', value: 'default' },
			{ name: 'Inherit', value: 'inherit' }
		]);

		// 创建顺序选项
		$('#animParticleLayer-order').loadItems([
			{ name: 'Behind Sprites', value: 'before' },
			{ name: 'Front of Sprites', value: 'after' }
		]);

		// 侦听事件
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

	// 创建粒子层
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

	// 打开数据
	AnimParticleLayer.open = function (layer) {
		if (this.target !== layer) {
			this.target = layer;
			this.motion = Animation.motion;

			// 写入数据
			const write = getElementWriter('animParticleLayer', layer);
			write('particleId');
			write('position');
			write('angle');
			write('order');
		}
	};

	// 关闭数据
	AnimParticleLayer.close = function () {
		if (this.target) {
			this.target = null;
			this.motion = null;
		}
	};

	// 更新数据
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

	// 参数 - 输入事件
	AnimParticleLayer.paramInput = function (event) {
		AnimParticleLayer.update(
			AnimParticleLayer.target,
			Inspector.getKey(this),
			this.read()
		);
	};

	Inspector.animParticleLayer = AnimParticleLayer;
}
