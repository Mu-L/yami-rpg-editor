import { $, getElementReader } from '@/util/dom.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { WindowProperty } from '@/command/set-window-property-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setWindow = new CommandSchema({
	name: 'setWindow',
	fields: [
		{ key: 'element', default: { type: 'trigger' } },
		{ key: 'properties', default: [] }
	],
	onInitialize() {
		$('#setWindow-confirm').on('click', () => this.save());
		$('#setWindow-properties').bind(WindowProperty);
		$('#setWindow').on('closed', () => {
			$('#setWindow-properties').clear();
		});
	},
	customParse({ element, properties }) {
		const words = Command.words.push(Command.parseElement(element));
		for (const property of properties) {
			words.push(WindowProperty.parse(property));
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setWindow') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		$('#setWindow-element').getFocus();
	},
	customSave() {
		const read = getElementReader('setWindow');
		const element = read('element');
		const properties = read('properties');
		if (properties.length === 0) {
			return $('#setWindow-properties').getFocus();
		}
		Command.save({ element, properties });
	}
});
