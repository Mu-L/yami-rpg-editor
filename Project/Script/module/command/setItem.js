import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.setItem = new CommandSchema({
	name: 'setItem',
	fields: [
		{ key: 'item', default: { type: 'trigger' } },
		{ key: 'operation', default: 'increase' },
		{ key: 'quantity', default: 1 }
	],
	onInitialize() {
		$('#setItem-confirm').on('click', () => this.save())
		$('#setItem-operation').loadItems([
			{ name: 'Increase', value: 'increase' },
			{ name: 'Decrease', value: 'decrease' }
		])
	},
	customParse({ item, operation, quantity }) {
		const words = Command.words
			.push(Command.parseItem(item))
			.push(Local.get('command.setItem.' + operation))
		switch (operation) {
			case 'increase':
			case 'decrease':
				words.push(Command.parseVariableNumber(quantity))
				break
		}
		return [
			{ color: 'inventory' },
			{ text: Local.get('command.setItem') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#setItem-item').getFocus()
	}
})
