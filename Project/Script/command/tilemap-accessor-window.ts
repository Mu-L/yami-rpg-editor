import { $, getElementReader } from '../util/dom.ts';
import { VariableGetter } from './variable-accessor-window.ts';
import { PresetObject } from '../tools/scene-preset-window.ts';
import { Window } from '../tools/window-object.ts';

// ******************************** 瓦片地图访问器窗口 ********************************

export const TilemapGetter = {
	// properties
	target: null,
	// methods
	initialize: null,
	open: null,
	// events
	confirm: null
};

// 初始化
TilemapGetter.initialize = function () {
	// 创建访问器类型选项
	$('#tilemapGetter-type').loadItems([
		{ name: 'Event Trigger Tilemap', value: 'trigger' },
		{ name: 'By Tilemap ID', value: 'by-id' },
		{ name: 'Variable', value: 'variable' }
	]);

	// 设置关联元素
	$('#tilemapGetter-type')
		.enableHiddenMode()
		.relate([
			{ case: 'by-id', targets: [$('#tilemapGetter-presetId')] },
			{ case: 'variable', targets: [$('#tilemapGetter-variable')] }
		]);

	// 侦听事件
	$('#tilemapGetter-confirm').on('click', this.confirm);
};

// 打开窗口
TilemapGetter.open = function (target) {
	this.target = target;
	Window.open('tilemapGetter');

	let presetId = PresetObject.getDefaultPresetId('tilemap');
	let variable = { type: 'local', key: '' };
	const tilemap = target.dataValue;
	switch (tilemap.type) {
		case 'trigger':
			break;
		case 'by-id':
			presetId = tilemap.presetId;
			break;
		case 'variable':
			variable = tilemap.variable;
			break;
	}
	$('#tilemapGetter-type').write(tilemap.type);
	$('#tilemapGetter-presetId').write(presetId);
	$('#tilemapGetter-variable').write(variable);
	$('#tilemapGetter-type').getFocus();
};

// 确定按钮 - 鼠标点击事件
TilemapGetter.confirm = function (event) {
	const read = getElementReader('tilemapGetter');
	const type = read('type');
	let getter;
	switch (type) {
		case 'trigger':
			getter = { type };
			break;
		case 'by-id': {
			const presetId = read('presetId');
			if (presetId === '') {
				return $('#tilemapGetter-presetId').getFocus();
			}
			getter = { type, presetId };
			break;
		}
		case 'variable': {
			const variable = read('variable');
			if (VariableGetter.isNone(variable)) {
				return $('#tilemapGetter-variable').getFocus();
			}
			getter = { type, variable };
			break;
		}
	}
	this.target.input(getter);
	Window.close('tilemapGetter');
}.bind(TilemapGetter);
