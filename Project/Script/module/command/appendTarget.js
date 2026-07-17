'use strict'

Command.cases.appendTarget = new CommandSchema({
	name: 'appendTarget',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'target', default: { type: 'trigger' } }
	],
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
	onLoad() {
		$('#appendTarget-actor').getFocus()
	}
})
