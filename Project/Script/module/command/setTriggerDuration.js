'use strict'

Command.cases.setTriggerDuration = new CommandSchema({
	name: 'setTriggerDuration',
	onInitialize() {
		$('#setTriggerDuration-confirm').on('click', () => this.save())
		$('#setTriggerDuration-operation').loadItems([
			{ name: 'Set', value: 'set' },
			{ name: 'Increase', value: 'increase' },
			{ name: 'Decrease', value: 'decrease' }
		])
	},
	customParse({ trigger, operation, duration }) {
		const words = Command.words
			.push(Command.parseTrigger(trigger))
			.push(Local.get('command.setTriggerDuration.' + operation))
			.push(Command.parseVariableNumber(duration, 'ms'))
		return [
			{ color: 'skill' },
			{ text: Local.get('command.setTriggerDuration') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({
		trigger = { type: 'trigger' },
		operation = 'set',
		duration = 0
	}) {
		const write = getElementWriter('setTriggerDuration')
		write('trigger', trigger)
		write('operation', operation)
		write('duration', duration)
		$('#setTriggerDuration-trigger').getFocus()
	},
	customSave() {
		const read = getElementReader('setTriggerDuration')
		Command.save({
			trigger: read('trigger'),
			operation: read('operation'),
			duration: read('duration')
		})
	}
})
