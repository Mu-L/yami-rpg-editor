import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { Command } from '@/command/command-object.ts';
import { IfCondition } from '@/command/conditional-condition-window.ts';
import { TreeList } from '@/components/tree-list.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { IListInterface } from '@/types/list-interface.ts';
import { Local } from './localization.ts';
import { Window } from './window-object.ts';

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

	initialize(list: HTMLElement): void {
		this.target = null;
		this.type = 'condition';

		const { editor, owner } = this;
		if (editor && owner) {
			this.history = new Inspector.ParamHistory(editor, owner, list);
		}
	}

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

	update(list: any) {
		const item = this.editor?.target;
		if (item?.conditions === list.read()) {
			const element = item.element;
			const list = element?.parentNode;
			if (list instanceof TreeList) {
				(list as any).updateConditionIcon(item);
			}
		}
	}

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

	save() {
		const read = getElementReader('condition');
		const type = read('type');
		const [varScope, varType] = type.split('-');
		let key;
		let operation;
		let value;
		let condition;
		switch (varScope) {
			case 'global':
				key = read('key');
				if (key === '') {
					return $('#condition-key').getFocus();
				}
				break;
		}
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

	static target = null;

	static initialize() {
		$('#condition-type').loadItems([
			{ name: 'Global - Boolean', value: 'global-boolean' },
			{ name: 'Global - Number', value: 'global-number' },
			{ name: 'Global - String', value: 'global-string' },
			{ name: 'Self - Boolean', value: 'self-boolean' },
			{ name: 'Self - Number', value: 'self-number' },
			{ name: 'Self - String', value: 'self-string' }
		]);

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

		$('#condition-boolean-operation').loadItems([
			{ name: '==', value: 'equal' },
			{ name: '!=', value: 'unequal' }
		]);

		$('#condition-boolean-value').loadItems([
			{ name: 'False', value: false },
			{ name: 'True', value: true }
		]);

		$('#condition-number-operation').loadItems([
			{ name: '==', value: 'equal' },
			{ name: '!=', value: 'unequal' },
			{ name: '>=', value: 'greater-or-equal' },
			{ name: '<=', value: 'less-or-equal' },
			{ name: '>', value: 'greater' },
			{ name: '<', value: 'less' }
		]);

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
					$('#condition-key').filter = type.slice(7);
					break;
			}
		});

		// 确定按钮 - 鼠标点击事件
		$('#condition-confirm').on('click', () => {
			ConditionListInterface.target.save();
		});
	}
}
