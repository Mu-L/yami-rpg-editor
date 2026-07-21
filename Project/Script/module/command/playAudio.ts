import { $, getElementReader, getElementWriter } from '../../util/dom.ts';
import { Command } from '../../command/command-object.ts';
import { Token } from '../../command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.playAudio = new CommandSchema({
	name: 'playAudio',
	onInitialize() {
		$('#playAudio-confirm').on('click', () => this.save());
		$('#playAudio-type').loadItems([
			{ name: 'BGM', value: 'bgm' },
			{ name: 'BGS', value: 'bgs' },
			{ name: 'CV', value: 'cv' },
			{ name: 'SE', value: 'se' },
			{ name: 'SE - Attenuated', value: 'se-attenuated' }
		]);
		$('#playAudio-type')
			.enableHiddenMode()
			.relate([
				{ case: 'se-attenuated', targets: [$('#playAudio-location')] }
			]);
	},
	customParse({ type, audio, volume, location }) {
		const words = Command.words
			.push(Command.parseAudioType(type))
			.push(Command.parseFileName(audio))
			.push(Command.setNumberColor(volume));
		switch (type) {
			case 'se-attenuated':
				words.push(Command.parsePosition(location));
				break;
		}
		return [
			{ color: 'audio' },
			{ text: Local.get('command.playAudio') + Token(': ') },
			{ text: words.join() }
		];
	},
	customLoad({
		type = 'se-attenuated',
		audio = '',
		volume = 1,
		location = { type: 'actor', actor: { type: 'trigger' } }
	}) {
		const write = getElementWriter('playAudio');
		write('type', type);
		write('audio', audio);
		write('volume', volume);
		write('location', location);
		$('#playAudio-type').getFocus();
	},
	customSave() {
		const read = getElementReader('playAudio');
		const type = read('type');
		const audio = read('audio');
		const volume = read('volume');
		if (audio === '') {
			return $('#playAudio-audio').getFocus();
		}
		switch (type) {
			case 'bgm':
			case 'bgs':
			case 'cv':
			case 'se':
				Command.save({ type, audio, volume });
				break;
			case 'se-attenuated': {
				const location = read('location');
				Command.save({ type, audio, volume, location });
				break;
			}
		}
	}
});
