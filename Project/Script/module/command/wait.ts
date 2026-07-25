import { $ } from '@/util/dom.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.wait = new CommandSchema({
	name: 'wait',
	fields: [{ key: 'duration', domId: 'duration', default: 1 }],
	customParse({ duration }) {
		return [
			{ color: 'wait' },
			{ text: Local.get('command.wait') + Token(': ') },
			{ text: Command.parseVariableNumber(duration, 'ms') }
		];
	},
	onLoad() {
		$('#wait-duration').getFocus('all');
	}
});
