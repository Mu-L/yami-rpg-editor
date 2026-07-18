'use strict'
import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.controlDialog = new CommandSchema({
	name: 'controlDialog',
	fields: [
		{ key: 'element', default: { type: 'trigger' } },
		{ key: 'operation', default: 'pause' }
	],
	onInitialize() {
		$('#controlDialog-confirm').on('click', () => this.save())
		$('#controlDialog-operation').loadItems([
			{ name: 'Pause Printing', value: 'pause' },
			{ name: 'Continue Printing', value: 'continue' },
			{ name: 'Print Immediately', value: 'print-immediately' },
			{ name: 'Print Next Page', value: 'print-next-page' }
		])
	},
	customParse({ element, operation }) {
		const words = Command.words
			.push(Command.parseElement(element))
			.push(Local.get('command.controlDialog.' + operation))
		return [
			{ color: 'element' },
			{ text: Local.get('command.controlDialog') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#controlDialog-element').getFocus()
	}
})
