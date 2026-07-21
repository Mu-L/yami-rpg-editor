import { $ } from '../../util/dom.ts';
import { Command } from '../../command/command-object.ts';
import { Token } from '../../command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.setWeight = new CommandSchema({
	name: 'setWeight',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'weight', default: 0 }
	],
	customParse({ actor, weight }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseVariableNumber(weight));
		return [
			{ color: 'actor' },
			{ text: Local.get('command.setWeight') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		$('#setWeight-actor').getFocus();
	}
});
