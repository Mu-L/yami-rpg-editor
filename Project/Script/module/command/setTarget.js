'use strict'

Command.cases.setTarget = new CommandSchema({
	name: 'setTarget',
	customParse({ actor }) {
		return [
			{ color: 'actor' },
			{ text: Local.get('command.setTarget') + Token(': ') },
			{ text: Command.parseActor(actor) }
		]
	},
	customLoad({ actor = { type: 'trigger' } }) {
		const write = getElementWriter('setTarget')
		write('actor', actor)
		$('#setTarget-actor').getFocus()
	},
	customSave() {
		Command.save({ actor: getElementReader('setTarget')('actor') })
	}
})
