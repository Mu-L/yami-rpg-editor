import { $ } from '../../util/dom.ts';
import { Command } from '../../command/command-object.ts';
import { Token } from '../../command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Color } from '../../tools/color-picker-window.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.renderOutline = new CommandSchema({
	name: 'renderOutline',
	onInitialize() {
		$('#renderOutline-confirm').on('click', () => this.save());
		$('#renderOutline-operation').loadItems([
			{ name: 'Add', value: 'add' },
			{ name: 'Remove', value: 'remove' },
			{ name: 'Reset', value: 'reset' }
		]);
		$('#renderOutline-operation')
			.enableHiddenMode()
			.relate([
				{
					case: 'add',
					targets: [$('#renderOutline-actor'), $('#renderOutline-color')]
				},
				{ case: 'remove', targets: [$('#renderOutline-actor')] }
			]);
	},
	customParse({ operation, actor, color }) {
		const label = Local.get('command.renderOutline.' + operation);
		const words = Command.words;
		switch (operation) {
			case 'add':
				words
					.push(label)
					.push(Command.parseActor(actor))
					.push(Command.parseHexColor(Color.simplifyHexColor(color)));
				break;
			case 'remove':
				words.push(label).push(Command.parseActor(actor));
				break;
			case 'reset':
				words.push(label);
				break;
		}
		return [
			{ color: 'flow' },
			{ text: Local.get('command.renderOutline') + Token(': ') },
			{ text: words.join() }
		];
	},
	customLoad({ operation = 'add', actor = { type: 'trigger' }, color = 'ffffffff' }) {
		$('#renderOutline-operation').write(operation);
		$('#renderOutline-actor').write(actor);
		$('#renderOutline-color').write(color);
		$('#renderOutline-operation').getFocus();
	},
	customSave() {
		const operation = $('#renderOutline-operation').read();
		switch (operation) {
			case 'add': {
				Command.save({
					operation,
					actor: $('#renderOutline-actor').read(),
					color: $('#renderOutline-color').read()
				});
				break;
			}
			case 'remove': {
				Command.save({
					operation,
					actor: $('#renderOutline-actor').read()
				});
				break;
			}
			case 'reset':
				Command.save({ operation });
				break;
		}
	}
});
