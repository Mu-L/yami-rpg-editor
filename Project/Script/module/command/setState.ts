import { $ } from '../../util/dom.ts';
import { Command } from '../../command/command-object.ts';
import { Token } from '../../command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.setState = new CommandSchema({
	name: 'setState',
	fields: [
		{ key: 'state', default: { type: 'trigger' } },
		{ key: 'operation', default: 'set-time' },
		{ key: 'time', default: 0 }
	],
	onInitialize() {
		$('#setState-confirm').on('click', () => this.save());
		$('#setState-operation').loadItems([
			{ name: 'Set Time', value: 'set-time' },
			{ name: 'Increase Time', value: 'increase-time' },
			{ name: 'Decrease Time', value: 'decrease-time' }
		]);
	},
	parseOperation(operation: any) {
		return Local.get('command.setState.' + operation);
	},
	customParse({ state, operation, time }) {
		const words = Command.words
			.push(Command.parseState(state))
			.push(this.parseOperation(operation))
			.push(Command.parseVariableNumber(time, 'ms'));
		return [
			{ color: 'object' },
			{ text: Local.get('command.setState') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		$('#setState-state').getFocus();
	}
});
