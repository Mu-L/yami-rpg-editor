'use strict'

Command.cases.controlDialog = {
	initialize: function () {
		$('#controlDialog-confirm').on('click', this.save)

		// 创建操作选项
		$('#controlDialog-operation').loadItems([
			{ name: 'Pause Printing', value: 'pause' },
			{ name: 'Continue Printing', value: 'continue' },
			{ name: 'Print Immediately', value: 'print-immediately' },
			{ name: 'Print Next Page', value: 'print-next-page' }
		])
	},
	parse: function ({ element, operation }) {
		const words = Command.words
			.push(Command.parseElement(element))
			.push(Local.get('command.controlDialog.' + operation))
		return [
			{ color: 'element' },
			{ text: Local.get('command.controlDialog') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ element = { type: 'trigger' }, operation = 'pause' }) {
		const write = getElementWriter('controlDialog')
		write('element', element)
		write('operation', operation)
		$('#controlDialog-element').getFocus()
	},
	save: function () {
		const read = getElementReader('controlDialog')
		const element = read('element')
		const operation = read('operation')
		Command.save({ element, operation })
	}
}
