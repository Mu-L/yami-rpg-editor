'use strict'

Command.cases.independent = {
	parse: function ({ commands }) {
		return [
			{ fold: true },
			{ color: 'flow' },
			{ text: Local.get('command.independent') },
			{ children: commands },
			{ text: Local.get('command.independent.end') }
		]
	},
	save: function () {
		Command.save({ commands: [] })
	}
}
