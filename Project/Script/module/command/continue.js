'use strict'
import { Command } from '../../command/command-object.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.continue = new CommandSchema({
	name: 'continue',
	noWindow: true,
	customParse() {
		return [{ color: 'flow' }, { text: Local.get('command.continue') }]
	},
	customSave() {
		Command.save({})
	}
})
