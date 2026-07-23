import { $, getElementReader, getElementWriter } from '../../util/dom.ts';
import { Command } from '../../command/command-object.ts';
import { Token } from '../../command/mark-string-manager.ts';
import { Select } from '../../components/select-list.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.controlButton = new CommandSchema({
	name: 'controlButton',
	onInitialize() {
		$('#controlButton-confirm').on('click', () => this.save());
		$('#controlButton-operation').loadItems([
			{ name: 'Select Default Button', value: 'select-default' },
			{ name: 'Select Button', value: 'select' },
			{ name: 'Display Hover Mode', value: 'hover-mode' },
			{ name: 'Display Active Mode', value: 'active-mode' },
			{ name: 'Restore Display Mode', value: 'normal-mode' }
		]);
		$('#controlButton-operation')
			.enableHiddenMode()
			.relate([
				{
					case: ['select', 'hover-mode', 'active-mode', 'normal-mode'],
					targets: [$('#controlButton-element')]
				}
			]);
	},
	customParse({ operation, element }) {
		const words = Command.words.push(Local.get('command.controlButton.' + operation));
		switch (operation) {
			case 'select':
			case 'hover-mode':
			case 'active-mode':
			case 'normal-mode':
				words.push(Command.parseElement(element));
				break;
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.controlButton') + Token(': ') },
			{ text: words.join() }
		];
	},
	customLoad({ operation = 'select-default', element = { type: 'trigger' } }) {
		const write = getElementWriter('controlButton');
		write('operation', operation);
		write('element', element);
		$('#controlButton-operation').getFocus();
	},
	customSave() {
		const read = getElementReader('controlButton');
		const operation = read('operation');
		switch (operation) {
			case 'select-default':
				Command.save({ operation });
				break;
			case 'select':
			case 'hover-mode':
			case 'active-mode':
			case 'normal-mode': {
				Command.save({ operation, element: read('element') });
				break;
			}
		}
	}
});
