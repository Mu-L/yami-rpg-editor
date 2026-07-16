'use strict'

Command.cases.controlDialog = new CommandSchema({
	name: 'controlDialog',
	onInitialize() {
		$('#controlDialog-confirm').on('click', () => this.save())
		$('#controlDialog-operation').loadItems([
			{ name: 'Pause Printing', value: 'pause' },
			{ name: 'Continue Printing', value: 'continue' },
			{ name: 'Print Immediately', value: 'print-immediately' },
			{ name: 'Print Next Page', value: 'print-next-page' }
		])
	},
	customParse({ element, operation }) {
		const words = Command.words
			.push(Command.parseElement(element))
			.push(Local.get('command.controlDialog.' + operation))
		return [
			{ color: 'element' },
			{ text: Local.get('command.controlDialog') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({ element = { type: 'trigger' }, operation = 'pause' }) {
		const write = getElementWriter('controlDialog')
		write('element', element)
		write('operation', operation)
		$('#controlDialog-element').getFocus()
	},
	customSave() {
		const read = getElementReader('controlDialog')
		Command.save({
			element: read('element'),
			operation: read('operation')
		})
	}
})
