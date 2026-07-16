'use strict'

Command.cases.setState = new CommandSchema({
	name: 'setState',
	onInitialize() {
		$('#setState-confirm').on('click', () => this.save())
		$('#setState-operation').loadItems([
			{ name: 'Set Time', value: 'set-time' },
			{ name: 'Increase Time', value: 'increase-time' },
			{ name: 'Decrease Time', value: 'decrease-time' }
		])
	},
	parseOperation(operation) {
		return Local.get('command.setState.' + operation)
	},
	customParse({ state, operation, time }) {
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
	customLoad({
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
	customSave() {
		const read = getElementReader('setState')
		Command.save({
			state: read('state'),
			operation: read('operation'),
			time: read('time')
		})
	}
})
