'use strict'

Command.cases.deleteScene = {
	parse: function () {
		return [{ color: 'scene' }, { text: Local.get('command.deleteScene') }]
	},
	save: function () {
		Command.save({})
	}
}
