'use strict'

Command.cases.reset = new CommandSchema({
	name: 'reset',
	noWindow: true,
	customParse() {
		return [{ color: 'system' }, { text: Local.get('command.reset') }]
	},
	customSave() {
		Command.save({})
	}
})
