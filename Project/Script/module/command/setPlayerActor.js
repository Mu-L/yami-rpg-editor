'use strict'

Command.cases.setPlayerActor = new CommandSchema({
	name: 'setPlayerActor',
	customParse({ actor }) {
		return [
			{ color: 'actor' },
			{ text: Local.get('command.setPlayerActor') + Token(': ') },
			{ text: Command.parseActor(actor) }
		]
	},
	customLoad({ actor = { type: 'trigger' } }) {
		const write = getElementWriter('setPlayerActor')
		write('actor', actor)
		$('#setPlayerActor-actor').getFocus()
	},
	customSave() {
		Command.save({ actor: getElementReader('setPlayerActor')('actor') })
	}
})
