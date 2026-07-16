'use strict'

Command.cases.unloadSubscene = new CommandSchema({
	name: 'unloadSubscene',
	customParse({ sceneId }) {
		return [
			{ color: 'scene' },
			{ text: Local.get('command.unloadSubscene') + Token(': ') },
			{ text: Command.parseVariableFile(sceneId) }
		]
	},
	customLoad({ sceneId = '' }) {
		const write = getElementWriter('unloadSubscene')
		write('sceneId', sceneId)
		$('#unloadSubscene-sceneId').getFocus()
	},
	customSave() {
		const read = getElementReader('unloadSubscene')
		const sceneId = read('sceneId')
		if (sceneId === '') {
			return $('#unloadSubscene-sceneId').getFocus()
		}
		Command.save({ sceneId })
	}
})
