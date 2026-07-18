'use strict'
import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.transferGlobalActor = new CommandSchema({
	name: 'transferGlobalActor',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'position', default: { type: 'absolute', x: 0, y: 0 } }
	],
	customParse({ actor, position }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parsePosition(position))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.transferGlobalActor') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#transferGlobalActor-actor').getFocus('all')
	}
})
