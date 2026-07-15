'use strict'

Command.cases.setTarget = {
	initialize: function () {
		$('#setTarget-confirm').on('click', this.save)
	},
	parse: function ({ actor }) {
		return [
			{ color: 'actor' },
			{ text: Local.get('command.setTarget') + Token(': ') },
			{ text: Command.parseActor(actor) }
		]
	},
	load: function ({ actor = { type: 'trigger' } }) {
		const write = getElementWriter('setTarget')
		write('actor', actor)
		$('#setTarget-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('setTarget')
		const actor = read('actor')
		Command.save({ actor })
	}
}
