import { $ } from '../../util/dom.ts';
import { Command } from '../../command/command-object.ts';
import { Token } from '../../command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.setCursor = new CommandSchema({
	name: 'setCursor',
	fields: [{ key: 'image', default: '' }],
	customParse({ image }) {
		return [
			{ color: 'system' },
			{ text: Local.get('command.setCursor') + Token(': ') },
			{ text: Command.parseFileName(image) }
		];
	},
	onLoad() {
		$('#setCursor-image').getFocus();
	}
});
