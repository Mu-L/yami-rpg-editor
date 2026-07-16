'use strict'

Command.cases.changeActorAnimation = new CommandSchema({
	name: 'changeActorAnimation',
	customParse({ actor, animationId }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseFileName(animationId))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changeActorAnimation') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({ actor = { type: 'trigger' }, animationId = '' }) {
		const write = getElementWriter('changeActorAnimation')
		write('actor', actor)
		write('animationId', animationId)
		$('#changeActorAnimation-actor').getFocus()
	},
	customSave() {
		const read = getElementReader('changeActorAnimation')
		const actor = read('actor')
		const animationId = read('animationId')
		if (animationId === '') {
			return $('#changeActorAnimation-animationId').getFocus()
		}
		Command.save({ actor, animationId })
	}
})
