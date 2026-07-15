'use strict'

Command.cases.changeThreat = {
	initialize: function () {
		$('#changeThreat-confirm').on('click', this.save)

		// 创建操作选项
		$('#changeThreat-operation').loadItems([
			{ name: 'Increase', value: 'increase' },
			{ name: 'Decrease', value: 'decrease' }
		])
	},
	parseActors: function (actor, target) {
		const sActor = Command.parseActor(actor)
		const dActor = Command.parseActor(target)
		return sActor + Token(' -> ') + dActor
	},
	parseOperation: function (operation) {
		return Local.get('command.changeThreat.' + operation)
	},
	parse: function ({ actor, target, operation, threat }) {
		const words = Command.words
			.push(this.parseActors(actor, target))
			.push(this.parseOperation(operation))
			.push(Command.parseVariableNumber(threat))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changeThreat') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		target = { type: 'trigger' },
		operation = 'increase',
		threat = 0
	}) {
		const write = getElementWriter('changeThreat')
		write('actor', actor)
		write('target', target)
		write('operation', operation)
		write('threat', threat)
		$('#changeThreat-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('changeThreat')
		const actor = read('actor')
		const target = read('target')
		const operation = read('operation')
		const threat = read('threat')
		Command.save({ actor, target, operation, threat })
	}
}
