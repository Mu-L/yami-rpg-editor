'use strict'

Command.cases.setTriggerAngle = new CommandSchema({
	name: 'setTriggerAngle',
	customParse({ trigger, angle }) {
		const words = Command.words
			.push(Command.parseTrigger(trigger))
			.push(Command.parseAngle(angle))
		return [
			{ color: 'skill' },
			{ text: Local.get('command.setTriggerAngle') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({
		trigger = { type: 'trigger' },
		angle = { type: 'absolute', degrees: 0 }
	}) {
		const write = getElementWriter('setTriggerAngle')
		write('trigger', trigger)
		write('angle', angle)
		$('#setTriggerAngle-trigger').getFocus()
	},
	customSave() {
		const read = getElementReader('setTriggerAngle')
		Command.save({ trigger: read('trigger'), angle: read('angle') })
	}
})
