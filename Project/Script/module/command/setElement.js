'use strict'

Command.cases.setElement = new CommandSchema({
	name: 'setElement',
	onInitialize() {
		$('#setElement-confirm').on('click', () => this.save())
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
	customParse({ element, operation }) {
		const words = Command.words
			.push(Command.parseElement(element))
			.push(Local.get('command.setElement.' + operation))
		return [
			{ color: 'element' },
			{ text: Local.get('command.setElement.alias') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({ element = { type: 'trigger' }, operation = 'hide' }) {
		const write = getElementWriter('setElement')
		write('element', element)
		write('operation', operation)
		$('#setElement-element').getFocus()
	},
	customSave() {
		const read = getElementReader('setElement')
		Command.save({
			element: read('element'),
			operation: read('operation')
		})
	}
})
