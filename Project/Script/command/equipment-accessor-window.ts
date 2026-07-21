import { $, getElementReader } from '../util/dom.ts';
import { VariableGetter } from './variable-accessor-window.ts';
import { Enum } from '../enum/enum-window.ts';
import { Window } from '../tools/window-object.ts';
import { Variable } from '../variable/variable.ts';

// ******************************** 装备访问器窗口 ********************************

export const EquipmentGetter = {
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
EquipmentGetter.initialize = function () {
	// 创建访问器类型选项
	$('#equipmentGetter-type').loadItems([
		{ name: 'Event Trigger Equipment', value: 'trigger' },
		{ name: 'Latest Equipment', value: 'latest' },
		{ name: 'By Equipment Slot', value: 'by-slot' },
		{ name: 'By Equipment ID (Equipped)', value: 'by-id-equipped' },
		{ name: 'By Equipment ID (Inventory)', value: 'by-id-inventory' },
		{ name: 'Variable', value: 'variable' }
	]);

	// 设置类型关联元素
	$('#equipmentGetter-type')
		.enableHiddenMode()
		.relate([
			{
				case: 'by-slot',
				targets: [
					$('#equipmentGetter-actor'),
					$('#equipmentGetter-slot')
				]
			},
			{
				case: ['by-id-equipped', 'by-id-inventory'],
				targets: [
					$('#equipmentGetter-actor'),
					$('#equipmentGetter-equipmentId')
				]
			},
			{ case: 'variable', targets: [$('#equipmentGetter-variable')] }
		]);

	// 侦听事件
	$('#equipmentGetter-confirm').on('click', this.confirm);
};

// 打开窗口
EquipmentGetter.open = function (target) {
	this.target = target;
	Window.open('equipmentGetter');
	// 加载快捷键选项
	$('#equipmentGetter-slot').loadItems(Enum.getStringItems('equipment-slot'));

	let actor = { type: 'trigger' };
	let slot = Enum.getDefStringId('equipment-slot');
	let equipmentId = '';
	let variable = { type: 'local', key: '' };
	const equipment = target.dataValue;
	switch (equipment.type) {
		case 'trigger':
		case 'latest':
			break;
		case 'by-slot':
			actor = equipment.actor;
			slot = equipment.slot;
			break;
		case 'by-id-equipped':
		case 'by-id-inventory':
			actor = equipment.actor;
			equipmentId = equipment.equipmentId;
			break;
		case 'variable':
			variable = equipment.variable;
			break;
	}
	$('#equipmentGetter-type').write(equipment.type);
	$('#equipmentGetter-actor').write(actor);
	$('#equipmentGetter-slot').write(slot);
	$('#equipmentGetter-equipmentId').write(equipmentId);
	$('#equipmentGetter-variable').write(variable);
	$('#equipmentGetter-type').getFocus();
};

// 检查插件版本的装备访问器数据有效性
EquipmentGetter.checkDataForPlugin = function (data) {
	if (data instanceof Object) {
		return data.getter === 'equipment';
	}
	return false;
};

// 创建插件版本的默认装备访问器
EquipmentGetter.createDefaultForPlugin = function () {
	return { getter: 'equipment', type: 'trigger' };
};

// 确定按钮 - 鼠标点击事件
EquipmentGetter.confirm = function (event) {
	const read = getElementReader('equipmentGetter');
	const type = read('type');
	let getter;
	switch (type) {
		case 'trigger':
		case 'latest':
			getter = { type };
			break;
		case 'by-slot': {
			const actor = read('actor');
			const slot = read('slot');
			if (slot === '') {
				return $('#equipmentGetter-slot').getFocus();
			}
			getter = { type, actor, slot };
			break;
		}
		case 'by-id-equipped':
		case 'by-id-inventory': {
			const actor = read('actor');
			const equipmentId = read('equipmentId');
			if (equipmentId === '') {
				return $('#equipmentGetter-equipmentId').getFocus();
			}
			getter = { type, actor, equipmentId };
			break;
		}
		case 'variable': {
			const variable = read('variable');
			if (VariableGetter.isNone(variable)) {
				return $('#equipmentGetter-variable').getFocus();
			}
			getter = { type, variable };
			break;
		}
	}
	// 如果是插件输入框，额外附加一个属性
	if (this.target.isPluginInput) {
		getter = { getter: 'equipment', ...getter };
	}
	this.target.input(getter);
	Window.close('equipmentGetter');
}.bind(EquipmentGetter);
