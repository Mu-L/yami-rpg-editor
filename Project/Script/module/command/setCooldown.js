'use strict'

Command.cases.setCooldown = {
	initialize: function () {
		$('#setCooldown-confirm').on('click', this.save)

		// 创建操作选项
		$('#setCooldown-operation').loadItems([
			{ name: 'Set', value: 'set' },
			{ name: 'Increase', value: 'increase' },
			{ name: 'Decrease', value: 'decrease' }
		])
	},
	parse: function ({ actor, operation, key, cooldown }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Local.get('command.setCooldown.' + operation))
			.push(Command.parseVariableEnum('cooldown-key', key))
			.push(Command.parseVariableNumber(cooldown, 'ms'))
		return [
			{ color: 'inventory' },
			{ text: Local.get('command.setCooldown') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		operation = 'set',
		key = Enum.getDefStringId('cooldown-key'),
		cooldown = 0
	}) {
		// 加载冷却键选项
		$('#setCooldown-key').loadItems(Enum.getStringItems('cooldown-key'))
		const write = getElementWriter('setCooldown')
		write('actor', actor)
		write('operation', operation)
		write('key', key)
		write('cooldown', cooldown)
		$('#setCooldown-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('setCooldown')
		const actor = read('actor')
		const operation = read('operation')
		const key = read('key')
		if (key === '') {
			return $('#setCooldown-key').getFocus()
		}
		const cooldown = read('cooldown')
		Command.save({ actor, operation, key, cooldown })
	}
}
