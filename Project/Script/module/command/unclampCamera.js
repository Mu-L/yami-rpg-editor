import { Command } from '../../command/command-object.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.unclampCamera = new CommandSchema({
	name: 'unclampCamera',
	noWindow: true,
	customParse() {
		return [
			{ color: 'scene' },
			{ text: Local.get('command.unclampCamera') }
		]
	},
	customSave() {
		Command.save({})
	}
})
