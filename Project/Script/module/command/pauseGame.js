import { Command } from '../../command/command-object.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.pauseGame = new CommandSchema({
	name: 'pauseGame',
	noWindow: true,
	customParse() {
		return [{ color: 'system' }, { text: Local.get('command.pauseGame') }]
	},
	customSave() {
		Command.save({})
	}
})
