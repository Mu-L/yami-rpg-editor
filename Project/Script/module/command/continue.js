'use strict'

Command.cases.continue = new CommandSchema({
	name: 'continue',
	noWindow: true,
	customParse() {
		return [{ color: 'flow' }, { text: Local.get('command.continue') }]
	},
	customSave() {
		Command.save({})
	}
})
