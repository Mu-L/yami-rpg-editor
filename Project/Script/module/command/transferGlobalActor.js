'use strict'

Command.cases.transferGlobalActor = new CommandSchema({
	name: 'transferGlobalActor',
	customParse({ actor, position }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parsePosition(position))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.transferGlobalActor') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({
		actor = { type: 'trigger' },
		position = { type: 'absolute', x: 0, y: 0 }
	}) {
		const write = getElementWriter('transferGlobalActor')
		write('actor', actor)
		write('position', position)
		$('#transferGlobalActor-actor').getFocus('all')
	},
	customSave() {
		const read = getElementReader('transferGlobalActor')
		Command.save({ actor: read('actor'), position: read('position') })
	}
})
