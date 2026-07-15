'use strict'

Command.cases.stopActorAnimation = {
	initialize: function () {
		$('#stopActorAnimation-confirm').on('click', this.save)
	},
	parse: function ({ actor }) {
		return [
			{ color: 'actor' },
			{ text: Local.get('command.stopActorAnimation') + Token(': ') },
			{ text: Command.parseActor(actor) }
		]
	},
	load: function ({ actor = { type: 'trigger' } }) {
		const write = getElementWriter('stopActorAnimation')
		write('actor', actor)
		$('#stopActorAnimation-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('stopActorAnimation')
		const actor = read('actor')
		Command.save({ actor })
	}
}
