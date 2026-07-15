'use strict'

Command.cases.unclampCamera = {
	parse: function () {
		return [
			{ color: 'scene' },
			{ text: Local.get('command.unclampCamera') }
		]
	},
	save: function () {
		Command.save({})
	}
}
