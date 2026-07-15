'use strict'

Command.cases.setPlayerActor = {
	initialize: function () {
		$('#setPlayerActor-confirm').on('click', this.save)
	},
	parse: function ({ actor }) {
		return [
			{ color: 'actor' },
			{ text: Local.get('command.setPlayerActor') + Token(': ') },
			{ text: Command.parseActor(actor) }
		]
	},
	load: function ({ actor = { type: 'trigger' } }) {
		const write = getElementWriter('setPlayerActor')
		write('actor', actor)
		$('#setPlayerActor-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('setPlayerActor')
		const actor = read('actor')
		Command.save({ actor })
	}
}
