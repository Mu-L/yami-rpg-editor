'use strict'
import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.setElement = new CommandSchema({
	name: 'setElement',
	fields: [
		{ key: 'element', default: { type: 'trigger' } },
		{ key: 'operation', default: 'hide' }
	],
	onInitialize() {
		$('#setElement-confirm').on('click', () => this.save())
		$('#setElement-operation').loadItems([
			{ name: 'Hide', value: 'hide' },
			{ name: 'Show', value: 'show' },
			{ name: 'Disable Pointer Events', value: 'disable-pointer-events' },
			{ name: 'Enable Pointer Events', value: 'enable-pointer-events' },
			{ name: 'Skip Pointer Events', value: 'skip-pointer-events' },
			{ name: 'Move to First', value: 'move-to-first' },
			{ name: 'Move to Last', value: 'move-to-last' }
		])
	},
	customParse({ element, operation }) {
		const words = Command.words
			.push(Command.parseElement(element))
			.push(Local.get('command.setElement.' + operation))
		return [
			{ color: 'element' },
			{ text: Local.get('command.setElement.alias') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#setElement-element').getFocus()
	}
})
