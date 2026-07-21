import { $, getElementReader, getElementWriter } from '../../util/dom.ts';
import { Command } from '../../command/command-object.ts';
import { Token } from '../../command/mark-string-manager.ts';
import { DialogBoxProperty } from '../../command/set-dialog-property-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.setDialogBox = new CommandSchema({
	name: 'setDialogBox',
	onInitialize() {
		$('#setDialogBox-confirm').on('click', () => this.save());
		$('#setDialogBox-properties').bind(DialogBoxProperty);
		$('#setDialogBox').on('closed', (event) => {
			$('#setDialogBox-properties').clear();
		});
	},
	customParse({ element, properties }) {
		const words = Command.words.push(Command.parseElement(element));
		for (const property of properties) {
			words.push(DialogBoxProperty.parse(property));
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setDialogBox') + Token(': ') },
			{ text: words.join() }
		];
	},
	customLoad({ element = { type: 'trigger' }, properties = [] }) {
		const write = getElementWriter('setDialogBox');
		write('element', element);
		write('properties', properties.slice());
		$('#setDialogBox-element').getFocus();
	},
	customSave() {
		const read = getElementReader('setDialogBox');
		const element = read('element');
		const properties = read('properties');
		if (properties.length === 0) {
			return $('#setDialogBox-properties').getFocus();
		}
		Command.save({ element, properties });
	}
});
