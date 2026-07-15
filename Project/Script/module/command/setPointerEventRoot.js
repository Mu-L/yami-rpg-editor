'use strict'

Command.cases.setPointerEventRoot = {
	initialize: function () {
		$('#setPointerEventRoot-confirm').on('click', this.save)

		// 创建操作选项
		$('#setPointerEventRoot-operation').loadItems([
			{ name: 'Add Root Element', value: 'add' },
			{ name: 'Remove Root Element', value: 'remove' },
			{ name: 'Remove The Latest Root Element', value: 'remove-latest' },
			{ name: 'Reset', value: 'reset' }
		])

		// 设置操作关联元素
		$('#setPointerEventRoot-operation')
			.enableHiddenMode()
			.relate([
				{
					case: ['add', 'remove'],
					targets: [$('#setPointerEventRoot-element')]
				}
			])
	},
	parse: function ({ operation, element }) {
		// 补丁：2023-3-19
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
	load: function ({ operation = 'add', element = { type: 'trigger' } }) {
		// 补丁：2023-3-19
		if (operation === 'set') {
			operation = 'add'
		}
		$('#setPointerEventRoot-operation').write(operation)
		$('#setPointerEventRoot-element').write(element)
		$('#setPointerEventRoot-operation').getFocus()
	},
	save: function () {
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
}
