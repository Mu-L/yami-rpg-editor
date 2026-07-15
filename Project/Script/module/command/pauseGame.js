'use strict'

Command.cases.pauseGame = {
	parse: function () {
		return [{ color: 'system' }, { text: Local.get('command.pauseGame') }]
	},
	save: function () {
		Command.save({})
	}
}
