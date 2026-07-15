'use strict'

Command.cases.deleteVariable = {
	initialize: function () {
		$('#deleteVariable-confirm').on('click', this.save)
	},
	parse: function ({ variable }) {
		return [
			{ color: 'variable' },
			{ text: Local.get('command.deleteVariable.alias') + ' ' },
			{ color: 'restore' },
			{ text: Command.parseVariable(variable, 'any') }
		]
	},
	load: function ({ variable = { type: 'local', key: '' } }) {
		$('#deleteVariable-variable').write(variable)
		$('#deleteVariable-variable').getFocus()
	},
	save: function () {
		const elVariable = $('#deleteVariable-variable')
		const variable = elVariable.read()
		if (VariableGetter.isNone(variable)) {
			return elVariable.getFocus()
		}
		Command.save({ variable })
	}
}
