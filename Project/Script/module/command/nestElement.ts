import { $ } from '@/util/dom.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.nestElement = new CommandSchema({
	name: 'nestElement',
	fields: [
		{ key: 'parent', domId: 'parent', default: { type: 'trigger' } },
		{ key: 'child', domId: 'child', default: { type: 'latest' } }
	],
	customParse({ parent, child }) {
		const pElement = Command.parseElement(parent);
		const cElement = Command.parseElement(child);
		return [
			{ color: 'element' },
			{ text: Local.get('command.nestElement') + Token(': ') },
			{ text: pElement + Token(' -> ') + cElement }
		];
	},
	onLoad() {
		$('#nestElement-parent').getFocus();
	}
});
