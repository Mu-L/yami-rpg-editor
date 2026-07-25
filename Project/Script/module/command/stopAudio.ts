import { $ } from '@/util/dom.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.stopAudio = new CommandSchema({
	name: 'stopAudio',
	fields: [{ key: 'type', default: 'bgm' }],
	onInitialize() {
		$('#stopAudio-confirm').on('click', () => this.save());
		$('#stopAudio-type').loadItems([
			{ name: 'BGM', value: 'bgm' },
			{ name: 'BGS', value: 'bgs' },
			{ name: 'CV', value: 'cv' },
			{ name: 'SE', value: 'se' },
			{ name: 'ALL', value: 'all' }
		]);
	},
	customParse({ type }) {
		const words = Command.words.push(Command.parseAudioType(type));
		return [
			{ color: 'audio' },
			{ text: Local.get('command.stopAudio') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		$('#stopAudio-type').getFocus();
	}
});
