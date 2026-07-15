'use strict'

Command.cases.setWeight = {
	initialize: function () {
		$('#setWeight-confirm').on('click', this.save)
	},
	parse: function ({ actor, weight }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseVariableNumber(weight))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.setWeight') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ actor = { type: 'trigger' }, weight = 0 }) {
		const write = getElementWriter('setWeight')
		write('actor', actor)
		write('weight', weight)
		$('#setWeight-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('setWeight')
		const actor = read('actor')
		const weight = read('weight')
		Command.save({ actor, weight })
	}
}
