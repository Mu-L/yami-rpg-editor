import { $ } from '@/util/dom.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.controlDialog = new CommandSchema({
	name: 'controlDialog',
	fields: [
		{ key: 'element', default: { type: 'trigger' } },
		{ key: 'operation', default: 'pause' }
	],
	onInitialize() {
		$('#controlDialog-confirm').on('click', () => this.save());
		$('#controlDialog-operation').loadItems([
			{ name: 'Pause Printing', value: 'pause' },
			{ name: 'Continue Printing', value: 'continue' },
			{ name: 'Print Immediately', value: 'print-immediately' },
			{ name: 'Print Next Page', value: 'print-next-page' }
		]);
	},
	customParse({ element, operation }) {
		const words = Command.words
			.push(Command.parseElement(element))
			.push(Local.get('command.controlDialog.' + operation));
		return [
			{ color: 'element' },
			{ text: Local.get('command.controlDialog') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		$('#controlDialog-element').getFocus();
	}
});
