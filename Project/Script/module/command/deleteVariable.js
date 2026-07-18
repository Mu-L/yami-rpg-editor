'use strict'
import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { VariableGetter } from '../../command/variable-accessor-window.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.deleteVariable = new CommandSchema({
	name: 'deleteVariable',
	fields: [{ key: 'variable', default: { type: 'local', key: '' } }],
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
