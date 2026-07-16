'use strict'

Command.cases.unclampCamera = new CommandSchema({
	name: 'unclampCamera',
	noWindow: true,
	customParse() {
		return [
			{ color: 'scene' },
			{ text: Local.get('command.unclampCamera') }
		]
	},
	customSave() {
		Command.save({})
	}
})
