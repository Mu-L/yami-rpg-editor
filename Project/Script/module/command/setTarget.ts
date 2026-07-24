import { $ } from '../../util/dom.ts';
import { Command } from '../../command/command-object.ts';
import { Token } from '../../command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.setTarget = new CommandSchema({
	name: 'setTarget',
	fields: [{ key: 'actor', default: { type: 'trigger' } }],
	customParse({ actor }) {
		return [
			{ color: 'actor' },
			{ text: Local.get('command.setTarget') + Token(': ') },
			{ text: Command.parseActor(actor) }
		];
	},
	onLoad() {
		$('#setTarget-actor').getFocus();
	}
});
