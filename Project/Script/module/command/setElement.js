'use strict'

Command.cases.setElement = {
	initialize: function () {
		$('#setElement-confirm').on('click', this.save)

		// 创建操作选项
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
	parse: function ({ element, operation }) {
		const words = Command.words
			.push(Command.parseElement(element))
			.push(Local.get('command.setElement.' + operation))
		return [
			{ color: 'element' },
			{ text: Local.get('command.setElement.alias') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ element = { type: 'trigger' }, operation = 'hide' }) {
		const write = getElementWriter('setElement')
		write('element', element)
		write('operation', operation)
		$('#setElement-element').getFocus()
	},
	save: function () {
		const read = getElementReader('setElement')
		const element = read('element')
		const operation = read('operation')
		Command.save({ element, operation })
	}
}
