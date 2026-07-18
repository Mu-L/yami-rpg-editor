'use strict'
import { Command } from '../../command/command-object.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.break = new CommandSchema({
	name: 'break',
	noWindow: true,
	customParse() {
		return [{ color: 'flow' }, { text: Local.get('command.break') }]
	},
	customSave() {
		Command.save({})
	}
})
