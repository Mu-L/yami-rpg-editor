import { $ } from '@/util/dom.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.label = new CommandSchema({
	name: 'label',
	fields: [{ key: 'name', domId: 'name', default: '', required: true, trim: true }],
	customParse({ name }) {
		return [
			{ color: 'flow' },
			{ text: Local.get('command.label') + Token(': ') },
			{ color: 'label' },
			{ text: name }
		];
	},
	onLoad() {
		$('#label-name').getFocus('all');
	}
});
