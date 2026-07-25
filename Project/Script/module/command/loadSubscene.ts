import { $ } from '@/util/dom.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.loadSubscene = new CommandSchema({
	name: 'loadSubscene',
	fields: [
		{ key: 'sceneId', default: '', required: true },
		{ key: 'shiftX', default: 0 },
		{ key: 'shiftY', default: 0 }
	],
	customParse({ sceneId, shiftX, shiftY }) {
		const words = Command.words
			.push(Command.parseVariableFile(sceneId))
			.push(Command.parseVariableNumber(shiftX))
			.push(Command.parseVariableNumber(shiftY));
		return [
			{ color: 'scene' },
			{ text: Local.get('command.loadSubscene') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		$('#loadSubscene-sceneId').getFocus();
	}
});
