import { $ } from '@/util/dom.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.stopActorAnimation = new CommandSchema({
	name: 'stopActorAnimation',
	fields: [{ key: 'actor', default: { type: 'trigger' } }],
	customParse({ actor }) {
		return [
			{ color: 'actor' },
			{ text: Local.get('command.stopActorAnimation') + Token(': ') },
			{ text: Command.parseActor(actor) }
		];
	},
	onLoad() {
		$('#stopActorAnimation-actor').getFocus();
	}
});
