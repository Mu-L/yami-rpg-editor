import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { ProgressBarProperty } from '@/command/set-progress-property-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setProgressBar = new CommandSchema({
	name: 'setProgressBar',
	onInitialize() {
		$('#setProgressBar-confirm').on('click', () => this.save());
		$('#setProgressBar-properties').bind(ProgressBarProperty);
		$('#setProgressBar').on('closed', () => {
			$('#setProgressBar-properties').clear();
		});
	},
	customParse({ element, properties }) {
		const words = Command.words.push(Command.parseElement(element));
		for (const property of properties) {
			words.push(ProgressBarProperty.parse(property));
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setProgressBar') + Token(': ') },
			{ text: words.join() }
		];
	},
	customLoad({ element = { type: 'trigger' }, properties = [] }) {
		const write = getElementWriter('setProgressBar');
		write('element', element);
		write('properties', properties.slice());
		$('#setProgressBar-element').getFocus();
	},
	customSave() {
		const read = getElementReader('setProgressBar');
		const element = read('element');
		const properties = read('properties');
		if (properties.length === 0) {
			return $('#setProgressBar-properties').getFocus();
		}
		Command.save({ element, properties });
	}
});
