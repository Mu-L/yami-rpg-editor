'use strict'

Command.cases.preventSceneInput = {
	parse: function () {
		return [
			{ color: 'system' },
			{ text: Local.get('command.preventSceneInput') }
		]
	},
	save: function () {
		Command.save({})
	}
}
