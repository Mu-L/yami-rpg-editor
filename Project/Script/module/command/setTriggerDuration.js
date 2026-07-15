'use strict'

Command.cases.setTriggerDuration = {
	initialize: function () {
		$('#setTriggerDuration-confirm').on('click', this.save)

		// 创建操作选项
		$('#setTriggerDuration-operation').loadItems([
			{ name: 'Set', value: 'set' },
			{ name: 'Increase', value: 'increase' },
			{ name: 'Decrease', value: 'decrease' }
		])
	},
	parse: function ({ trigger, operation, duration }) {
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
	load: function ({
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
	save: function () {
		const read = getElementReader('setTriggerDuration')
		const trigger = read('trigger')
		const operation = read('operation')
		const duration = read('duration')
		Command.save({ trigger, operation, duration })
	}
}
