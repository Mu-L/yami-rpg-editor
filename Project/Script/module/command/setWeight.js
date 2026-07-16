'use strict'

Command.cases.setWeight = new CommandSchema({
	name: 'setWeight',
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
	customLoad({ actor = { type: 'trigger' }, weight = 0 }) {
		const write = getElementWriter('setWeight')
		write('actor', actor)
		write('weight', weight)
		$('#setWeight-actor').getFocus()
	},
	customSave() {
		const read = getElementReader('setWeight')
		Command.save({ actor: read('actor'), weight: read('weight') })
	}
})
