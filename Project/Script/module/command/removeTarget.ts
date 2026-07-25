import { $ } from '@/util/dom.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.removeTarget = new CommandSchema({
	name: 'removeTarget',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'target', default: { type: 'trigger' } }
	],
	customParse({ actor, target }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseActor(target));
		return [
			{ color: 'actor' },
			{ text: Local.get('command.removeTarget') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		$('#removeTarget-actor').getFocus();
	}
});
