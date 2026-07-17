'use strict'

Command.cases.setWeight = new CommandSchema({
	name: 'setWeight',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'weight', default: 0 }
	],
	customParse({ actor, weight }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseVariableNumber(weight))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.setWeight') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#setWeight-actor').getFocus()
	}
})
