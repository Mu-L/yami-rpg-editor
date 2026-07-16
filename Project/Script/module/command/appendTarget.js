'use strict'

Command.cases.appendTarget = new CommandSchema({
	name: 'appendTarget',
	customParse({ actor, target }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseActor(target))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.appendTarget') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({ actor = { type: 'trigger' }, target = { type: 'trigger' } }) {
		const write = getElementWriter('appendTarget')
		write('actor', actor)
		write('target', target)
		$('#appendTarget-actor').getFocus()
	},
	customSave() {
		const read = getElementReader('appendTarget')
		Command.save({ actor: read('actor'), target: read('target') })
	}
})
