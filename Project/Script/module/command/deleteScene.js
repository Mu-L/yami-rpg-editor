'use strict'

Command.cases.deleteScene = new CommandSchema({
	name: 'deleteScene',
	noWindow: true,
	customParse() {
		return [{ color: 'scene' }, { text: Local.get('command.deleteScene') }]
	},
	customSave() {
		Command.save({})
	}
})
