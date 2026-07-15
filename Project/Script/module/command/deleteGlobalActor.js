'use strict'

Command.cases.deleteGlobalActor = {
	initialize: function () {
		$('#deleteGlobalActor-confirm').on('click', this.save)
	},
	parse: function ({ actorId }) {
		const words = Command.words.push(Command.parseFileName(actorId))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.deleteGlobalActor') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ actorId = '' }) {
		const write = getElementWriter('deleteGlobalActor')
		write('actorId', actorId)
		$('#deleteGlobalActor-actorId').getFocus()
	},
	save: function () {
		const read = getElementReader('deleteGlobalActor')
		const actorId = read('actorId')
		if (actorId === '') {
			return $('#deleteGlobalActor-actorId').getFocus()
		}
		Command.save({ actorId })
	}
}
