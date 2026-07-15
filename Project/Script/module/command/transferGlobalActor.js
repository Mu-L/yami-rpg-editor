'use strict'

Command.cases.transferGlobalActor = {
	initialize: function () {
		$('#transferGlobalActor-confirm').on('click', this.save)
	},
	parse: function ({ actor, position }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parsePosition(position))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.transferGlobalActor') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		position = { type: 'absolute', x: 0, y: 0 }
	}) {
		const write = getElementWriter('transferGlobalActor')
		write('actor', actor)
		write('position', position)
		$('#transferGlobalActor-actor').getFocus('all')
	},
	save: function () {
		const read = getElementReader('transferGlobalActor')
		const actor = read('actor')
		const position = read('position')
		Command.save({ actor, position })
	}
}
