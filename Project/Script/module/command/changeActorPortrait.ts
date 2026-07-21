import { $, getElementReader, getElementWriter } from '../../util/dom.ts';
import { Command } from '../../command/command-object.ts';
import { Token } from '../../command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.changeActorPortrait = new CommandSchema({
	name: 'changeActorPortrait',
	onInitialize() {
		$('#changeActorPortrait-confirm').on('click', () => this.save());
		$('#changeActorPortrait-mode').loadItems([
			{ name: 'Full Mode', value: 'full' },
			{ name: 'Image Mode', value: 'portrait' },
			{ name: 'Clip Mode', value: 'clip' }
		]);
		$('#changeActorPortrait-mode')
			.enableHiddenMode()
			.relate([
				{
					case: 'full',
					targets: [
						$('#changeActorPortrait-portrait'),
						$('#changeActorPortrait-clip')
					]
				},
				{
					case: 'portrait',
					targets: [$('#changeActorPortrait-portrait')]
				},
				{ case: 'clip', targets: [$('#changeActorPortrait-clip')] }
			]);
	},
	parsePortraitClip(clip) {
		const label = Local.get('command.changeActorPortrait.clip');
		const x = Command.setNumberColor(clip[0]);
		const y = Command.setNumberColor(clip[1]);
		const width = Command.setNumberColor(clip[2]);
		const height = Command.setNumberColor(clip[3]);
		return (
			label +
			Token('(') +
			x +
			Token(', ') +
			y +
			Token(', ') +
			width +
			Token(', ') +
			height +
			Token(')')
		);
	},
	customParse({ actor, mode, portrait, clip }) {
		const words = Command.words.push(Command.parseActor(actor));
		switch (mode) {
			case 'full':
				words
					.push(Command.parseFileName(portrait))
					.push(this.parsePortraitClip(clip));
				break;
			case 'portrait':
				words.push(Command.parseFileName(portrait));
				break;
			case 'clip':
				words.push(this.parsePortraitClip(clip));
				break;
		}
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changeActorPortrait') + Token(': ') },
			{ text: words.join() }
		];
	},
	customLoad({
		actor = { type: 'trigger' },
		mode = 'full',
		portrait = '',
		clip = [0, 0, 64, 64]
	}) {
		const write = getElementWriter('changeActorPortrait');
		write('actor', actor);
		write('mode', mode);
		write('portrait', portrait);
		write('clip', clip);
		$('#changeActorPortrait-actor').getFocus();
	},
	customSave() {
		const read = getElementReader('changeActorPortrait');
		const actor = read('actor');
		const mode = read('mode');
		const portrait = read('portrait');
		const clip = read('clip');
		switch (mode) {
			case 'full':
				return Command.save({ actor, mode, portrait, clip });
			case 'portrait':
				return Command.save({ actor, mode, portrait });
			case 'clip':
				return Command.save({ actor, mode, clip });
		}
	}
});
