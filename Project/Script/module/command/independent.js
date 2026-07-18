'use strict'
import { Command } from '../../command/command-object.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.independent = new CommandSchema({
	name: 'independent',
	noWindow: true,
	customParse({ commands }) {
		return [
			{ fold: true },
			{ color: 'flow' },
			{ text: Local.get('command.independent') },
			{ children: commands },
			{ text: Local.get('command.independent.end') }
		]
	},
	customSave() {
		Command.save({ commands: [] })
	}
})
