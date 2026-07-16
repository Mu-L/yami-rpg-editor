'use strict'

Command.cases.relaunchApp = new CommandSchema({
	name: 'relaunchApp',
	noWindow: true,
	customParse() {
		return [{ color: 'system' }, { text: Local.get('command.relaunchApp') }]
	},
	customSave() {
		Command.save({})
	}
})
