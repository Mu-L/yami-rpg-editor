import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.deleteGlobalActor = new CommandSchema({
	name: 'deleteGlobalActor',
	fields: [{ key: 'actorId', default: '', required: true }],
	customParse({ actorId }) {
		const words = Command.words.push(Command.parseFileName(actorId))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.deleteGlobalActor') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#deleteGlobalActor-actorId').getFocus()
	}
})
