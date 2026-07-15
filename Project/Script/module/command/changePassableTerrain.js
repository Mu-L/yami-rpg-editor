'use strict'

Command.cases.changePassableTerrain = {
	initialize: function () {
		$('#changePassableTerrain-confirm').on('click', this.save)
		$('#changePassableTerrain-passage').loadItems([
			{ name: 'Land', value: 'land' },
			{ name: 'Water', value: 'water' },
			{ name: 'Unrestricted', value: 'unrestricted' }
		])
	},
	parse: function ({ actor, passage }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Local.get('command.changePassableTerrain.' + passage))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changePassableTerrain') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ actor = { type: 'trigger' }, passage = 'land' }) {
		const write = getElementWriter('changePassableTerrain')
		write('actor', actor)
		write('passage', passage)
		$('#changePassableTerrain-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('changePassableTerrain')
		const actor = read('actor')
		const passage = read('passage')
		Command.save({ actor, passage })
	}
}
