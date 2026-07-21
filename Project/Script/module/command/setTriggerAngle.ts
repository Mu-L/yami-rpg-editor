import { $ } from '../../util/dom.ts';
import { Command } from '../../command/command-object.ts';
import { Token } from '../../command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.setTriggerAngle = new CommandSchema({
	name: 'setTriggerAngle',
	fields: [
		{ key: 'trigger', default: { type: 'trigger' } },
		{ key: 'angle', default: { type: 'absolute', degrees: 0 } }
	],
	customParse({ trigger, angle }) {
		const words = Command.words
			.push(Command.parseTrigger(trigger))
			.push(Command.parseAngle(angle));
		return [
			{ color: 'skill' },
			{ text: Local.get('command.setTriggerAngle') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		$('#setTriggerAngle-trigger').getFocus();
	}
});
