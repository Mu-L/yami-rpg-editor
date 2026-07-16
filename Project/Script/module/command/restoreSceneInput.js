'use strict'

Command.cases.restoreSceneInput = new CommandSchema({
	name: 'restoreSceneInput',
	noWindow: true,
	customParse() {
		return [
			{ color: 'system' },
			{ text: Local.get('command.restoreSceneInput') }
		]
	},
	customSave() {
		Command.save({})
	}
})
