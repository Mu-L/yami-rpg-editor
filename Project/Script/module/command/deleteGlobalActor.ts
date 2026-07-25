import { $ } from '@/util/dom.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.deleteGlobalActor = new CommandSchema({
	name: 'deleteGlobalActor',
	fields: [{ key: 'actorId', default: '', required: true }],
	customParse({ actorId }) {
		const words = Command.words.push(Command.parseFileName(actorId));
		return [
			{ color: 'actor' },
			{ text: Local.get('command.deleteGlobalActor') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		$('#deleteGlobalActor-actorId').getFocus();
	}
});
