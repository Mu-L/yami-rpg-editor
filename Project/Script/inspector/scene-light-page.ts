import { $, getElementWriter } from '@/util/dom.ts';
import { Inspector } from './inspector.ts';
import { Scene } from '@/scene/scene-window.ts';
import { ConditionListInterface } from '@/tools/condition-list.ts';
import { EventListInterface } from '@/tools/event-list.ts';
import { ScriptListInterface } from '@/tools/script-list.ts';

{
	const SceneLight = {
		owner: Scene,
		target: null,
		nameBox: $('#sceneLight-name'),
		initialize: null,
		create: null,
		open: null,
		close: null,
		write: null,
		update: null,
		paramInput: null
	};

	SceneLight.initialize = function () {
		$('#sceneLight-type').loadItems([
			{ name: 'Point', value: 'point' },
			{ name: 'Area', value: 'area' }
		]);

		$('#sceneLight-blend').loadItems([
			{ name: 'Screen', value: 'screen' },
			{ name: 'Additive', value: 'additive' },
			{ name: 'Subtract', value: 'subtract' },
			{ name: 'Max', value: 'max' }
		]);

		$('#sceneLight-type')
			.enableHiddenMode()
			.relate([
				{
					case: 'point',
					targets: [$('#sceneLight-range-box'), $('#sceneLight-intensity-box')]
				},
				{
					case: 'area',
					targets: [
						$('#sceneLight-mask'),
						$('#sceneLight-anchorX-box'),
						$('#sceneLight-anchorY-box'),
						$('#sceneLight-width-box'),
						$('#sceneLight-height-box'),
						$('#sceneLight-angle-box')
					]
				}
			]);

		$('#sceneLight-conditions').bind(new ConditionListInterface(this, Scene));

		$('#sceneLight-events').bind(new EventListInterface(this, Scene));

		$('#sceneLight-scripts').bind(new ScriptListInterface(this, Scene));

		$('#sceneLight-parameter-pane').bind($('#sceneLight-scripts'));

		$('#sceneLight-range-slider').synchronize($('#sceneLight-range'));
		$('#sceneLight-intensity-slider').synchronize($('#sceneLight-intensity'));
		$('#sceneLight-anchorX-slider').synchronize($('#sceneLight-anchorX'));
		$('#sceneLight-anchorY-slider').synchronize($('#sceneLight-anchorY'));
		$('#sceneLight-width-slider').synchronize($('#sceneLight-width'));
		$('#sceneLight-height-slider').synchronize($('#sceneLight-height'));
		$('#sceneLight-angle-slider').synchronize($('#sceneLight-angle'));
		$('#sceneLight-red-slider').synchronize($('#sceneLight-red'));
		$('#sceneLight-green-slider').synchronize($('#sceneLight-green'));
		$('#sceneLight-blue-slider').synchronize($('#sceneLight-blue'));
		$('#sceneLight-direct-slider').synchronize($('#sceneLight-direct'));

		const elements = $(`
    #sceneLight-name, #sceneLight-type,
    #sceneLight-blend, #sceneLight-x, #sceneLight-y,
    #sceneLight-range, #sceneLight-intensity,
    #sceneLight-mask, #sceneLight-anchorX, #sceneLight-anchorY,
    #sceneLight-width, #sceneLight-height, #sceneLight-angle,
    #sceneLight-red, #sceneLight-green, #sceneLight-blue, #sceneLight-direct`);
		const sliders = $(`
    #sceneLight-range-slider, #sceneLight-intensity-slider,
    #sceneLight-anchorX-slider, #sceneLight-anchorY-slider,
    #sceneLight-width-slider, #sceneLight-height-slider, #sceneLight-angle-slider,
    #sceneLight-red-slider, #sceneLight-green-slider, #sceneLight-blue-slider, #sceneLight-direct-slider`);
		elements.on('input', this.paramInput);
		elements.on('focus', Inspector.inputFocus);
		elements.on('blur', Inspector.inputBlur(this, Scene));
		sliders.on('focus', Inspector.sliderFocus);
		sliders.on('blur', Inspector.sliderBlur);
		$('#sceneLight-conditions, #sceneLight-events, #sceneLight-scripts').on(
			'change',
			Scene.listChange
		);
	};

	SceneLight.create = function () {
		return {
			class: 'light',
			name: 'Light',
			enabled: true,
			hidden: false,
			locked: false,
			presetId: '',
			type: 'point',
			blend: 'screen',
			x: 0,
			y: 0,
			range: 4,
			intensity: 0,
			mask: '',
			anchorX: 0.5,
			anchorY: 0.5,
			width: 1,
			height: 1,
			angle: 0,
			red: 255,
			green: 255,
			blue: 255,
			direct: 0.5,
			conditions: [],
			events: [],
			scripts: []
		};
	};

	SceneLight.open = function (light) {
		if (this.target !== light) {
			this.target = light;

			const write = getElementWriter('sceneLight', light);
			write('name');
			write('type');
			write('blend');
			write('x');
			write('y');
			write('range');
			write('intensity');
			write('mask');
			write('anchorX');
			write('anchorY');
			write('width');
			write('height');
			write('angle');
			write('red');
			write('green');
			write('blue');
			write('direct');
			write('conditions');
			write('events');
			write('scripts');
		}
	};

	SceneLight.close = function () {
		if (this.target) {
			Scene.list.unselect(this.target);
			Scene.updateTarget();
			this.target = null;
			$('#sceneLight-conditions').clear();
			$('#sceneLight-events').clear();
			$('#sceneLight-scripts').clear();
			$('#sceneLight-parameter-pane').clear();
		}
	};

	SceneLight.write = function (options) {
		if (options.x !== undefined) {
			$('#sceneLight-x').write(options.x);
		}
		if (options.y !== undefined) {
			$('#sceneLight-y').write(options.y);
		}
	};

	SceneLight.update = function (light, key, value) {
		Scene.planToSave();
		switch (key) {
			case 'name':
				if (light.name !== value) {
					light.name = value;
					Scene.updateTargetInfo();
					Scene.list.updateItemName(light);
				}
				break;
			case 'type':
				if (light.type !== value) {
					light.type = value;
					light.instance.measure();
				}
				break;
			case 'blend':
			case 'x':
			case 'y':
			case 'range':
			case 'intensity':
			case 'mask':
				if (light[key] !== value) {
					light[key] = value;
				}
				break;
			case 'anchorX':
			case 'anchorY':
			case 'width':
			case 'height':
			case 'angle':
				if (light[key] !== value) {
					light[key] = value;
					light.instance.measure();
				}
				break;
			case 'red':
			case 'green':
			case 'blue':
				if (light[key] !== value) {
					light[key] = value;
					Scene.list.updateIcon(light);
				}
				break;
			case 'direct':
				if (light[key] !== value) {
					light[key] = value;
				}
				break;
		}
		Scene.requestRendering();
	};

	SceneLight.paramInput = function (event) {
		SceneLight.update(SceneLight.target, Inspector.getKey(this), this.read());
	};

	Inspector.sceneLight = SceneLight;
}
