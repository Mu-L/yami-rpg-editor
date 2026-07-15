'use strict'

Command.cases.resetTargets = {
	initialize: function () {
		$('#resetTargets-confirm').on('click', this.save)
	},
	parse: function ({ actor }) {
		return [
			{ color: 'actor' },
			{ text: Local.get('command.resetTargets') + Token(': ') },
			{ text: Command.parseActor(actor) }
		]
	},
	load: function ({ actor = { type: 'trigger' } }) {
		const write = getElementWriter('resetTargets')
		write('actor', actor)
		$('#resetTargets-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('resetTargets')
		const actor = read('actor')
		Command.save({ actor })
	}
}
