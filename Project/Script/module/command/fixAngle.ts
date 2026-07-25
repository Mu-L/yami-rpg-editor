import { $ } from '@/util/dom.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.fixAngle = new CommandSchema({
	name: 'fixAngle',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'fixed', default: true }
	],
	onInitialize() {
		$('#fixAngle-confirm').on('click', () => this.save());
		$('#fixAngle-fixed').loadItems([
			{ name: 'Fixed', value: true },
			{ name: 'Unfixed', value: false }
		]);
	},
	customParse({ actor, fixed }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Local.get('command.fixAngle.fixed.' + fixed));
		return [
			{ color: 'actor' },
			{ text: Local.get('command.fixAngle') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		$('#fixAngle-actor').getFocus();
	}
});
