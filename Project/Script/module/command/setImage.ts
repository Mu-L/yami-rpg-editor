import { $, getElementReader } from '../../util/dom.ts';
import { Command } from '../../command/command-object.ts';
import { Token } from '../../command/mark-string-manager.ts';
import { ImageProperty } from '../../command/set-image-property-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.setImage = new CommandSchema({
	name: 'setImage',
	fields: [
		{ key: 'element', default: { type: 'trigger' } },
		{ key: 'properties', default: [] }
	],
	onInitialize() {
		$('#setImage-confirm').on('click', () => this.save());
		$('#setImage-properties').bind(ImageProperty);
		$('#setImage').on('closed', (event) => {
			$('#setImage-properties').clear();
		});
	},
	customParse({ element, properties }) {
		const words = Command.words.push(Command.parseElement(element));
		for (const property of properties) {
			words.push(ImageProperty.parse(property));
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setImage') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		$('#setImage-element').getFocus();
	},
	customSave() {
		const read = getElementReader('setImage');
		const element = read('element');
		const properties = read('properties');
		if (properties.length === 0) {
			return $('#setImage-properties').getFocus();
		}
		Command.save({ element, properties });
	}
});
