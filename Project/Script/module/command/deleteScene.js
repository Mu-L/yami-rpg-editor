'use strict'
import { Command } from '../../command/command-object.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.deleteScene = new CommandSchema({
	name: 'deleteScene',
	noWindow: true,
	customParse() {
		return [{ color: 'scene' }, { text: Local.get('command.deleteScene') }]
	},
	customSave() {
		Command.save({})
	}
})
