'use strict'

Command.cases.setState = {
	initialize: function () {
		$('#setState-confirm').on('click', this.save)

		// 创建操作选项
		$('#setState-operation').loadItems([
			{ name: 'Set Time', value: 'set-time' },
			{ name: 'Increase Time', value: 'increase-time' },
			{ name: 'Decrease Time', value: 'decrease-time' }
		])
	},
	parseOperation: function (operation) {
		return Local.get('command.setState.' + operation)
	},
	parse: function ({ state, operation, time }) {
		const words = Command.words
			.push(Command.parseState(state))
			.push(this.parseOperation(operation))
			.push(Command.parseVariableNumber(time, 'ms'))
		return [
			{ color: 'object' },
			{ text: Local.get('command.setState') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		state = { type: 'trigger' },
		operation = 'set-time',
		time = 0
	}) {
		const write = getElementWriter('setState')
		write('state', state)
		write('operation', operation)
		write('time', time)
		$('#setState-state').getFocus()
	},
	save: function () {
		const read = getElementReader('setState')
		const state = read('state')
		const operation = read('operation')
		const time = read('time')
		Command.save({ state, operation, time })
	}
}
