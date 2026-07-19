import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.resetTargets = new CommandSchema({
	name: 'resetTargets',
	fields: [{ key: 'actor', domId: 'actor', default: { type: 'trigger' } }],
	customParse({ actor }) {
		return [
			{ color: 'actor' },
			{ text: Local.get('command.resetTargets') + Token(': ') },
			{ text: Command.parseActor(actor) }
		]
	},
	onLoad() {
		$('#resetTargets-actor').getFocus()
	}
})
