'use strict'

Command.cases.deleteGlobalActor = new CommandSchema({
	name: 'deleteGlobalActor',
	fields: [{ key: 'actorId', default: '', required: true }],
	customParse({ actorId }) {
		const words = Command.words.push(Command.parseFileName(actorId))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.deleteGlobalActor') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#deleteGlobalActor-actorId').getFocus()
	}
})
