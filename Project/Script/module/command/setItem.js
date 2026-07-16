'use strict'

Command.cases.setItem = new CommandSchema({
	name: 'setItem',
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
	customLoad({
		item = { type: 'trigger' },
		operation = 'increase',
		quantity = 1
	}) {
		const write = getElementWriter('setItem')
		write('item', item)
		write('operation', operation)
		write('quantity', quantity)
		$('#setItem-item').getFocus()
	},
	customSave() {
		const read = getElementReader('setItem')
		const item = read('item')
		const operation = read('operation')
		switch (operation) {
			case 'increase':
			case 'decrease': {
				Command.save({
					item,
					operation,
					quantity: read('quantity')
				})
				break
			}
		}
	}
})
