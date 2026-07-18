'use strict'
import { Command } from '../../command/command-object.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.relaunchApp = new CommandSchema({
	name: 'relaunchApp',
	noWindow: true,
	customParse() {
		return [{ color: 'system' }, { text: Local.get('command.relaunchApp') }]
	},
	customSave() {
		Command.save({})
	}
})
