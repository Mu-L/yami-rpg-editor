'use strict'

Command.cases.setTriggerSpeed = new CommandSchema({
	name: 'setTriggerSpeed',
	fields: [
		{ key: 'trigger', default: { type: 'trigger' } },
		{ key: 'speed', default: 0 }
	],
	customParse({ trigger, speed }) {
		const words = Command.words
			.push(Command.parseTrigger(trigger))
			.push(Command.parseVariableNumber(speed, 't/s'))
		return [
			{ color: 'skill' },
			{ text: Local.get('command.setTriggerSpeed') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#setTriggerSpeed-trigger').getFocus()
	}
})
