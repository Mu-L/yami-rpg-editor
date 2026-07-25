import { $ } from '@/util/dom.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.transferGlobalActor = new CommandSchema({
	name: 'transferGlobalActor',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'position', default: { type: 'absolute', x: 0, y: 0 } }
	],
	customParse({ actor, position }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parsePosition(position));
		return [
			{ color: 'actor' },
			{ text: Local.get('command.transferGlobalActor') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		$('#transferGlobalActor-actor').getFocus('all');
	}
});
