'use strict'

Command.cases.deleteElement = {
	initialize: function () {
		$('#deleteElement-confirm').on('click', this.save)

		// 创建操作选项
		$('#deleteElement-operation').loadItems([
			{ name: 'Delete Element', value: 'delete-element' },
			{ name: 'Delete Children', value: 'delete-children' },
			{ name: 'Delete All', value: 'delete-all' }
		])

		// 设置操作关联元素
		$('#deleteElement-operation')
			.enableHiddenMode()
			.relate([
				{
					case: ['delete-element', 'delete-children'],
					targets: [$('#deleteElement-element')]
				}
			])
	},
	parse: function ({ operation, element }) {
		let info
		switch (operation) {
			case 'delete-element':
				info = Command.parseElement(element)
				break
			case 'delete-children':
				info =
					Command.parseElement(element) +
					Token(' -> ') +
					Local.get('command.deleteElement.children')
				break
			case 'delete-all':
				info = Local.get('command.deleteElement.all-elements')
				break
		}
		return [
			{ color: 'element' },
			{ text: Local.get('command.deleteElement') + Token(': ') },
			{ text: info }
		]
	},
	load: function ({
		operation = 'delete-element',
		element = { type: 'trigger' }
	}) {
		$('#deleteElement-operation').write(operation)
		$('#deleteElement-element').write(element)
		$('#deleteElement-operation').getFocus()
	},
	save: function () {
		const operation = $('#deleteElement-operation').read()
		switch (operation) {
			case 'delete-element':
			case 'delete-children': {
				const element = $('#deleteElement-element').read()
				Command.save({ operation, element })
				break
			}
			case 'delete-all':
				Command.save({ operation })
				break
		}
	}
}
