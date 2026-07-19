import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.setPointerEventRoot = new CommandSchema({
	name: 'setPointerEventRoot',
	onInitialize() {
		$('#setPointerEventRoot-confirm').on('click', () => this.save())
		$('#setPointerEventRoot-operation').loadItems([
			{ name: 'Add Root Element', value: 'add' },
			{ name: 'Remove Root Element', value: 'remove' },
			{ name: 'Remove The Latest Root Element', value: 'remove-latest' },
			{ name: 'Reset', value: 'reset' }
		])
		$('#setPointerEventRoot-operation')
			.enableHiddenMode()
			.relate([
				{
					case: ['add', 'remove'],
					targets: [$('#setPointerEventRoot-element')]
				}
			])
	},
	customParse({ operation, element }) {
		if (operation === 'set') {
			operation = 'add'
		}
		const words = Command.words.push(
			Local.get('command.setPointerEventRoot.' + operation)
		)
		switch (operation) {
			case 'add':
			case 'remove':
				words.push(Command.parseElement(element))
				break
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.setPointerEventRoot') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({ operation = 'add', element = { type: 'trigger' } }) {
		if (operation === 'set') {
			operation = 'add'
		}
		$('#setPointerEventRoot-operation').write(operation)
		$('#setPointerEventRoot-element').write(element)
		$('#setPointerEventRoot-operation').getFocus()
	},
	customSave() {
		const operation = $('#setPointerEventRoot-operation').read()
		switch (operation) {
			case 'add':
			case 'remove': {
				const element = $('#setPointerEventRoot-element').read()
				Command.save({ operation, element })
				break
			}
			case 'remove-latest':
			case 'reset':
				Command.save({ operation })
				break
		}
	}
})
