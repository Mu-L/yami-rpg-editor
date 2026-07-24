import { $, getElementReader, getElementWriter } from '../util/dom.ts';
import { getVariable } from '../util/safe.ts';
import { Attribute } from '../attribute/attribute-window.ts';
import { EventEditor } from './event-editor.ts';
import { TextSuggestion } from './text-tip.ts';
import { SelectBox } from '../components/select-box.ts';
import { Window } from '../tools/window-object.ts';

// ******************************** 变量访问器窗口 ********************************

// 变量访问器目标对象（由调用方传入，含 input/filter/dataValue 等）
interface VariableGetterTarget {
	filter: string;
	dataValue: {
		type: string;
		key: string;
		actor?: any;
		skill?: any;
		state?: any;
		equipment?: any;
		item?: any;
		element?: any;
	};
	input: (getter: any) => void;
	isPluginInput?: boolean;
}

// 变量类型集合（all/object/object2/writable/deletable）
type VarTypeItem = { name: string; value: string };
type VarTypeSet = {
	all: VarTypeItem[];
	object: VarTypeItem[];
	object2: VarTypeItem[];
	writable: VarTypeItem[];
	deletable: VarTypeItem[];
};

// 递归状态条目（按窗口名隔离）
interface VarGetterState {
	target: VariableGetterTarget;
	filter: string;
}

interface VariableGetterShape {
	keyBox: HTMLElement & {
		loadItems(items: any[]): void;
		selectBox: HTMLElement & {
			textContent: string;
			write(v: any): void;
			read(): any;
			invalid: boolean;
			dataItems: any[];
		};
	};
	target: VariableGetterTarget | null;
	filter: string | null;
	types: VarTypeSet | null;
	_state: Record<string, VarGetterState | null>;
	initialize: (() => void) | null;
	open: ((target: VariableGetterTarget) => void) | null;
	_openCore: ((target: VariableGetterTarget, filter: string, prefix: string) => void) | null;
	isNone: ((variable: { key: string }) => boolean) | null;
	loadPresetKeys: ((group: string) => void) | null;
	checkDataForPlugin: ((data: any) => boolean) | null;
	createDefaultForPlugin: (() => { getter: string; type: string; key: string }) | null;
	createVarListGenerator: ((filterObject: VariableGetterShape) => () => any[]) | null;
	typeWrite: ((event: Event & { value: string }) => void) | null;
	typeInput: ((event: Event & { value: string }) => void) | null;
	confirm: ((event: Event) => void) | null;
	confirm2: ((event: Event) => void) | null;
	_confirmCore: ((prefix: string) => void) | null;
}

export const VariableGetter: VariableGetterShape = {
	// properties
	keyBox: $('#variableGetter-preset-key'),
	target: null,
	filter: null,
	types: null,
	_state: null,
	// methods
	initialize: null,
	open: null,
	_openCore: null,
	isNone: null,
	loadPresetKeys: null,
	checkDataForPlugin: null,
	createDefaultForPlugin: null,
	createVarListGenerator: null,
	// events
	typeWrite: null,
	typeInput: null,
	confirm: null,
	confirm2: null,
	_confirmCore: null
};

// 初始化
VariableGetter.initialize = function (this: VariableGetterShape): void {
	// 设置变量类型集合
	const types = {
		local: { name: 'Local', value: 'local' },
		global: { name: 'Global', value: 'global' },
		self: { name: 'Self Variable', value: 'self' },
		actor: { name: 'Actor Attribute', value: 'actor' },
		skill: { name: 'Skill Attribute', value: 'skill' },
		state: { name: 'State Attribute', value: 'state' },
		equipment: { name: 'Equipment Attribute', value: 'equipment' },
		item: { name: 'Item Attribute', value: 'item' },
		element: { name: 'Element Attribute', value: 'element' }
	};
	const allTypes = Object.values(types);
	const writableTypes = allTypes.filter((item) => item.value !== 'item');
	const deletableTypes = writableTypes.filter(
		(item) => item.value !== 'global' && item.value !== 'self'
	);
	const objectTypes = [types.local, types.global, types.element];
	const objectTypes2 = [types.local, types.global];
	this.types = {
		all: allTypes,
		object: objectTypes,
		object2: objectTypes2,
		writable: writableTypes,
		deletable: deletableTypes
	};

	// 设置变量类型关联元素
	const actor = $('#variableGetter-actor');
	const skill = $('#variableGetter-skill');
	const state = $('#variableGetter-state');
	const equipment = $('#variableGetter-equipment');
	const item = $('#variableGetter-item');
	const element = $('#variableGetter-element');
	const commonKey = $('#variableGetter-common-key');
	const presetKey = $('#variableGetter-preset-key');
	const globalKey = $('#variableGetter-global-key');
	$('#variableGetter-type')
		.enableHiddenMode()
		.relate([
			{ case: 'local', targets: [commonKey] },
			{ case: 'global', targets: [globalKey] },
			{ case: 'actor', targets: [actor, presetKey] },
			{ case: 'skill', targets: [skill, presetKey] },
			{ case: 'state', targets: [state, presetKey] },
			{ case: 'equipment', targets: [equipment, presetKey] },
			{ case: 'item', targets: [item, presetKey] },
			{ case: 'element', targets: [element, presetKey] }
		]);

	// 变量类型 - 重写设置选项名字方法
	$('#variableGetter-type').setItemNames = function (options) {
		const backup = this.dataItems;
		this.dataItems = allTypes;
		SelectBox.prototype.setItemNames.call(this, options);
		this.dataItems = backup;
	};

	// 变量访问器窗口2（递归叠加打开，复用同一套逻辑，仅支持 local/global/element）
	$('#variableGetter2-type')
		.enableHiddenMode()
		.relate([
			{ case: 'local', targets: [$('#variableGetter2-common-key')] },
			{ case: 'global', targets: [$('#variableGetter2-global-key')] },
			{
				case: 'element',
				targets: [$('#variableGetter2-element'), $('#variableGetter2-preset-key')]
			}
		]);
	$('#variableGetter2-confirm').on('click', this.confirm2);
	TextSuggestion.listen(
		$('#variableGetter2-common-key'),
		VariableGetter.createVarListGenerator(this)
	);

	// 递归状态（按窗口名隔离，避免覆盖主窗口的 target/filter）
	this._state = { variableGetter: null, variableGetter2: null };

	// 侦听事件
	$('#variableGetter-type').on('write', this.typeWrite);
	$('#variableGetter-type').on('input', this.typeInput);
	$('#variableGetter-confirm').on('click', this.confirm);
	TextSuggestion.listen(
		$('#variableGetter-common-key'),
		VariableGetter.createVarListGenerator(this)
	);
};

// 打开窗口
VariableGetter.open = function (this: VariableGetterShape, target: VariableGetterTarget): void {
	const filter = target.filter;
	// 若主窗口已打开，则叠加打开窗口2（避免递归冲突）
	if (Window.isWindowOpen('variableGetter')) {
		this._openCore!(target, filter, 'variableGetter2');
	} else {
		this._openCore!(target, filter, 'variableGetter');
	}
};

// 内部：按窗口前缀打开并填充
VariableGetter._openCore = function (
	this: VariableGetterShape,
	target: VariableGetterTarget,
	filter: string,
	prefix: string
): void {
	// 递归状态按窗口名隔离（窗口2不污染主窗口的 target/filter）
	this._state[prefix] = { target, filter };
	const types = this.types;
	let items;
	switch (filter) {
		case 'all':
		case 'boolean':
		case 'number':
		case 'string':
			// 递归窗口仅支持 local/global/element
			items = prefix === 'variableGetter2' ? types.object : types.all;
			break;
		case 'object':
			// 打开元素访问器时则过滤掉元素属性选项
			items = !Window.isWindowOpen('elementGetter') ? types.object : types.object2;
			break;
		case 'writable-boolean':
		case 'writable-number':
		case 'writable-string':
			items = types.writable;
			break;
		case 'deletable':
			items = types.deletable;
			break;
	}
	$(`#${prefix}-type`).loadItems(items);
	$(`#${prefix}-global-key`).filter = filter.startsWith('writable-') ? filter.slice(9) : filter;

	// 填充当前变量值
	const variable = target.dataValue;
	const type = variable.type;
	const key = variable.key;
	const write = getElementWriter(prefix);
	if (prefix === 'variableGetter2') {
		// 窗口2仅支持 local/global/element
		let element = { type: 'trigger' };
		let commonKey = '';
		let globalKey = '';
		let presetKey = Attribute.getDefAttributeId('element', filter);
		switch (type) {
			case 'local':
				commonKey = key;
				break;
			case 'global':
				globalKey = key;
				break;
			case 'element':
				element = variable.element;
				presetKey = key;
				break;
		}
		$(`#${prefix}-preset-key`).loadItems(Attribute.getAttributeItems('element', filter));
		write('type', type);
		write('element', element);
		write('common-key', commonKey);
		write('global-key', globalKey);
		write('preset-key', presetKey);
	} else {
		let commonKey = '';
		let presetKey = '';
		let globalKey = '';
		let actor = { type: 'trigger' };
		let skill = { type: 'trigger' };
		let state = { type: 'trigger' };
		let equipment = { type: 'trigger' };
		let item = { type: 'trigger' };
		let element = { type: 'trigger' };
		switch (type) {
			case 'local':
				commonKey = key;
				break;
			case 'global':
				globalKey = key;
				break;
			case 'actor':
				this.loadPresetKeys(type);
				actor = variable.actor;
				presetKey = key;
				break;
			case 'skill':
				this.loadPresetKeys(type);
				skill = variable.skill;
				presetKey = key;
				break;
			case 'state':
				this.loadPresetKeys(type);
				state = variable.state;
				presetKey = key;
				break;
			case 'equipment':
				this.loadPresetKeys(type);
				equipment = variable.equipment;
				presetKey = key;
				break;
			case 'item':
				this.loadPresetKeys(type);
				item = variable.item;
				presetKey = key;
				break;
			case 'element':
				this.loadPresetKeys(type);
				element = variable.element;
				presetKey = key;
				break;
		}
		this.keyBox.loadItems(Attribute.getAttributeItems('none'));
		write('type', type);
		write('actor', actor);
		write('skill', skill);
		write('state', state);
		write('equipment', equipment);
		write('item', item);
		write('element', element);
		write('common-key', commonKey);
		write('preset-key', presetKey);
		write('global-key', globalKey);
		// 主窗口分支保持与原 open 一致，供 typeWrite/typeInput 使用
		this.target = target;
		this.filter = filter;
	}
	$(`#${prefix}-type`).getFocus();
	Window.open(prefix);
};

// 判断变量是否为空
VariableGetter.isNone = function (variable: { key: string }): boolean {
	return variable.key === '';
};

// 加载预设属性键
VariableGetter.loadPresetKeys = function (this: VariableGetterShape, group: string): void {
	let type = undefined;
	switch (this.filter) {
		case 'boolean':
		case 'number':
		case 'string':
		case 'object':
			type = this.filter;
			break;
		case 'writable-boolean':
		case 'writable-number':
		case 'writable-string':
			type = this.filter.split('-')[1];
			break;
	}
	this.keyBox.loadItems(Attribute.getAttributeItems(group, type));
};

// 检查插件版本的变量访问器数据有效性
VariableGetter.checkDataForPlugin = function (data: any): boolean {
	if (data instanceof Object) {
		return (data as { getter?: string }).getter === 'variable';
	}
	return false;
};

// 创建插件版本的默认变量访问器
VariableGetter.createDefaultForPlugin = function (): {
	getter: string;
	type: string;
	key: string;
} {
	return { getter: 'variable', type: 'local', key: '' };
};

// 创建本地变量列表生成器
VariableGetter.createVarListGenerator = function (filterObject: VariableGetterShape): () => any[] {
	return function (): any[] {
		if (!EventEditor.commandList.read()) return [];

		// 生成过滤字符串
		const filter = filterObject.filter.includes('boolean')
			? 'boolean'
			: filterObject.filter.includes('number')
				? 'number'
				: filterObject.filter.includes('string')
					? 'string'
					: filterObject.filter.includes('object')
						? 'object'
						: 'any';

		const list = EventEditor.commandList as unknown as {
			elements: any[] & { count?: number };
			active: number | null | undefined;
			varList?: any[];
		};
		const elements = list.elements;
		const count = elements.count ?? 0;
		const parentMap = new Map();
		const stack = [];
		for (let i = 0; i < count; i++) {
			const element = elements[i];
			if (element.dataKey === true && element.dataItem) {
				const indent = element.dataIndent ?? 0;
				while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
					stack.pop();
				}
				const parent = stack.length > 0 ? stack[stack.length - 1].command : null;
				if (!parentMap.has(element.dataItem)) {
					parentMap.set(element.dataItem, parent);
				}
				stack.push({ command: element.dataItem, indent });
			}
		}
		const getNamespaceRoot = (command: any): any => {
			let current = command;
			while (current) {
				if (
					current.id === 'registerEvent' &&
					current.params?.namespace &&
					current.params?.operation === 'register'
				) {
					return current;
				}
				current = parentMap.get(current);
			}
			return null;
		};
		const activeIndex = list.active;
		const activeElement =
			activeIndex !== null && activeIndex !== undefined ? elements[activeIndex] : null;
		const activeCommand = activeElement?.dataItem ?? activeElement?.dataParent ?? null;
		const activeNamespace = activeCommand ? getNamespaceRoot(activeCommand) : null;

		return (list.varList ?? []).filter((item) => {
			// 过滤类型不匹配的变量
			if (filter !== 'any' && item.type !== 'any' && filter !== item.type) {
				return false;
			}
			// 过滤作用域不匹配的变量
			const itemCommand = item.command;
			const itemNamespace = itemCommand ? getNamespaceRoot(itemCommand) : null;
			return itemNamespace === activeNamespace;
		});
	};
};

// 类型写入事件
VariableGetter.typeWrite = function (event: Event & { value: string }): void {
	const type = event.value;
	switch (type) {
		case 'actor':
		case 'skill':
		case 'state':
		case 'item':
		case 'equipment':
		case 'element':
			VariableGetter.loadPresetKeys(type);
			break;
	}
};

// 类型输入事件
VariableGetter.typeInput = function (event: Event & { value: string }): void {
	const type = event.value;
	switch (type) {
		case 'actor':
		case 'skill':
		case 'state':
		case 'item':
		case 'equipment':
		case 'element': {
			// 重新写入属性键
			const { selectBox } = VariableGetter.keyBox;
			const attrName = selectBox.textContent;
			selectBox.write(selectBox.read());
			if (selectBox.invalid) {
				// 如果是无效数据，则写入同名属性或第一项作为默认值
				const items = selectBox.dataItems;
				let defValue = items[0]?.value;
				for (const item of items) {
					if (item.name === attrName) {
						defValue = item.value;
						break;
					}
				}
				if (defValue !== undefined) {
					selectBox.write(defValue);
				}
			}
			break;
		}
	}
};

// 确定按钮 - 鼠标点击事件（主窗口）
VariableGetter.confirm = function (this: VariableGetterShape, event: Event): void {
	this._confirmCore!('variableGetter');
}.bind(VariableGetter);

// 确定按钮 - 鼠标点击事件（递归窗口2）
VariableGetter.confirm2 = function (this: VariableGetterShape, event: Event): void {
	this._confirmCore!('variableGetter2');
}.bind(VariableGetter);

// 内部：按窗口前缀执行确认（统一校验逻辑，消除双实现行为漂移）
VariableGetter._confirmCore = function (this: VariableGetterShape, prefix: string): void {
	const state = this._state[prefix];
	const target = state.target;
	const filter = state.filter;
	const read = getElementReader(prefix);
	const type = read('type');
	let getter;
	let key;
	switch (type) {
		case 'local':
			key = read('common-key').trim();
			if (key === '') {
				return $(`#${prefix}-common-key`).getFocus();
			}
			getter = { type, key };
			break;
		case 'global': {
			key = read('global-key');
			const variable = getVariable(key);
			// 仅对基础类型做类型校验（all/object/writable 不校验，避免错误拒绝）
			const baseType =
				filter === 'boolean' || filter === 'number' || filter === 'string' ? filter : null;
			if (key === '' || (baseType && typeof variable?.value !== baseType)) {
				return $(`#${prefix}-global-key`).getFocus();
			}
			getter = { type, key };
			break;
		}
		case 'element': {
			const element = read('element');
			key = read('preset-key');
			if (key === '') {
				return $(`#${prefix}-preset-key`).getFocus();
			}
			getter = { type, element, key };
			break;
		}
		case 'self':
			getter = { type };
			break;
		case 'actor': {
			const actor = read('actor');
			key = read('preset-key');
			if (key === '') return $(`#${prefix}-preset-key`).getFocus();
			getter = { type, actor, key };
			break;
		}
		case 'skill': {
			const skill = read('skill');
			key = read('preset-key');
			if (key === '') return $(`#${prefix}-preset-key`).getFocus();
			getter = { type, skill, key };
			break;
		}
		case 'state': {
			const stateVal = read('state');
			key = read('preset-key');
			if (key === '') return $(`#${prefix}-preset-key`).getFocus();
			getter = { type, state: stateVal, key };
			break;
		}
		case 'equipment': {
			const equipment = read('equipment');
			key = read('preset-key');
			if (key === '') return $(`#${prefix}-preset-key`).getFocus();
			getter = { type, equipment, key };
			break;
		}
		case 'item': {
			const item = read('item');
			key = read('preset-key');
			if (key === '') return $(`#${prefix}-preset-key`).getFocus();
			getter = { type, item, key };
			break;
		}
	}
	// 如果是插件输入框，额外附加一个属性
	if (target.isPluginInput) {
		getter = { getter: 'variable', ...getter };
	}
	target.input(getter);
	Window.close(prefix);
};
