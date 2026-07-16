'use strict'

Command.cases.break = new CommandSchema({
	name: 'break',
	noWindow: true,
	customParse() {
		return [{ color: 'flow' }, { text: Local.get('command.break') }]
	},
	customSave() {
		Command.save({})
	}
})
