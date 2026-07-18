'use strict'
import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.setPlayerActor = new CommandSchema({
	name: 'setPlayerActor',
	fields: [{ key: 'actor', default: { type: 'trigger' } }],
	customParse({ actor }) {
		return [
			{ color: 'actor' },
			{ text: Local.get('command.setPlayerActor') + Token(': ') },
			{ text: Command.parseActor(actor) }
		]
	},
	onLoad() {
		$('#setPlayerActor-actor').getFocus()
	}
})
