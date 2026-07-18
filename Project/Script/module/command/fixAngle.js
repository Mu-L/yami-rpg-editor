'use strict'
import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.fixAngle = new CommandSchema({
	name: 'fixAngle',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'fixed', default: true }
	],
	onInitialize() {
		$('#fixAngle-confirm').on('click', () => this.save())
		$('#fixAngle-fixed').loadItems([
			{ name: 'Fixed', value: true },
			{ name: 'Unfixed', value: false }
		])
	},
	customParse({ actor, fixed }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Local.get('command.fixAngle.fixed.' + fixed))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.fixAngle') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#fixAngle-actor').getFocus()
	}
})
