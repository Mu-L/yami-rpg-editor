'use strict'

Command.cases.removeTarget = new CommandSchema({
	name: 'removeTarget',
	customParse({ actor, target }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseActor(target))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.removeTarget') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({ actor = { type: 'trigger' }, target = { type: 'trigger' } }) {
		const write = getElementWriter('removeTarget')
		write('actor', actor)
		write('target', target)
		$('#removeTarget-actor').getFocus()
	},
	customSave() {
		const read = getElementReader('removeTarget')
		Command.save({ actor: read('actor'), target: read('target') })
	}
})
