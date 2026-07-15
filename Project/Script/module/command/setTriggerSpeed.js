'use strict'

Command.cases.setTriggerSpeed = {
	initialize: function () {
		$('#setTriggerSpeed-confirm').on('click', this.save)
	},
	parse: function ({ trigger, speed }) {
		const words = Command.words
			.push(Command.parseTrigger(trigger))
			.push(Command.parseVariableNumber(speed, 't/s'))
		return [
			{ color: 'skill' },
			{ text: Local.get('command.setTriggerSpeed') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ trigger = { type: 'trigger' }, speed = 0 }) {
		const write = getElementWriter('setTriggerSpeed')
		write('trigger', trigger)
		write('speed', speed)
		$('#setTriggerSpeed-trigger').getFocus()
	},
	save: function () {
		const read = getElementReader('setTriggerSpeed')
		const trigger = read('trigger')
		const speed = read('speed')
		Command.save({ trigger, speed })
	}
}
