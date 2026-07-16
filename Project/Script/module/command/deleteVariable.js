'use strict'

Command.cases.deleteVariable = new CommandSchema({
	name: 'deleteVariable',
	customParse({ variable }) {
		return [
			{ color: 'variable' },
			{ text: Local.get('command.deleteVariable.alias') + ' ' },
			{ color: 'restore' },
			{ text: Command.parseVariable(variable, 'any') }
		]
	},
	customLoad({ variable = { type: 'local', key: '' } }) {
		$('#deleteVariable-variable').write(variable)
		$('#deleteVariable-variable').getFocus()
	},
	customSave() {
		const elVariable = $('#deleteVariable-variable')
		const variable = elVariable.read()
		if (VariableGetter.isNone(variable)) {
			return elVariable.getFocus()
		}
		Command.save({ variable })
	}
})
