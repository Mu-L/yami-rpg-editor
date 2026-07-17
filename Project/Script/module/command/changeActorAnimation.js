'use strict'

Command.cases.changeActorAnimation = new CommandSchema({
	name: 'changeActorAnimation',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'animationId', default: '', required: true }
	],
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
	onLoad() {
		$('#changeActorAnimation-actor').getFocus()
	}
})
