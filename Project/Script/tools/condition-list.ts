import { $, getElementReader, getElementWriter } from '../util/dom.ts';
import { Command } from '../command/command-object.ts';
import { IfCondition } from '../command/conditional-condition-window.ts';
import { TreeList } from '../components/tree-list.ts';
import { Inspector } from '../inspector/inspector.ts';
import { IListInterface } from '../types/list-interface.ts';
import { Local } from './localization.ts';
import { Window } from './window-object.ts';

// ******************************** 条件列表接口类 ********************************

export class ConditionListInterface implements IListInterface {
	target: HTMLElement | null;
	type: string;
	history: any | null;
	editor: any | null;
	owner: any | null;

	constructor(editor?: any, owner?: any) {
		this.editor = editor ?? null;
		this.owner = owner ?? null;
	}

	// 初始化
	initialize(list: HTMLElement): void {
		this.target = null;
		this.type = 'condition';

		// 创建参数历史操作
		const { editor, owner } = this;
		if (editor && owner) {
			this.history = new Inspector.ParamHistory(editor, owner, list);
		}
	}

	// 解析变量
	parseVariable(condition: any): any {
		switch (condition.type) {
			case 'global-boolean':
			case 'global-number':
			case 'global-string':
				return Command.parseGlobalVariable(condition.key);
			case 'self-boolean':
			case 'self-number':
			case 'self-string':
				return Local.get('variable.self');
		}
	}

	// 解析项目
	parse(condition: any) {
		const variable = this.parseVariable(condition);
		switch (condition.type) {
			case 'global-boolean':
			case 'self-boolean': {
				const operator = Command.removeTextTags(
					IfCondition.parseBooleanOperation(condition)
				);
				const value = condition.value.toString();
				return `${variable} ${operator} ${value}`;
			}
			case 'global-number':
			case 'self-number': {
				const operator = Command.removeTextTags(
					IfCondition.parseNumberOperation(condition)
				);
				const value = condition.value.toString();
				return `${variable} ${operator} ${value}`;
			}
			case 'global-string':
			case 'self-string': {
				const operator = Command.removeTextTags(
					IfCondition.parseStringOperation(condition)
				);
				const value = `"${Command.parseMultiLineString(condition.value)}"`;
				return `${variable} ${operator} ${value}`;
			}
		}
	}

	// 更新
	update(list: any) {
		// 更新宿主项目的条件图标
		const item = this.editor?.target;
		if (item?.conditions === list.read()) {
			const element = item.element;
			const list = element?.parentNode;
			if (list instanceof TreeList) {
				(list as any).updateConditionIcon(item);
			}
		}
	}

	// 打开窗口
	open(
		condition = {
			type: 'global-boolean',
			key: '',
			operation: 'equal',
			value: true
		}
	) {
		Window.open('condition');
		ConditionListInterface.target = this.target;
		const write = getElementWriter('condition');
		let booleanOperation = 'equal';
		let booleanValue = true;
		let numberOperation = 'equal';
		let numberValue = 0;
		let stringOperation = 'equal';
		let stringValue = '';
		switch (condition.type) {
			case 'global-boolean':
			case 'self-boolean':
				booleanOperation = condition.operation;
				booleanValue = condition.value;
				break;
			case 'global-number':
			case 'self-number':
				numberOperation = condition.operation;
				numberValue = condition.value as any;
				break;
			case 'global-string':
			case 'self-string':
				stringOperation = condition.operation;
				stringValue = condition.value as any;
				break;
		}
		write('type', condition.type);
		write('key', condition.key ?? '');
		write('boolean-operation', booleanOperation);
		write('boolean-value', booleanValue);
		write('number-operation', numberOperation);
		write('number-value', numberValue);
		write('string-operation', stringOperation);
		write('string-value', stringValue);
		$('#condition-type').getFocus();
	}

	// 保存数据
	save() {
		const read = getElementReader('condition');
		const type = read('type');
		const [varScope, varType] = type.split('-');
		let key;
		let operation;
		let value;
		let condition;
		// 读取变量键
		switch (varScope) {
			case 'global':
				key = read('key');
				if (key === '') {
					return $('#condition-key').getFocus();
				}
				break;
		}
		// 读取操作和变量值
		switch (varType) {
			case 'boolean':
				operation = read('boolean-operation');
				value = read('boolean-value');
				break;
			case 'number':
				operation = read('number-operation');
				value = read('number-value');
				break;
			case 'string':
				operation = read('string-operation');
				value = read('string-value');
				break;
		}
		// 生成条件
		switch (varScope) {
			case 'global':
				condition = { type, key, operation, value };
				break;
			case 'self':
				condition = { type, operation, value };
				break;
		}
		Window.close('condition');
		return condition;
	}

	// 静态 - 正在编辑中的数据所在的列表
	static target = null;

	// 静态 - 初始化
	static initialize() {
		// 创建条件类型选项
		$('#condition-type').loadItems([
			{ name: 'Global - Boolean', value: 'global-boolean' },
			{ name: 'Global - Number', value: 'global-number' },
			{ name: 'Global - String', value: 'global-string' },
			{ name: 'Self - Boolean', value: 'self-boolean' },
			{ name: 'Self - Number', value: 'self-number' },
			{ name: 'Self - String', value: 'self-string' }
		]);

		// 设置条件类型关联元素
		$('#condition-type')
			.enableHiddenMode()
			.relate([
				{
					case: 'global-boolean',
					targets: [
						$('#condition-key'),
						$('#condition-boolean-operation'),
						$('#condition-boolean-value')
					]
				},
				{
					case: 'global-number',
					targets: [
						$('#condition-key'),
						$('#condition-number-operation'),
						$('#condition-number-value')
					]
				},
				{
					case: 'global-string',
					targets: [
						$('#condition-key'),
						$('#condition-string-operation'),
						$('#condition-string-value')
					]
				},
				{
					case: 'self-boolean',
					targets: [$('#condition-boolean-operation'), $('#condition-boolean-value')]
				},
				{
					case: 'self-number',
					targets: [$('#condition-number-operation'), $('#condition-number-value')]
				},
				{
					case: 'self-string',
					targets: [$('#condition-string-operation'), $('#condition-string-value')]
				}
			]);

		// 创建布尔值操作选项
		$('#condition-boolean-operation').loadItems([
			{ name: '==', value: 'equal' },
			{ name: '!=', value: 'unequal' }
		]);

		// 创建布尔值常量选项
		$('#condition-boolean-value').loadItems([
			{ name: 'False', value: false },
			{ name: 'True', value: true }
		]);

		// 创建数值操作选项
		$('#condition-number-operation').loadItems([
			{ name: '==', value: 'equal' },
			{ name: '!=', value: 'unequal' },
			{ name: '>=', value: 'greater-or-equal' },
			{ name: '<=', value: 'less-or-equal' },
			{ name: '>', value: 'greater' },
			{ name: '<', value: 'less' }
		]);

		// 创建字符串操作选项
		$('#condition-string-operation').loadItems([
			{ name: '==', value: 'equal' },
			{ name: '!=', value: 'unequal' }
		]);

		// 条件类型写入事件
		$('#condition-type').on('write', (event) => {
			const type = event.value;
			switch (type) {
				case 'global-boolean':
				case 'global-number':
				case 'global-string':
					// 设置全局变量类型过滤器
					$('#condition-key').filter = type.slice(7);
					break;
			}
		});

		// 确定按钮 - 鼠标点击事件
		$('#condition-confirm').on('click', (event) => {
			ConditionListInterface.target.save();
		});
	}
}
