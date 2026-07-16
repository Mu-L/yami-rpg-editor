'use strict'

Command.cases.setCooldown = new CommandSchema({
	name: 'setCooldown',
	onInitialize() {
		$('#setCooldown-confirm').on('click', () => this.save())
		$('#setCooldown-operation').loadItems([
			{ name: 'Set', value: 'set' },
			{ name: 'Increase', value: 'increase' },
			{ name: 'Decrease', value: 'decrease' }
		])
	},
	customParse({ actor, operation, key, cooldown }) {
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
	customLoad({
		actor = { type: 'trigger' },
		operation = 'set',
		key = Enum.getDefStringId('cooldown-key'),
		cooldown = 0
	}) {
		$('#setCooldown-key').loadItems(Enum.getStringItems('cooldown-key'))
		const write = getElementWriter('setCooldown')
		write('actor', actor)
		write('operation', operation)
		write('key', key)
		write('cooldown', cooldown)
		$('#setCooldown-actor').getFocus()
	},
	customSave() {
		const read = getElementReader('setCooldown')
		const key = read('key')
		if (key === '') {
			return $('#setCooldown-key').getFocus()
		}
		Command.save({
			actor: read('actor'),
			operation: read('operation'),
			key,
			cooldown: read('cooldown')
		})
	}
})
