import { $, getElementReader } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.setFocus = new CommandSchema({
	name: 'setFocus',
	onInitialize() {
		$('#setFocus-confirm').on('click', () => this.save())
		$('#setFocus-operation').loadItems([
			{ name: 'Add Focus', value: 'add' },
			{ name: 'Remove Focus', value: 'remove' },
			{ name: 'Remove The Latest Focus', value: 'remove-latest' },
			{ name: 'Reset', value: 'reset' }
		])
		$('#setFocus-mode').loadItems([
			{ name: 'Control Child Buttons', value: 'control-child-buttons' },
			{
				name: 'Control Descendant Buttons',
				value: 'control-descendant-buttons'
			}
		])
		$('#setFocus-operation')
			.enableHiddenMode()
			.relate([
				{
					case: 'add',
					targets: [
						$('#setFocus-element'),
						$('#setFocus-mode'),
						$('#setFocus-cancelable')
					]
				},
				{ case: 'remove', targets: [$('#setFocus-element')] }
			])
	},
	customParse({ operation, element, mode, cancelable }) {
		const words = Command.words.push(
			Local.get('command.setFocus.' + operation)
		)
		switch (operation) {
			case 'add':
				if (mode === undefined) {
					mode = 'control-child-buttons'
				}
				words.push(Command.parseElement(element))
				words.push(Local.get('command.setFocus.' + mode))
				if (cancelable) {
					words.push(Local.get('command.setFocus.cancelable'))
				}
				break
			case 'remove':
				words.push(Command.parseElement(element))
				break
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setFocus') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({
		operation = 'add',
		element = { type: 'trigger' },
		mode = 'control-child-buttons',
		cancelable = true
	}) {
		$('#setFocus-operation').write(operation)
		$('#setFocus-element').write(element)
		$('#setFocus-mode').write(mode)
		$('#setFocus-cancelable').write(cancelable)
		$('#setFocus-operation').getFocus()
	},
	customSave() {
		const read = getElementReader('setFocus')
		const operation = read('operation')
		switch (operation) {
			case 'add': {
				Command.save({
					operation,
					element: read('element'),
					mode: read('mode'),
					cancelable: read('cancelable')
				})
				break
			}
			case 'remove': {
				Command.save({ operation, element: read('element') })
				break
			}
			case 'remove-latest':
			case 'reset':
				Command.save({ operation })
				break
		}
	}
})
