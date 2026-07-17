'use strict'

Command.cases.stopActorAnimation = new CommandSchema({
	name: 'stopActorAnimation',
	fields: [{ key: 'actor', default: { type: 'trigger' } }],
	customParse({ actor }) {
		return [
			{ color: 'actor' },
			{ text: Local.get('command.stopActorAnimation') + Token(': ') },
			{ text: Command.parseActor(actor) }
		]
	},
	onLoad() {
		$('#stopActorAnimation-actor').getFocus()
	}
})
