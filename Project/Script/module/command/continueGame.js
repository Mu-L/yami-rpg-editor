'use strict'
import { Command } from '../../command/command-object.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.continueGame = new CommandSchema({
	name: 'continueGame',
	noWindow: true,
	customParse() {
		return [
			{ color: 'system' },
			{ text: Local.get('command.continueGame') }
		]
	},
	customSave() {
		Command.save({})
	}
})
