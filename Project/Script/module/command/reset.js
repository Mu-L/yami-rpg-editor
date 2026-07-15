'use strict'

Command.cases.reset = {
	parse: function () {
		return [{ color: 'system' }, { text: Local.get('command.reset') }]
	},
	save: function () {
		Command.save({})
	}
}
