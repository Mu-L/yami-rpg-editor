'use strict'
import { Command } from '../../command/command-object.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.reset = new CommandSchema({
	name: 'reset',
	noWindow: true,
	customParse() {
		return [{ color: 'system' }, { text: Local.get('command.reset') }]
	},
	customSave() {
		Command.save({})
	}
})
