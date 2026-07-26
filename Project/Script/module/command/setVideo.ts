import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { VideoProperty } from '@/command/set-video-property-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setVideo = new CommandSchema({
	name: 'setVideo',
	onInitialize() {
		$('#setVideo-confirm').on('click', () => this.save());
		$('#setVideo-properties').bind(VideoProperty);
		$('#setVideo').on('closed', () => {
			$('#setVideo-properties').clear();
		});
	},
	customParse({ element, properties }) {
		const words = Command.words.push(Command.parseElement(element));
		for (const property of properties) {
			words.push(VideoProperty.parse(property));
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setVideo') + Token(': ') },
			{ text: words.join() }
		];
	},
	customLoad({ element = { type: 'trigger' }, properties = [] }) {
		const write = getElementWriter('setVideo');
		write('element', element);
		write('properties', properties.slice());
		$('#setVideo-element').getFocus();
	},
	customSave() {
		const read = getElementReader('setVideo');
		const element = read('element');
		const properties = read('properties');
		if (properties.length === 0) {
			return $('#setVideo-properties').getFocus();
		}
		Command.save({ element, properties });
	}
});
