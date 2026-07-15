'use strict'

Command.cases.setTriggerAngle = {
	initialize: function () {
		$('#setTriggerAngle-confirm').on('click', this.save)
	},
	parse: function ({ trigger, angle }) {
		const words = Command.words
			.push(Command.parseTrigger(trigger))
			.push(Command.parseAngle(angle))
		return [
			{ color: 'skill' },
			{ text: Local.get('command.setTriggerAngle') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		trigger = { type: 'trigger' },
		angle = { type: 'absolute', degrees: 0 }
	}) {
		const write = getElementWriter('setTriggerAngle')
		write('trigger', trigger)
		write('angle', angle)
		$('#setTriggerAngle-trigger').getFocus()
	},
	save: function () {
		const read = getElementReader('setTriggerAngle')
		const trigger = read('trigger')
		const angle = read('angle')
		Command.save({ trigger, angle })
	}
}
