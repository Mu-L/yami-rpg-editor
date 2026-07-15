'use strict'

Command.cases.continueGame = {
	parse: function () {
		return [
			{ color: 'system' },
			{ text: Local.get('command.continueGame') }
		]
	},
	save: function () {
		Command.save({})
	}
}
