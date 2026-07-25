import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { LightProperty } from '@/command/move-light-property-window.ts';
import { Data } from '@/data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.moveLight = new CommandSchema({
	name: 'moveLight',
	onInitialize() {
		$('#moveLight-confirm').on('click', () => this.save());
		$('#moveLight-properties').bind(LightProperty);
		$('#moveLight-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		]);
		$('#moveLight').on('open', function (event) {
			$('#moveLight-easingId').loadItems(Data.createEasingItems());
		});
		$('#moveLight').on('closed', function (event) {
			$('#moveLight-properties').clear();
			$('#moveLight-easingId').clear();
		});
	},
	customParse({ light, properties, easingId, duration, wait }) {
		const words = Command.words.push(Command.parseLight(light));
		for (const property of properties) {
			words.push(LightProperty.parse(property));
		}
		words.push(Command.parseEasing(easingId, duration, wait));
		return [
			{ color: 'object' },
			{ text: Local.get('command.moveLight') + Token(': ') },
			{ text: words.join() }
		];
	},
	customLoad({
		light = { type: 'trigger' },
		properties = [],
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('moveLight');
		write('light', light);
		write('properties', properties.slice());
		write('easingId', easingId);
		write('duration', duration);
		write('wait', wait);
		$('#moveLight-light').getFocus();
	},
	customSave() {
		const read = getElementReader('moveLight');
		const properties = read('properties');
		if (properties.length === 0) {
			return $('#moveLight-properties').getFocus();
		}
		Command.save({
			light: read('light'),
			properties,
			easingId: read('easingId'),
			duration: read('duration'),
			wait: read('wait')
		});
	}
});
