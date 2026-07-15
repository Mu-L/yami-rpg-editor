'use strict'

Command.cases.unloadSubscene = {
	initialize: function () {
		$('#unloadSubscene-confirm').on('click', this.save)
	},
	parse: function ({ sceneId }) {
		return [
			{ color: 'scene' },
			{ text: Local.get('command.unloadSubscene') + Token(': ') },
			{ text: Command.parseVariableFile(sceneId) }
		]
	},
	load: function ({ sceneId = '' }) {
		const write = getElementWriter('unloadSubscene')
		write('sceneId', sceneId)
		$('#unloadSubscene-sceneId').getFocus()
	},
	save: function () {
		const read = getElementReader('unloadSubscene')
		const sceneId = read('sceneId')
		if (sceneId === '') {
			return $('#unloadSubscene-sceneId').getFocus()
		}
		Command.save({ sceneId })
	}
}
