import { $ } from '@/util/dom.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setTriggerMotion = new CommandSchema({
	name: 'setTriggerMotion',
	fields: [
		{ key: 'trigger', default: { type: 'trigger' } },
		{ key: 'motion', default: '', required: true }
	],
	customParse({ trigger, motion }) {
		const words = Command.words
			.push(Command.parseTrigger(trigger))
			.push(Command.parseEnumString(motion));
		return [
			{ color: 'skill' },
			{ text: Local.get('command.setTriggerMotion') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		$('#setTriggerMotion-trigger').getFocus();
	}
});
