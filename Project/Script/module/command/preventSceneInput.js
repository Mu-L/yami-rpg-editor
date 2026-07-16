'use strict'

Command.cases.preventSceneInput = new CommandSchema({
	name: 'preventSceneInput',
	noWindow: true,
	customParse() {
		return [
			{ color: 'system' },
			{ text: Local.get('command.preventSceneInput') }
		]
	},
	customSave() {
		Command.save({})
	}
})
