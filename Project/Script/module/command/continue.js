'use strict'

Command.cases.continue = {
	parse: function () {
		return [{ color: 'flow' }, { text: Local.get('command.continue') }]
	},
	save: function () {
		Command.save({})
	}
}
