'use strict'

Command.cases.setTriggerSpeed = new CommandSchema({
	name: 'setTriggerSpeed',
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
	customLoad({ trigger = { type: 'trigger' }, speed = 0 }) {
		const write = getElementWriter('setTriggerSpeed')
		write('trigger', trigger)
		write('speed', speed)
		$('#setTriggerSpeed-trigger').getFocus()
	},
	customSave() {
		const read = getElementReader('setTriggerSpeed')
		Command.save({ trigger: read('trigger'), speed: read('speed') })
	}
})
