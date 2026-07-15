'use strict'

Command.cases.break = {
	parse: function () {
		return [{ color: 'flow' }, { text: Local.get('command.break') }]
	},
	save: function () {
		Command.save({})
	}
}
