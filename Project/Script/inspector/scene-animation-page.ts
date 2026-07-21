import { $, getElementWriter } from '../util/dom.ts';
import { Animation } from '../animation/animation-window.ts';
import { Inspector } from './inspector.ts';
import { Scene } from '../scene/scene-window.ts';
import { ConditionListInterface } from '../tools/condition-list.ts';
import { EventListInterface } from '../tools/event-list.ts';
import { ScriptListInterface } from '../tools/script-list.ts';

// ******************************** 场景 - 动画页面 ********************************

{
	const SceneAnimation = {
		// properties
		owner: Scene,
		target: null,
		nameBox: $('#sceneAnimation-name'),
		motions: null,
		// methods
		initialize: null,
		create: null,
		open: null,
		close: null,
		write: null,
		update: null,
		// events
		animationIdWrite: null,
		paramInput: null
	};

	// 初始化
	SceneAnimation.initialize = function () {
		// 创建动画旋转选项
		$('#sceneAnimation-rotatable').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		]);

		// 绑定条件列表
		$('#sceneAnimation-conditions').bind(
			new ConditionListInterface(this, Scene)
		);

		// 绑定事件列表
		$('#sceneAnimation-events').bind(new EventListInterface(this, Scene));

		// 绑定脚本列表
		$('#sceneAnimation-scripts').bind(new ScriptListInterface(this, Scene));

		// 绑定脚本参数面板
		$('#sceneAnimation-parameter-pane').bind($('#sceneAnimation-scripts'));

		// 同步滑动框和数字框的数值
		$('#sceneAnimation-angle-slider').synchronize(
			$('#sceneAnimation-angle')
		);
		$('#sceneAnimation-scale-slider').synchronize(
			$('#sceneAnimation-scale')
		);
		$('#sceneAnimation-speed-slider').synchronize(
			$('#sceneAnimation-speed')
		);
		$('#sceneAnimation-opacity-slider').synchronize(
			$('#sceneAnimation-opacity')
		);
		$('#sceneAnimation-priority-slider').synchronize(
			$('#sceneAnimation-priority')
		);

		// 侦听事件
		$('#sceneAnimation-animationId').on('write', this.animationIdWrite);
		const elements = $(`#sceneAnimation-name, #sceneAnimation-animationId,
    #sceneAnimation-motion, #sceneAnimation-rotatable, #sceneAnimation-x, #sceneAnimation-y,
    #sceneAnimation-angle, #sceneAnimation-scale, #sceneAnimation-speed,
    #sceneAnimation-opacity, #sceneAnimation-priority`);
		const sliders = $(`#sceneAnimation-angle-slider,
    #sceneAnimation-scale-slider, #sceneAnimation-speed-slider,
    #sceneAnimation-opacity-slider, #sceneAnimation-priority-slider`);
		elements.on('input', this.paramInput);
		elements.on('focus', Inspector.inputFocus);
		elements.on('blur', Inspector.inputBlur(this, Scene));
		sliders.on('focus', Inspector.sliderFocus);
		sliders.on('blur', Inspector.sliderBlur);
		$(
			'#sceneAnimation-conditions, #sceneAnimation-events, #sceneAnimation-scripts'
		).on('change', Scene.listChange);
	};

	// 创建动画
	SceneAnimation.create = function () {
		return {
			class: 'animation',
			name: 'Animation',
			enabled: true,
			hidden: false,
			locked: false,
			presetId: '',
			animationId: '',
			motion: '',
			rotatable: false,
			x: 0,
			y: 0,
			angle: 0,
			scale: 1,
			speed: 1,
			opacity: 1,
			priority: 0,
			conditions: [],
			events: [],
			scripts: []
		};
	};

	// 打开数据
	SceneAnimation.open = function (animation) {
		if (this.target !== animation) {
			this.target = animation;

			// 写入数据
			const write = getElementWriter('sceneAnimation', animation);
			write('name');
			write('animationId');
			write('motion');
			write('rotatable');
			write('x');
			write('y');
			write('angle');
			write('scale');
			write('speed');
			write('opacity');
			write('priority');
			write('conditions');
			write('events');
			write('scripts');
		}
	};

	// 关闭数据
	SceneAnimation.close = function () {
		if (this.target) {
			Scene.list.unselect(this.target);
			Scene.updateTarget();
			this.target = null;
			this.motions = null;
			$('#sceneAnimation-conditions').clear();
			$('#sceneAnimation-events').clear();
			$('#sceneAnimation-scripts').clear();
			$('#sceneAnimation-parameter-pane').clear();
		}
	};

	// 写入数据
	SceneAnimation.write = function (options) {
		if (options.x !== undefined) {
			$('#sceneAnimation-x').write(options.x);
		}
		if (options.y !== undefined) {
			$('#sceneAnimation-y').write(options.y);
		}
		if (options.angle !== undefined) {
			$('#sceneAnimation-angle').write(options.angle);
		}
	};

	// 更新数据
	SceneAnimation.update = function (animation, key, value) {
		Scene.planToSave();
		switch (key) {
			case 'name':
				if (animation.name !== value) {
					animation.name = value;
					Scene.updateTargetInfo();
					Scene.list.updateItemName(animation);
				}
				break;
			case 'animationId':
				if (animation.animationId !== value) {
					animation.animationId = value;
					SceneAnimation.motions = null;
					Scene.destroyObjectContext(animation);
					Scene.loadAnimationContext(animation);
				}
				break;
			case 'motion':
				if (animation.motion !== value) {
					animation.motion = value;
					if (animation.player.setMotion(value)) {
						animation.player.restart();
					}
				}
				break;
			case 'rotatable':
				if (animation.rotatable !== value) {
					animation.rotatable = value;
					animation.player.rotatable = value;
					animation.player.rotation = 0;
					animation.player.setAngle(animation.player.angle);
				}
				break;
			case 'x':
			case 'y':
			case 'priority':
				if (animation[key] !== value) {
					animation[key] = value;
				}
				break;
			case 'angle':
				if (animation.angle !== value) {
					animation.angle = value;
					animation.player.setAngle(Math.radians(value));
				}
				break;
			case 'scale':
				if (animation.scale !== value) {
					animation.scale = value;
					animation.player.setScale(value);
				}
				break;
			case 'speed':
				if (animation.speed !== value) {
					animation.speed = value;
					animation.player.setSpeed(value);
				}
				break;
			case 'opacity':
				if (animation.opacity !== value) {
					animation.opacity = value;
					animation.player.setOpacity(value);
				}
				break;
		}
		Scene.requestRendering();
	};

	// 动画ID - 写入事件
	SceneAnimation.animationIdWrite = function (event) {
		const elMotion = $('#sceneAnimation-motion');
		const items = Animation.getMotionListItems(event.value);
		elMotion.loadItems(items);
		elMotion.write(elMotion.read() ?? items[0].value);
	};

	// 参数 - 输入事件
	SceneAnimation.paramInput = function (event) {
		SceneAnimation.update(
			SceneAnimation.target,
			Inspector.getKey(this),
			this.read()
		);
	};

	Inspector.sceneAnimation = SceneAnimation;
}
