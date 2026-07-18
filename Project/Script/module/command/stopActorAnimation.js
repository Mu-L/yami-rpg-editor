'use strict'
import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.stopActorAnimation = new CommandSchema({
	name: 'stopActorAnimation',
	fields: [{ key: 'actor', default: { type: 'trigger' } }],
	customParse({ actor }) {
		return [
			{ color: 'actor' },
			{ text: Local.get('command.stopActorAnimation') + Token(': ') },
			{ text: Command.parseActor(actor) }
		]
	},
	onLoad() {
		$('#stopActorAnimation-actor').getFocus()
	}
})
