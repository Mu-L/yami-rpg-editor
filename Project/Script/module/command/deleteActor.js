'use strict'

Command.cases.deleteActor = new CommandSchema({
	name: 'deleteActor',
	customParse({ actor }) {
		return [
			{ color: 'actor' },
			{ text: Local.get('command.deleteActor') + Token(': ') },
			{ text: Command.parseActor(actor) }
		]
	},
	customLoad({ actor = { type: 'trigger' } }) {
		const write = getElementWriter('deleteActor')
		write('actor', actor)
		$('#deleteActor-actor').getFocus()
	},
	customSave() {
		Command.save({ actor: getElementReader('deleteActor')('actor') })
	}
})
