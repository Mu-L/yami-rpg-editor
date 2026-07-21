import { $, getElementReader } from '../util/dom.ts';
import { VariableGetter } from './variable-accessor-window.ts';
import { Scene } from '../scene/scene-window.ts';
import { PresetObject } from '../tools/scene-preset-window.ts';
import { Window } from '../tools/window-object.ts';
import { Variable } from '../variable/variable.ts';

// ******************************** 场景对象访问器窗口 ********************************

export const ObjectGetter = {
	// properties
	target: null,
	// methods
	initialize: null,
	open: null,
	// events
	confirm: null
};

// 初始化
ObjectGetter.initialize = function () {
	// 创建访问器类型选项
	$('#objectGetter-type').loadItems([
		{ name: 'Event Trigger Object', value: 'trigger' },
		{ name: 'Latest Scene Object', value: 'latest' },
		{ name: 'By Object ID', value: 'by-id' },
		{ name: 'Variable', value: 'variable' }
	]);

	// 设置关联元素
	$('#objectGetter-type')
		.enableHiddenMode()
		.relate([
			{ case: 'by-id', targets: [$('#objectGetter-presetId')] },
			{ case: 'variable', targets: [$('#objectGetter-variable')] }
		]);

	// 侦听事件
	$('#objectGetter-confirm').on('click', this.confirm);
};

// 打开窗口
ObjectGetter.open = function (target) {
	this.target = target;
	Window.open('objectGetter');

	let presetId = PresetObject.getDefaultPresetId('any');
	let variable = { type: 'local', key: '' };
	const object = target.dataValue;
	switch (object.type) {
		case 'trigger':
		case 'latest':
			break;
		case 'by-id':
			presetId = object.presetId;
			break;
		case 'variable':
			variable = object.variable;
			break;
	}
	$('#objectGetter-type').write(object.type);
	$('#objectGetter-presetId').write(presetId);
	$('#objectGetter-variable').write(variable);
	$('#objectGetter-type').getFocus();
};

// 确定按钮 - 鼠标点击事件
ObjectGetter.confirm = function (event) {
	const read = getElementReader('objectGetter');
	const type = read('type');
	let getter;
	switch (type) {
		case 'trigger':
		case 'latest':
			getter = { type };
			break;
		case 'by-id': {
			const presetId = read('presetId');
			if (presetId === '') {
				return $('#objectGetter-presetId').getFocus();
			}
			getter = { type, presetId };
			break;
		}
		case 'variable': {
			const variable = read('variable');
			if (VariableGetter.isNone(variable)) {
				return $('#objectGetter-variable').getFocus();
			}
			getter = { type, variable };
			break;
		}
	}
	this.target.input(getter);
	Window.close('objectGetter');
}.bind(ObjectGetter);
