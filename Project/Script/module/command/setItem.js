'use strict'

Command.cases.setItem = {
	initialize: function () {
		$('#setItem-confirm').on('click', this.save)

		// 创建操作选项
		$('#setItem-operation').loadItems([
			{ name: 'Increase', value: 'increase' },
			{ name: 'Decrease', value: 'decrease' }
		])
	},
	parse: function ({ item, operation, quantity }) {
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
	load: function ({
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
	save: function () {
		const read = getElementReader('setItem')
		const item = read('item')
		const operation = read('operation')
		switch (operation) {
			case 'increase':
			case 'decrease': {
				const quantity = read('quantity')
				Command.save({ item, operation, quantity })
				break
			}
		}
	}
}
