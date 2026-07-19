import { Command } from '../../command/command-object.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.restoreSceneInput = new CommandSchema({
	name: 'restoreSceneInput',
	noWindow: true,
	customParse() {
		return [
			{ color: 'system' },
			{ text: Local.get('command.restoreSceneInput') }
		]
	},
	customSave() {
		Command.save({})
	}
})
