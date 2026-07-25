import { $ } from '@/util/dom.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { Data } from '@/data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setZoomFactor = new CommandSchema({
	name: 'setZoomFactor',
	fields: [
		{ key: 'zoom', default: 1 },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 0 },
		{ key: 'wait', default: false }
	],
	onInitialize() {
		$('#setZoomFactor-confirm').on('click', () => this.save());
		$('#setZoomFactor-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		]);
		$('#setZoomFactor').on('open', function (event) {
			$('#setZoomFactor-easingId').loadItems(Data.createEasingItems());
		});
		$('#setZoomFactor').on('closed', function (event) {
			$('#setZoomFactor-easingId').clear();
		});
	},
	customParse({ zoom, easingId, duration, wait }) {
		const words = Command.words
			.push(Command.parseVariableNumber(zoom))
			.push(Command.parseEasing(easingId, duration, wait));
		return [
			{ color: 'scene' },
			{ text: Local.get('command.setZoomFactor') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		$('#setZoomFactor-zoom').getFocus('all');
	}
});
