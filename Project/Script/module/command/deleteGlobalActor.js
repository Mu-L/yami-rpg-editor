'use strict'

Command.cases.deleteGlobalActor = new CommandSchema({
	name: 'deleteGlobalActor',
	customParse({ actorId }) {
		const words = Command.words.push(Command.parseFileName(actorId))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.deleteGlobalActor') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({ actorId = '' }) {
		const write = getElementWriter('deleteGlobalActor')
		write('actorId', actorId)
		$('#deleteGlobalActor-actorId').getFocus()
	},
	customSave() {
		const read = getElementReader('deleteGlobalActor')
		const actorId = read('actorId')
		if (actorId === '') {
			return $('#deleteGlobalActor-actorId').getFocus()
		}
		Command.save({ actorId })
	}
})
