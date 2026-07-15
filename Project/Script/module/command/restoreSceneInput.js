'use strict'

Command.cases.restoreSceneInput = {
	parse: function () {
		return [
			{ color: 'system' },
			{ text: Local.get('command.restoreSceneInput') }
		]
	},
	save: function () {
		Command.save({})
	}
}
