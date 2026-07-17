'use strict'

Command.cases.setTriggerMotion = new CommandSchema({
	name: 'setTriggerMotion',
	fields: [
		{ key: 'trigger', default: { type: 'trigger' } },
		{ key: 'motion', default: '', required: true }
	],
	customParse({ trigger, motion }) {
		const words = Command.words
			.push(Command.parseTrigger(trigger))
			.push(Command.parseEnumString(motion))
		return [
			{ color: 'skill' },
			{ text: Local.get('command.setTriggerMotion') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#setTriggerMotion-trigger').getFocus()
	}
})
