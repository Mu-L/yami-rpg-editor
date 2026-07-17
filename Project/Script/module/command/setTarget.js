'use strict'

Command.cases.setTarget = new CommandSchema({
	name: 'setTarget',
	fields: [{ key: 'actor', default: { type: 'trigger' } }],
	customParse({ actor }) {
		return [
			{ color: 'actor' },
			{ text: Local.get('command.setTarget') + Token(': ') },
			{ text: Command.parseActor(actor) }
		]
	},
	onLoad() {
		$('#setTarget-actor').getFocus()
	}
})
