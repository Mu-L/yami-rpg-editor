import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.removeTarget = new CommandSchema({
	name: 'removeTarget',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'target', default: { type: 'trigger' } }
	],
	customParse({ actor, target }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseActor(target))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.removeTarget') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#removeTarget-actor').getFocus()
	}
})
