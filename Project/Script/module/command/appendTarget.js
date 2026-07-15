'use strict'

Command.cases.appendTarget = {
	initialize: function () {
		$('#appendTarget-confirm').on('click', this.save)
	},
	parse: function ({ actor, target }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseActor(target))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.appendTarget') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		target = { type: 'trigger' }
	}) {
		const write = getElementWriter('appendTarget')
		write('actor', actor)
		write('target', target)
		$('#appendTarget-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('appendTarget')
		const actor = read('actor')
		const target = read('target')
		Command.save({ actor, target })
	}
}
