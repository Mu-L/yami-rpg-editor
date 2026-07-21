import { $, getElementReader, getElementWriter } from '../../util/dom.ts';
import { Attribute } from '../../attribute/attribute-window.ts';
import { Command } from '../../command/command-object.ts';
import { Token } from '../../command/mark-string-manager.ts';
import { VariableGetter } from '../../command/variable-accessor-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';
import { Variable } from '../../variable/variable.ts';

Command.cases.setList = new CommandSchema({
	name: 'setList',
	onInitialize() {
		$('#setList-confirm').on('click', () => this.save());
		$('#setList-operation').loadItems([
			{ name: 'Set to Empty', value: 'set-empty' },
			{ name: 'Set Numbers', value: 'set-numbers' },
			{ name: 'Set Strings', value: 'set-strings' },
			{ name: 'Set Boolean', value: 'set-boolean' },
			{ name: 'Set Number', value: 'set-number' },
			{ name: 'Set String', value: 'set-string' },
			{ name: 'Set Variable', value: 'set-variable' },
			{ name: 'Split String', value: 'split-string' },
			{ name: 'Push', value: 'push' },
			{ name: 'Remove', value: 'remove' },
			{ name: 'Get Attribute Names', value: 'get-attribute-names' },
			{ name: 'Get Attribute Keys', value: 'get-attribute-keys' },
			{ name: 'Get Enumeration Names', value: 'get-enum-names' },
			{ name: 'Get Enumeration Values', value: 'get-enum-values' },
			{ name: 'Get Actor Targets', value: 'get-actor-targets' }
		]);
		$('#setList-operation')
			.enableHiddenMode()
			.relate([
				{ case: 'set-numbers', targets: [$('#setList-numbers')] },
				{ case: 'set-strings', targets: [$('#setList-strings')] },
				{
					case: 'set-boolean',
					targets: [
						$('#setList-index'),
						$('#setList-index-skip-check'),
						$('#setList-boolean')
					]
				},
				{
					case: 'set-number',
					targets: [
						$('#setList-index'),
						$('#setList-index-skip-check'),
						$('#setList-number')
					]
				},
				{
					case: 'set-string',
					targets: [
						$('#setList-index'),
						$('#setList-index-skip-check'),
						$('#setList-string')
					]
				},
				{
					case: 'set-variable',
					targets: [
						$('#setList-index'),
						$('#setList-index-skip-check'),
						$('#setList-operand')
					]
				},
				{
					case: 'split-string',
					targets: [$('#setList-operand'), $('#setList-separator')]
				},
				{ case: ['push', 'remove'], targets: [$('#setList-operand')] },
				{
					case: ['get-attribute-names', 'get-attribute-keys'],
					targets: [$('#setList-attribute-groupId')]
				},
				{
					case: ['get-enum-names', 'get-enum-values'],
					targets: [$('#setList-enum-groupId')]
				},
				{ case: 'get-actor-targets', targets: [$('#setList-actor')] }
			]);
		$('#setList-boolean').loadItems([
			{ name: 'False', value: false },
			{ name: 'True', value: true }
		]);
	},
	customParse({
		variable,
		operation,
		list,
		index,
		constant,
		operand,
		separator,
		groupId,
		actor,
		skipCheck = true
	}) {
		let info;
		let isLeftValue = true;
		switch (operation) {
			case 'set-boolean':
			case 'set-number':
			case 'set-string':
			case 'set-variable':
			case 'push':
			case 'remove':
				isLeftValue = false;
				break;
		}
		const varName = Command.parseVariable(variable, 'object', isLeftValue);
		const equal = Command.setOperatorColor('=');
		switch (operation) {
			case 'set-empty':
				info = `${varName} ${equal} ${Token('[') + Token(']')}`;
				break;
			case 'set-numbers': {
				let values = '';
				if (list.length !== 0) {
					for (const number of list) {
						if (values !== '') {
							values += Token(', ');
						}
						values += Command.setNumberColor(number);
					}
				}
				info = `${varName} ${equal} ${Token('[') + values + Token(']')}`;
				break;
			}
			case 'set-strings': {
				let values = '';
				if (list.length !== 0) {
					for (const string of list) {
						if (values !== '') {
							values += Token(', ');
						}
						values += Command.setStringColor(`"${string}"`);
					}
					values = Command.parseMultiLineString(values);
				}
				info = `${varName} ${equal} ${Token('[') + values + Token(']')}`;
				break;
			}
			case 'set-boolean':
				info = `${varName}${
					Token('[') + Command.parseVariableNumber(index) + Token(']')
				} ${equal} ${Command.setBooleanColor(constant)}`;
				if (skipCheck) {
					info += `, ${Local.get('command.setList.skipCheck')}`;
				}
				break;
			case 'set-number':
				info = `${varName}${
					Token('[') + Command.parseVariableNumber(index) + Token(']')
				} ${equal} ${Command.setNumberColor(constant)}`;
				if (skipCheck) {
					info += `, ${Local.get('command.setList.skipCheck')}`;
				}
				break;
			case 'set-string': {
				const string = Command.setStringColor(
					'"' + Command.parseMultiLineString(constant) + '"'
				);
				info = `${varName}${
					Token('[') + Command.parseVariableNumber(index) + Token(']')
				} ${equal} ${string}`;
				if (skipCheck) {
					info += `, ${Local.get('command.setList.skipCheck')}`;
				}
				break;
			}
			case 'set-variable':
				info = `${varName}${
					Token('[') + Command.parseVariableNumber(index) + Token(']')
				} ${equal} ${Command.parseVariable(operand, 'any')}`;
				if (skipCheck) {
					info += `, ${Local.get('command.setList.skipCheck')}`;
				}
				break;
			case 'split-string': {
				const label = Local.get('command.setList.split-string');
				const text1 = Command.parseVariable(operand, 'string');
				const text2 = Command.parseVariableString(separator);
				const comma = Command.setDelimiterColor(', ');
				info = `${varName} ${equal} ${label}${Token(
					'('
				)}${text1}${comma}${text2}${Token(')')}`;
				break;
			}
			case 'push':
				info = `${varName} ${Command.setOperatorColor(
					'+='
				)} ${Command.parseVariable(operand, 'any')}`;
				break;
			case 'remove':
				info = `${varName} ${Command.setOperatorColor(
					'-='
				)} ${Command.parseVariable(operand, 'any')}`;
				break;
			case 'get-attribute-names':
			case 'get-attribute-keys': {
				const label = Local.get('command.setList.' + operation);
				const group = Command.parseAttributeGroup(groupId);
				info = `${varName} ${equal} ${label}${Token('(')}${group}${Token(')')}`;
				break;
			}
			case 'get-enum-names':
			case 'get-enum-values': {
				const label = Local.get('command.setList.' + operation);
				const group = Command.parseEnumGroup(groupId);
				info = `${varName} ${equal} ${label}${Token('(')}${group}${Token(')')}`;
				break;
			}
			case 'get-actor-targets': {
				const label = Local.get('command.setList.' + operation);
				const actorInfo = Command.parseActor(actor);
				info = `${varName} ${equal} ${label}${Token('(')}${actorInfo}${Token(
					')'
				)}`;
				break;
			}
		}
		return [
			{ color: 'variable' },
			{ text: Local.get('command.setList.alias') + ' ' },
			{ color: 'restore' },
			{ text: info }
		];
	},
	customLoad({
		variable = { type: 'local', key: '' },
		operation = 'set-empty',
		list = [],
		index = 0,
		constant = 0,
		operand = { type: 'local', key: '' },
		separator = '',
		groupId = '',
		actor = { type: 'trigger' },
		skipCheck = true
	}) {
		let numbers = [];
		let strings = [];
		let boolean = false;
		let number = 0;
		let string = '';
		let attrGroupId = '';
		let enumGroupId = '';
		switch (operation) {
			case 'set-numbers':
				numbers = list;
				break;
			case 'set-strings':
				strings = list;
				break;
			case 'set-boolean':
				boolean = constant;
				break;
			case 'set-number':
				number = constant;
				break;
			case 'set-string':
				string = constant;
				break;
			case 'get-attribute-names':
			case 'get-attribute-keys':
				attrGroupId = groupId;
				break;
			case 'get-enum-names':
			case 'get-enum-values':
				enumGroupId = groupId;
				break;
		}
		const write = getElementWriter('setList');
		write('variable', variable);
		write('operation', operation);
		write('numbers', numbers);
		write('strings', strings);
		write('index', index);
		write('boolean', boolean);
		write('number', number);
		write('string', string);
		write('operand', operand);
		write('separator', separator);
		write('attribute-groupId', attrGroupId);
		write('enum-groupId', enumGroupId);
		write('actor', actor);
		write('index-skip-check', skipCheck);
		$('#setList-variable').getFocus();
	},
	customSave() {
		const read = getElementReader('setList');
		const variable = read('variable');
		if (VariableGetter.isNone(variable)) {
			return $('#setList-variable').getFocus();
		}
		const operation = read('operation');
		switch (operation) {
			case 'set-empty':
				Command.save({ variable, operation });
				break;
			case 'set-numbers': {
				const list = read('numbers');
				if (list.length === 0) {
					return $('#setList-numbers').getFocus();
				}
				Command.save({ variable, operation, list });
				break;
			}
			case 'set-strings': {
				const list = read('strings');
				if (list.length === 0) {
					return $('#setList-strings').getFocus();
				}
				Command.save({ variable, operation, list });
				break;
			}
			case 'set-boolean': {
				const index = read('index');
				const skipCheck = read('index-skip-check');
				const constant = read('boolean');
				Command.save({
					variable,
					operation,
					index,
					constant,
					skipCheck
				});
				break;
			}
			case 'set-number': {
				const index = read('index');
				const skipCheck = read('index-skip-check');
				const constant = read('number');
				Command.save({
					variable,
					operation,
					index,
					constant,
					skipCheck
				});
				break;
			}
			case 'set-string': {
				const index = read('index');
				const skipCheck = read('index-skip-check');
				const constant = read('string');
				Command.save({
					variable,
					operation,
					index,
					constant,
					skipCheck
				});
				break;
			}
			case 'set-variable': {
				const index = read('index');
				const skipCheck = read('index-skip-check');
				const operand = read('operand');
				if (VariableGetter.isNone(operand)) {
					return $('#setList-operand').getFocus();
				}
				Command.save({
					variable,
					operation,
					index,
					operand,
					skipCheck
				});
				break;
			}
			case 'split-string': {
				const operand = read('operand');
				if (VariableGetter.isNone(operand)) {
					return $('#setList-operand').getFocus();
				}
				const separator = read('separator');
				Command.save({ variable, operation, operand, separator });
				break;
			}
			case 'push':
			case 'remove': {
				const operand = read('operand');
				if (VariableGetter.isNone(operand)) {
					return $('#setList-operand').getFocus();
				}
				Command.save({ variable, operation, operand });
				break;
			}
			case 'get-attribute-names':
			case 'get-attribute-keys': {
				const groupId = read('attribute-groupId');
				if (groupId === '') {
					return $('#setList-attribute-groupId').getFocus();
				}
				Command.save({ variable, operation, groupId });
				break;
			}
			case 'get-enum-names':
			case 'get-enum-values': {
				const groupId = read('enum-groupId');
				if (groupId === '') {
					return $('#setList-enum-groupId').getFocus();
				}
				Command.save({ variable, operation, groupId });
				break;
			}
			case 'get-actor-targets': {
				const actor = read('actor');
				Command.save({ variable, operation, actor });
				break;
			}
		}
	}
});
