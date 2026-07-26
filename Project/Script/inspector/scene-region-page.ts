import { $, getElementWriter } from '@/util/dom.ts';
import { Inspector } from './inspector.ts';
import { Scene } from '@/scene/scene-window.ts';
import { ConditionListInterface } from '@/tools/condition-list.ts';
import { EventListInterface } from '@/tools/event-list.ts';
import { ScriptListInterface } from '@/tools/script-list.ts';

{
	const SceneRegion = {
		owner: Scene,
		target: null,
		nameBox: $('#sceneRegion-name'),
		initialize: null,
		create: null,
		open: null,
		close: null,
		write: null,
		update: null,
		paramInput: null
	};

	SceneRegion.initialize = function () {
		$('#sceneRegion-conditions').bind(new ConditionListInterface(this, Scene));

		$('#sceneRegion-events').bind(new EventListInterface(this, Scene));

		$('#sceneRegion-scripts').bind(new ScriptListInterface(this, Scene));

		$('#sceneRegion-parameter-pane').bind($('#sceneRegion-scripts'));

		const elements = $(`#sceneRegion-name, #sceneRegion-color,
    #sceneRegion-x, #sceneRegion-y, #sceneRegion-width, #sceneRegion-height`);
		elements.on('input', this.paramInput);
		elements.on('focus', Inspector.inputFocus);
		elements.on('blur', Inspector.inputBlur(this, Scene));
		$('#sceneRegion-conditions, #sceneRegion-events, #sceneRegion-scripts').on(
			'change',
			Scene.listChange
		);
	};

	SceneRegion.create = function () {
		return {
			class: 'region',
			name: 'Region',
			enabled: true,
			hidden: false,
			locked: false,
			presetId: '',
			color: '00000080',
			x: 0,
			y: 0,
			width: 1,
			height: 1,
			conditions: [],
			events: [],
			scripts: []
		};
	};

	SceneRegion.open = function (region) {
		if (this.target !== region) {
			this.target = region;

			const write = getElementWriter('sceneRegion', region);
			write('name');
			write('color');
			write('x');
			write('y');
			write('width');
			write('height');
			write('conditions');
			write('events');
			write('scripts');
		}
	};

	SceneRegion.close = function () {
		if (this.target) {
			Scene.list.unselect(this.target);
			Scene.updateTarget();
			this.target = null;
			$('#sceneRegion-conditions').clear();
			$('#sceneRegion-events').clear();
			$('#sceneRegion-scripts').clear();
			$('#sceneRegion-parameter-pane').clear();
		}
	};

	SceneRegion.write = function (options) {
		if (options.x !== undefined) {
			$('#sceneRegion-x').write(options.x);
		}
		if (options.y !== undefined) {
			$('#sceneRegion-y').write(options.y);
		}
	};

	SceneRegion.update = function (region, key, value) {
		Scene.planToSave();
		switch (key) {
			case 'name':
				if (region.name !== value) {
					region.name = value;
					Scene.updateTargetInfo();
					Scene.list.updateItemName(region);
				}
				break;
			case 'x':
			case 'y':
			case 'width':
			case 'height':
				if (region[key] !== value) {
					region[key] = value;
				}
				break;
			case 'color':
				if (region.color !== value) {
					region.color = value;
					Scene.list.updateIcon(region);
				}
				break;
		}
		Scene.requestRendering();
	};

	SceneRegion.paramInput = function () {
		SceneRegion.update(SceneRegion.target, Inspector.getKey(this), this.read());
	};

	Inspector.sceneRegion = SceneRegion;
}
