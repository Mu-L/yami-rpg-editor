'use strict'

Command.cases.continueGame = new CommandSchema({
	name: 'continueGame',
	noWindow: true,
	customParse() {
		return [
			{ color: 'system' },
			{ text: Local.get('command.continueGame') }
		]
	},
	customSave() {
		Command.save({})
	}
})
