import { Command } from '../../command/command-object.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.preventSceneInput = new CommandSchema({
	name: 'preventSceneInput',
	noWindow: true,
	customParse() {
		return [
			{ color: 'system' },
			{ text: Local.get('command.preventSceneInput') }
		]
	},
	customSave() {
		Command.save({})
	}
})
