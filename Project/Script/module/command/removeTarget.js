'use strict'

Command.cases.removeTarget = {
	initialize: function () {
		$('#removeTarget-confirm').on('click', this.save)
	},
	parse: function ({ actor, target }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseActor(target))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.removeTarget') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		target = { type: 'trigger' }
	}) {
		const write = getElementWriter('removeTarget')
		write('actor', actor)
		write('target', target)
		$('#removeTarget-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('removeTarget')
		const actor = read('actor')
		const target = read('target')
		Command.save({ actor, target })
	}
}
