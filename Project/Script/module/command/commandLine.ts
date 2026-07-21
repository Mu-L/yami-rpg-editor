import { $, getElementReader, getElementWriter } from '../../util/dom.ts';
import { Command } from '../../command/command-object.ts';
import { VariableGetter } from '../../command/variable-accessor-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.commandLine = new CommandSchema({
	name: 'commandLine',
	onInitialize() {
		$('#commandLine-type').loadItems([
			{ name: 'get', value: 'get' },
			{ name: 'rm', value: 'rm' },
			{ name: 'set', value: 'set' },
			{ name: 'has', value: 'has' }
		]);
		$('#commandLine-type')
			.enableHiddenMode()
			.relate([
				{
					case: 'get',
					targets: [$('#commandLine-key'), $('#commandLine-variable')]
				},
				{
					case: 'rm',
					targets: [$('#commandLine-key'), $('#commandLine-value')]
				},
				{
					case: 'set',
					targets: [$('#commandLine-key'), $('#commandLine-value')]
				},
				{
					case: 'has',
					targets: [$('#commandLine-key'), $('#commandLine-variable')]
				}
			]);
		$('#commandLine-type').write('get');
		$('#commandLine-confirm').on('click', () => this.save());
	},
	customParse({
		type = 'get',
		key = '',
		value = '',
		variable = { type: 'local', key: '' }
	}) {
		const head = [
			{ color: 'system' },
			{ text: Local.get('command.commandLine') },
			{ color: 'normal' },
			{ text: ' ' }
		];
		switch (type) {
			case 'set':
				const raw_value =
					typeof value == 'string'
						? value
						: Command.parseVariable(value, 'string');
				return head.concat(
					{ color: 'flow' },
					{ text: Local.get('command.commandLine.set') },
					{ text: ' ' },
					{ color: 'text' },
					{ color: 'save' },
					{
						text:
							typeof key == 'string'
								? key
								: Command.parseVariable(key, 'string')
					},
					{ text: ' ' },
					...(raw_value.length
						? [
								{
									text: '='
								},
								{ text: ' ' },
								{ color: 'gray' },
								{ color: 'save' },
								{
									text: raw_value
								}
							]
						: [])
				);
				break;
			case 'has':
			case 'rm':
			case 'get':
				head.push(
					{ color: 'flow' },
					{
						text:
							type === 'get'
								? Local.get('command.commandLine.get')
								: type === 'rm'
									? Local.get('command.commandLine.rm')
									: Local.get('command.commandLine.has')
					},
					{ text: ' ' },
					{ color: 'text' },
					{ color: 'save' },
					{
						text:
							typeof key == 'string'
								? key
								: Command.parseVariable(key, 'string')
					},
					{ text: ' ' },
					{ color: 'gray' },
					{ color: 'save' },
					{
						text: Local.get('command.commandLine.variable')
					},
					{ text: ' ' },
					{
						text: Command.parseVariable(variable, 'string')
					}
				);
				break;
		}

		return head;
	},
	customLoad({
		type = 'get',
		key = '',
		value = '',
		variable = { type: 'local', key: '' }
	}) {
		const write = getElementWriter('commandLine');
		write('type', type);
		write('key', key);
		write('value', value);
		write('variable', variable);
	},
	customSave() {
		const read = getElementReader('commandLine');
		const key = read('key');
		if (
			(typeof key == 'string' && key.trim() === '') ||
			(typeof key === 'object' && VariableGetter.isNone(key))
		) {
			return $('#commandLine-key').getFocus();
		}
		const variable = read('variable');
		if (VariableGetter.isNone(variable)) {
			return $('#commandLine-variable').getFocus();
		}
		Command.save({
			type: read('type'),
			key,
			value: read('value') ?? '',
			variable
		});
	}
});
