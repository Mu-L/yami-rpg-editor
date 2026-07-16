'use strict'

Command.cases.resetTargets = new CommandSchema({
	name: 'resetTargets',
	customParse({ actor }) {
		return [
			{ color: 'actor' },
			{ text: Local.get('command.resetTargets') + Token(': ') },
			{ text: Command.parseActor(actor) }
		]
	},
	customLoad({ actor = { type: 'trigger' } }) {
		const write = getElementWriter('resetTargets')
		write('actor', actor)
		$('#resetTargets-actor').getFocus()
	},
	customSave() {
		Command.save({ actor: getElementReader('resetTargets')('actor') })
	}
})
