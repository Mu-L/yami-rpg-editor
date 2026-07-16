'use strict'

Command.cases.resetTargets = new CommandSchema({
	name: 'resetTargets',
	fields: [{ key: 'actor', domId: 'actor', default: { type: 'trigger' } }],
	customParse({ actor }) {
		return [
			{ color: 'actor' },
			{ text: Local.get('command.resetTargets') + Token(': ') },
			{ text: Command.parseActor(actor) }
		]
	},
	onLoad() {
		$('#resetTargets-actor').getFocus()
	}
})
