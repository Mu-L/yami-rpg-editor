'use strict'

Command.cases.pauseGame = new CommandSchema({
	name: 'pauseGame',
	noWindow: true,
	customParse() {
		return [{ color: 'system' }, { text: Local.get('command.pauseGame') }]
	},
	customSave() {
		Command.save({})
	}
})
