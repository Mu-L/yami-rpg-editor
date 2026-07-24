import { $, getElementReader } from '../util/dom.ts';
import { VariableGetter } from './variable-accessor-window.ts';
import { Window } from '../tools/window-object.ts';

// ******************************** 状态访问器窗口 ********************************

export const StateGetter = {
	// properties
	target: null,
	// methods
	initialize: null,
	open: null,
	checkDataForPlugin: null,
	createDefaultForPlugin: null,
	// events
	confirm: null
};

// 初始化
StateGetter.initialize = function () {
	// 创建访问器类型选项
	$('#stateGetter-type').loadItems([
		{ name: 'Event Trigger State', value: 'trigger' },
		{ name: 'Latest State', value: 'latest' },
		{ name: 'By State ID', value: 'by-id' },
		{ name: 'Variable', value: 'variable' }
	]);

	// 设置关联元素
	$('#stateGetter-type')
		.enableHiddenMode()
		.relate([
			{
				case: 'by-id',
				targets: [$('#stateGetter-actor'), $('#stateGetter-stateId')]
			},
			{ case: 'variable', targets: [$('#stateGetter-variable')] }
		]);

	// 侦听事件
	$('#stateGetter-confirm').on('click', this.confirm);
};

// 打开窗口
StateGetter.open = function (target) {
	this.target = target;
	Window.open('stateGetter');

	let actor = { type: 'trigger' };
	let stateId = '';
	let variable = { type: 'local', key: '' };
	const state = target.dataValue;
	switch (state.type) {
		case 'trigger':
		case 'latest':
			break;
		case 'by-id':
			actor = state.actor;
			stateId = state.stateId;
			break;
		case 'variable':
			variable = state.variable;
			break;
	}
	$('#stateGetter-type').write(state.type);
	$('#stateGetter-actor').write(actor);
	$('#stateGetter-stateId').write(stateId);
	$('#stateGetter-variable').write(variable);
	$('#stateGetter-type').getFocus();
};

// 检查插件版本的状态访问器数据有效性
StateGetter.checkDataForPlugin = function (data) {
	if (data instanceof Object) {
		return data.getter === 'state';
	}
	return false;
};

// 创建插件版本的默认状态访问器
StateGetter.createDefaultForPlugin = function () {
	return { getter: 'state', type: 'trigger' };
};

// 确定按钮 - 鼠标点击事件
StateGetter.confirm = function (event) {
	const read = getElementReader('stateGetter');
	const type = read('type');
	let getter;
	switch (type) {
		case 'trigger':
		case 'latest':
			getter = { type };
			break;
		case 'by-id': {
			const actor = read('actor');
			const stateId = read('stateId');
			if (stateId === '') {
				return $('#stateGetter-stateId').getFocus();
			}
			getter = { type, actor, stateId };
			break;
		}
		case 'variable': {
			const variable = read('variable');
			if (VariableGetter.isNone(variable)) {
				return $('#stateGetter-variable').getFocus();
			}
			getter = { type, variable };
			break;
		}
	}
	// 如果是插件输入框，额外附加一个属性
	if (this.target.isPluginInput) {
		getter = { getter: 'state', ...getter };
	}
	this.target.input(getter);
	Window.close('stateGetter');
}.bind(StateGetter);
