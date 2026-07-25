import { $, getElementWriter } from '../util/dom.ts';
import { Codec } from '../codec/codec.ts';
import { SelectBox } from '../components/select-box.ts';
import { Inspector } from './inspector.ts';
import { Scene } from '../scene/scene-window.ts';
import { ConditionListInterface } from '../tools/condition-list.ts';
import { EventListInterface } from '../tools/event-list.ts';
import { ScriptListInterface } from '../tools/script-list.ts';

{
	const SceneTilemap = {
		owner: Scene,
		target: null,
		nameBox: $('#sceneTilemap-name'),
		lightBox: $('#sceneTilemap-light'),
		initialize: null,
		create: null,
		open: null,
		close: null,
		write: null,
		update: null,
		layerWrite: null,
		layerInput: null,
		paramInput: null
	};

	SceneTilemap.initialize = function () {
		$('#sceneTilemap-layer').loadItems([
			{ name: 'Background', value: 'background' },
			{ name: 'Foreground', value: 'foreground' },
			{ name: 'Object', value: 'object' }
		]);

		const items = {
			raw: { name: 'Raw', value: 'raw' },
			global: { name: 'Global Sampling', value: 'global' },
			ambient: { name: 'Ambient Light', value: 'ambient' },
			anchor: { name: 'Anchor Sampling', value: 'anchor' }
		};
		this.lightBox.lightItems = {
			all: Object.values(items),
			tile: [items.raw, items.global, items.ambient],
			sprite: [items.raw, items.global, items.anchor]
		};

		// 光线采样选项 - 重写设置选项名字方法
		this.lightBox.setItemNames = function (options) {
			const backup = this.dataItems;
			this.dataItems = this.lightItems.all;
			SelectBox.prototype.setItemNames.call(this, options);
			this.dataItems = backup;
			if (this.dataValue !== null) {
				this.update();
			}
		};

		$('#sceneTilemap-blend').loadItems([
			{ name: 'Normal', value: 'normal' },
			{ name: 'Additive', value: 'additive' },
			{ name: 'Subtract', value: 'subtract' }
		]);

		$('#sceneTilemap-conditions').bind(new ConditionListInterface(this, Scene));

		$('#sceneTilemap-events').bind(new EventListInterface(this, Scene));

		$('#sceneTilemap-scripts').bind(new ScriptListInterface(this, Scene));

		$('#sceneTilemap-parameter-pane').bind($('#sceneTilemap-scripts'));

		const elements = $(`#sceneTilemap-name, #sceneTilemap-layer, #sceneTilemap-order,
    #sceneTilemap-light, #sceneTilemap-blend, #sceneTilemap-x, #sceneTilemap-y,
    #sceneTilemap-anchorX, #sceneTilemap-anchorY, #sceneTilemap-offsetX, #sceneTilemap-offsetY,
    #sceneTilemap-parallaxFactorX, #sceneTilemap-parallaxFactorY, #sceneTilemap-opacity`);
		elements.on('input', this.paramInput);
		elements.on('focus', Inspector.inputFocus);
		elements.on('blur', Inspector.inputBlur(this, Scene));
		$('#sceneTilemap-layer').on('write', this.layerWrite);
		$('#sceneTilemap-layer').on('input', this.layerInput);
		$('#sceneTilemap-width, #sceneTilemap-height').on('change', this.paramInput);
		$('#sceneTilemap-conditions, #sceneTilemap-events, #sceneTilemap-scripts').on(
			'change',
			Scene.listChange
		);
	};

	SceneTilemap.create = function (width = 4, height = 4) {
		const tiles = Scene.createTiles(width, height);
		return Codec.decodeTilemap({
			class: 'tilemap',
			name: 'Tilemap',
			enabled: true,
			hidden: false,
			locked: false,
			presetId: '',
			tilesetMap: {},
			shortcut: Scene.tilemaps.shortcuts.getEmptyIndex(),
			layer: 'background',
			order: 0,
			light: 'global',
			blend: 'normal',
			x: 0,
			y: 0,
			width: width,
			height: height,
			anchorX: 0,
			anchorY: 0,
			offsetX: 0,
			offsetY: 0,
			parallaxFactorX: 1,
			parallaxFactorY: 1,
			opacity: 1,
			code: Codec.encodeTiles(tiles),
			conditions: [],
			events: [],
			scripts: []
		});
	};

	SceneTilemap.open = function (tilemap) {
		if (this.target !== tilemap) {
			this.target = tilemap;

			const write = getElementWriter('sceneTilemap', tilemap);
			write('name');
			write('layer');
			write('order');
			write('light');
			write('blend');
			write('x');
			write('y');
			write('width');
			write('height');
			write('anchorX');
			write('anchorY');
			write('offsetX');
			write('offsetY');
			write('parallaxFactorX');
			write('parallaxFactorY');
			write('opacity');
			write('conditions');
			write('events');
			write('scripts');
		}
	};

	SceneTilemap.close = function () {
		if (this.target) {
			Scene.list.unselect(this.target);
			Scene.updateTarget();
			this.target = null;
			$('#sceneTilemap-conditions').clear();
			$('#sceneTilemap-events').clear();
			$('#sceneTilemap-scripts').clear();
			$('#sceneTilemap-parameter-pane').clear();
		}
	};

	SceneTilemap.write = function (options) {
		if (options.x !== undefined) {
			$('#sceneTilemap-x').write(options.x);
		}
		if (options.y !== undefined) {
			$('#sceneTilemap-y').write(options.y);
		}
		if (options.width !== undefined) {
			$('#sceneTilemap-width').write(options.width);
		}
		if (options.height !== undefined) {
			$('#sceneTilemap-height').write(options.height);
		}
	};

	SceneTilemap.update = function (tilemap, key, value) {
		Scene.planToSave();
		switch (key) {
			case 'name':
				if (tilemap.name !== value) {
					tilemap.name = value;
					Scene.updateTargetInfo();
					Scene.list.updateItemName(tilemap);
				}
				break;
			case 'layer':
			case 'order':
				if (tilemap[key] !== value) {
					tilemap[key] = value;
					Scene.loadObjects();
				}
				break;
			case 'light':
			case 'blend':
			case 'x':
			case 'y':
			case 'anchorX':
			case 'anchorY':
			case 'offsetX':
			case 'offsetY':
			case 'parallaxFactorX':
			case 'parallaxFactorY':
			case 'opacity':
				if (tilemap[key] !== value) {
					tilemap[key] = value;
				}
				break;
			case 'width':
				if (tilemap.width !== value) {
					Scene.setTilemapSize(tilemap, value, tilemap.height);
				}
				break;
			case 'height':
				if (tilemap.height !== value) {
					Scene.setTilemapSize(tilemap, tilemap.width, value);
				}
				break;
		}
		Scene.requestRendering();
	};

	SceneTilemap.layerWrite = function (event) {
		const lightBox = SceneTilemap.lightBox;
		const type = event.value === 'object' ? 'sprite' : 'tile';
		const items = lightBox.lightItems[type];
		if (lightBox.dataItems !== items) {
			lightBox.loadItems(items);
		}
	};

	SceneTilemap.layerInput = function (event) {
		if (Inspector.manager.focusing === this) {
			const lightBox = SceneTilemap.lightBox;
			const value = lightBox.read();
			for (const item of lightBox.dataItems) {
				if (item.value === value) {
					return;
				}
			}
			lightBox.write('raw');
			this.changes = [
				{
					input: lightBox,
					oldValue: value,
					newValue: 'raw'
				}
			];
		}
	};

	SceneTilemap.paramInput = function (event) {
		SceneTilemap.update(SceneTilemap.target, Inspector.getKey(this), this.read());
	};

	Inspector.sceneTilemap = SceneTilemap;
}
