'use strict'

Command.cases.deleteActor = {
	initialize: function () {
		$('#deleteActor-confirm').on('click', this.save)
	},
	parse: function ({ actor }) {
		return [
			{ color: 'actor' },
			{ text: Local.get('command.deleteActor') + Token(': ') },
			{ text: Command.parseActor(actor) }
		]
	},
	load: function ({ actor = { type: 'trigger' } }) {
		const write = getElementWriter('deleteActor')
		write('actor', actor)
		$('#deleteActor-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('deleteActor')
		const actor = read('actor')
		Command.save({ actor })
	}
}
