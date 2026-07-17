'use strict'

Command.cases.unloadSubscene = new CommandSchema({
	name: 'unloadSubscene',
	fields: [{ key: 'sceneId', default: '', required: true }],
	customParse({ sceneId }) {
		return [
			{ color: 'scene' },
			{ text: Local.get('command.unloadSubscene') + Token(': ') },
			{ text: Command.parseVariableFile(sceneId) }
		]
	},
	onLoad() {
		$('#unloadSubscene-sceneId').getFocus()
	}
})
