'use strict'

Command.cases.stopActorAnimation = new CommandSchema({
	name: 'stopActorAnimation',
	customParse({ actor }) {
		return [
			{ color: 'actor' },
			{ text: Local.get('command.stopActorAnimation') + Token(': ') },
			{ text: Command.parseActor(actor) }
		]
	},
	customLoad({ actor = { type: 'trigger' } }) {
		const write = getElementWriter('stopActorAnimation')
		write('actor', actor)
		$('#stopActorAnimation-actor').getFocus()
	},
	customSave() {
		Command.save({ actor: getElementReader('stopActorAnimation')('actor') })
	}
})
