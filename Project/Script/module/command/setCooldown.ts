import { $ } from '@/util/dom.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { Enum } from '@/enum/enum-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setCooldown = new CommandSchema({
	name: 'setCooldown',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'operation', default: 'set' },
		{
			key: 'key',
			default: () => Enum.getDefStringId('cooldown-key'),
			required: true
		},
		{ key: 'cooldown', default: 0 }
	],
	onInitialize() {
		$('#setCooldown-confirm').on('click', () => this.save());
		$('#setCooldown-operation').loadItems([
			{ name: 'Set', value: 'set' },
			{ name: 'Increase', value: 'increase' },
			{ name: 'Decrease', value: 'decrease' }
		]);
	},
	customParse({ actor, operation, key, cooldown }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Local.get('command.setCooldown.' + operation))
			.push(Command.parseVariableEnum('cooldown-key', key))
			.push(Command.parseVariableNumber(cooldown, 'ms'));
		return [
			{ color: 'inventory' },
			{ text: Local.get('command.setCooldown') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		$('#setCooldown-key').loadItems(Enum.getStringItems('cooldown-key'));
		$('#setCooldown-actor').getFocus();
	}
});
