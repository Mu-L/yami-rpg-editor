import { $ } from '../../util/dom.ts';
import { Command } from '../../command/command-object.ts';
import { Token } from '../../command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.setResolution = new CommandSchema({
	name: 'setResolution',
	fields: [
		{ key: 'width', default: 1920 },
		{ key: 'height', default: 1080 },
		{ key: 'sceneScale', default: 1 },
		{ key: 'uiScale', default: 1 }
	],
	customParse({ width, height, sceneScale, uiScale }) {
		const words = Command.words
			.push(
				Command.parseVariableNumber(width) +
					Token(' x ') +
					Command.parseVariableNumber(height)
			)
			.push(Command.parseVariableNumber(sceneScale))
			.push(Command.parseVariableNumber(uiScale));
		return [
			{ color: 'system' },
			{ text: Local.get('command.setResolution') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		$('#setResolution-width').getFocus('all');
	}
});
