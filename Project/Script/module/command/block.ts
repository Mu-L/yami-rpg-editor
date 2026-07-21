import { $ } from '../../util/dom.ts';
import { Command } from '../../command/command-object.ts';
import { Token } from '../../command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.block = new CommandSchema({
	name: 'block',
	onInitialize() {
		$('#block-confirm').on('click', () => this.save());
	},
	customParse({ note, asynchronous, commands }) {
		if (asynchronous === undefined) {
			asynchronous = false;
		}
		const asyncFlag = asynchronous ? Command.setOperatorColor('*') : '';
		const blockNote =
			note || asyncFlag ? Token(': ') + note + asyncFlag : '';
		return [
			{ fold: true },
			{ color: 'flow' },
			{ text: Local.get('command.block') + blockNote },
			{ children: commands },
			{ color: 'flow' },
			{ text: Local.get('command.block.end') }
		];
	},
	customLoad({ note = '', asynchronous = false, commands = [] }) {
		$('#block-note').write(note);
		$('#block-asynchronous').write(asynchronous);
		$('#block-note').getFocus();
		this.commands = commands;
	},
	customSave() {
		const note = $('#block-note').read().trim();
		const asynchronous = $('#block-asynchronous').read();
		Command.save({ note, asynchronous, commands: this.commands });
	}
});
