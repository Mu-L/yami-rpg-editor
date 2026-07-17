'use strict'

Command.cases.setPlayerActor = new CommandSchema({
	name: 'setPlayerActor',
	fields: [{ key: 'actor', default: { type: 'trigger' } }],
	customParse({ actor }) {
		return [
			{ color: 'actor' },
			{ text: Local.get('command.setPlayerActor') + Token(': ') },
			{ text: Command.parseActor(actor) }
		]
	},
	onLoad() {
		$('#setPlayerActor-actor').getFocus()
	}
})
